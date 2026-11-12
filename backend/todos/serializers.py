from django.db import transaction
from rest_framework import serializers

from .models import Category, Todo, TodoCategory


class CategorySerializer(serializers.ModelSerializer):
    todo_count = serializers.IntegerField(read_only=True, required=False)
    color = serializers.RegexField(
        r'^#[0-9A-Fa-f]{6}$',
        required=False,
        error_messages={'invalid': 'カラーは #RRGGBB 形式で指定してください。'},
    )

    class Meta:
        model = Category
        fields = ['id', 'name', 'color', 'todo_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError('カテゴリ名を入力してください。')
        user = self.context['request'].user
        qs = Category.objects.filter(user=user, name=value)
        if self.instance is not None:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError('同じ名前のカテゴリが既に存在します。')
        return value

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class TodoSerializer(serializers.ModelSerializer):
    """Todo の取得・作成・更新すべてに使うシリアライザー"""

    categories = serializers.SerializerMethodField()
    category_ids = serializers.ListField(
        child=serializers.UUIDField(), write_only=True, required=False
    )

    class Meta:
        model = Todo
        fields = [
            'id', 'name', 'description', 'completed', 'order_index',
            'priority', 'due_date', 'completed_at', 'created_at', 'updated_at',
            'categories', 'category_ids',
        ]
        read_only_fields = ['id', 'order_index', 'completed_at', 'created_at', 'updated_at']

    def get_categories(self, obj):
        # prefetch_related('todo_categories__category') と組み合わせて N+1 を防ぐ
        return CategorySerializer(
            [tc.category for tc in obj.todo_categories.all()], many=True, context=self.context
        ).data

    def validate_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError('タスク名を入力してください。')
        return value

    def validate_category_ids(self, value):
        user = self.context['request'].user
        ids = list(dict.fromkeys(value))  # 重複を除去（順序は維持）
        found = Category.objects.filter(user=user, id__in=ids).count()
        if found != len(ids):
            raise serializers.ValidationError('存在しないカテゴリが含まれています。')
        return ids

    def _set_categories(self, todo, category_ids):
        TodoCategory.objects.filter(todo=todo).delete()
        TodoCategory.objects.bulk_create(
            [TodoCategory(todo=todo, category_id=cid) for cid in category_ids]
        )

    @transaction.atomic
    def create(self, validated_data):
        category_ids = validated_data.pop('category_ids', [])
        todo = super().create(validated_data)
        self._set_categories(todo, category_ids)
        return todo

    @transaction.atomic
    def update(self, instance, validated_data):
        category_ids = validated_data.pop('category_ids', None)
        todo = super().update(instance, validated_data)
        if category_ids is not None:
            self._set_categories(todo, category_ids)
        return todo


class TodoReorderItemSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    order_index = serializers.IntegerField(min_value=0)


class TodoReorderSerializer(serializers.Serializer):
    todo_orders = TodoReorderItemSerializer(many=True)


class TodoBulkUpdateSerializer(serializers.Serializer):
    """複数のTodoを一括更新"""
    todo_ids = serializers.ListField(child=serializers.UUIDField(), allow_empty=False)
    action = serializers.ChoiceField(choices=['complete', 'incomplete', 'delete'])


class TodoStatsSerializer(serializers.Serializer):
    """Todo統計情報"""
    total_todos = serializers.IntegerField()
    completed_todos = serializers.IntegerField()
    pending_todos = serializers.IntegerField()
    completion_rate = serializers.FloatField()
    overdue_todos = serializers.IntegerField()
    due_today_todos = serializers.IntegerField()
    today_completed = serializers.IntegerField()
    week_completed = serializers.IntegerField()
    categories_stats = serializers.DictField()
