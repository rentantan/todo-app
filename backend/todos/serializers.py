from rest_framework import serializers
from .models import Todo, Category, TodoCategory

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'color', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class TodoSerializer(serializers.ModelSerializer):
    categories = CategorySerializer(many=True, read_only=True, source='todo_categories.category')
    category_ids = serializers.ListField(
        child=serializers.UUIDField(), write_only=True, required=False
    )

    class Meta:
        model = Todo
        fields = [
            'id', 'name', 'description', 'completed', 'order_index',
            'priority', 'due_date', 'completed_at', 'created_at', 'updated_at',
            'categories', 'category_ids'
        ]
        read_only_fields = ['id', 'completed_at', 'created_at', 'updated_at']

    def create(self, validated_data):
        category_ids = validated_data.pop('category_ids', [])
        validated_data['user'] = self.context['request'].user
        todo = super().create(validated_data)
        
        # カテゴリの関連付け
        for category_id in category_ids:
            try:
                category = Category.objects.get(id=category_id, user=todo.user)
                TodoCategory.objects.create(todo=todo, category=category)
            except Category.DoesNotExist:
                pass
        
        return todo

    def update(self, instance, validated_data):
        category_ids = validated_data.pop('category_ids', None)
        todo = super().update(instance, validated_data)
        
        # カテゴリの更新
        if category_ids is not None:
            # 既存のカテゴリ関連を削除
            TodoCategory.objects.filter(todo=todo).delete()
            
            # 新しいカテゴリ関連を作成
            for category_id in category_ids:
                try:
                    category = Category.objects.get(id=category_id, user=todo.user)
                    TodoCategory.objects.create(todo=todo, category=category)
                except Category.DoesNotExist:
                    pass
        
        return todo

class TodoCreateSerializer(serializers.ModelSerializer):
    category_ids = serializers.ListField(
        child=serializers.UUIDField(), write_only=True, required=False
    )

    class Meta:
        model = Todo
        fields = ['name', 'description', 'priority', 'due_date', 'category_ids']

class TodoUpdateSerializer(serializers.ModelSerializer):
    category_ids = serializers.ListField(
        child=serializers.UUIDField(), write_only=True, required=False
    )

    class Meta:
        model = Todo
        fields = ['name', 'description', 'completed', 'priority', 'due_date', 'category_ids']

class TodoReorderSerializer(serializers.Serializer):
    todo_orders = serializers.ListField(
        child=serializers.DictField(child=serializers.CharField())
    )

    def validate_todo_orders(self, value):
        """todo_ordersの形式を検証"""
        for item in value:
            if 'id' not in item or 'order_index' not in item:
                raise serializers.ValidationError("各アイテムには'id'と'order_index'が必要です。")
            try:
                int(item['order_index'])
            except (ValueError, TypeError):
                raise serializers.ValidationError("order_indexは整数である必要があります。")
        return value

class TodoBulkUpdateSerializer(serializers.Serializer):
    """複数のTodoを一括更新"""
    todo_ids = serializers.ListField(child=serializers.UUIDField())
    action = serializers.ChoiceField(choices=['complete', 'incomplete', 'delete'])

class TodoStatsSerializer(serializers.Serializer):
    """Todo統計情報"""
    total_todos = serializers.IntegerField()
    completed_todos = serializers.IntegerField()
    pending_todos = serializers.IntegerField()
    completion_rate = serializers.FloatField()
    overdue_todos = serializers.IntegerField()
    today_completed = serializers.IntegerField()
    week_completed = serializers.IntegerField()
    categories_stats = serializers.DictField()