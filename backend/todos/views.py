from django.db import transaction
from django.db.models import Count, Max
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.filters import OrderingFilter, SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.response import Response

from .filters import TodoFilter
from .models import Category, Todo
from .serializers import (
    CategorySerializer,
    TodoBulkUpdateSerializer,
    TodoReorderSerializer,
    TodoSerializer,
    TodoStatsSerializer,
)
from .stats import compute_todo_stats


def user_todos(user):
    return Todo.objects.filter(user=user).prefetch_related('todo_categories__category')


class TodoListCreateView(generics.ListCreateAPIView):
    """Todo一覧取得・作成"""
    serializer_class = TodoSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = TodoFilter
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'updated_at', 'due_date', 'priority', 'order_index']
    ordering = ['order_index', '-created_at']

    def get_queryset(self):
        return user_todos(self.request.user)

    def perform_create(self, serializer):
        # 新しいタスクはリストの末尾に追加する
        max_order = Todo.objects.filter(user=self.request.user).aggregate(
            max_order=Max('order_index')
        )['max_order']
        next_order = 0 if max_order is None else max_order + 1
        serializer.save(user=self.request.user, order_index=next_order)


class TodoDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Todo詳細取得・更新・削除"""
    serializer_class = TodoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return user_todos(self.request.user)


@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def toggle_todo(request, pk):
    """Todo完了状態切り替え"""
    todo = user_todos(request.user).filter(pk=pk).first()
    if todo is None:
        return Response({'error': 'Todoが見つかりません。'}, status=status.HTTP_404_NOT_FOUND)
    todo.completed = not todo.completed
    todo.save()
    return Response(TodoSerializer(todo, context={'request': request}).data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def reorder_todos(request):
    """Todo並び替え"""
    serializer = TodoReorderSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    orders = {item['id']: item['order_index'] for item in serializer.validated_data['todo_orders']}
    todos = list(Todo.objects.filter(user=request.user, id__in=orders.keys()))
    for todo in todos:
        todo.order_index = orders[todo.id]
    Todo.objects.bulk_update(todos, ['order_index'])

    return Response({'message': '並び順を更新しました。', 'updated': len(todos)})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def bulk_update_todos(request):
    """Todo一括操作"""
    serializer = TodoBulkUpdateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    action = serializer.validated_data['action']
    todos = Todo.objects.filter(id__in=serializer.validated_data['todo_ids'], user=request.user)

    with transaction.atomic():
        if action == 'complete':
            count = todos.filter(completed=False).update(completed=True, completed_at=timezone.now())
            message = f'{count}件のTodoを完了にしました。'
        elif action == 'incomplete':
            count = todos.filter(completed=True).update(completed=False, completed_at=None)
            message = f'{count}件のTodoを未完了にしました。'
        else:
            # delete() の総数には連動削除された TodoCategory も含まれるため、Todo の件数だけを取り出す
            count = todos.delete()[1].get(Todo._meta.label, 0)
            message = f'{count}件のTodoを削除しました。'

    return Response({'message': message, 'count': count})


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def clear_completed_todos(request):
    """完了済みTodo一括削除"""
    _, per_model = Todo.objects.filter(user=request.user, completed=True).delete()
    deleted_count = per_model.get(Todo._meta.label, 0)
    return Response({'message': f'{deleted_count}件の完了済みTodoを削除しました。', 'count': deleted_count})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def todo_stats(request):
    """Todo統計情報"""
    return Response(TodoStatsSerializer(compute_todo_stats(request.user)).data)


class CategoryListCreateView(generics.ListCreateAPIView):
    """カテゴリ一覧取得・作成"""
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user).annotate(
            todo_count=Count('todo_categories')
        ).order_by('name')


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """カテゴリ詳細取得・更新・削除"""
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user).annotate(
            todo_count=Count('todo_categories')
        )
