from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Q, Count
from django.utils import timezone
from datetime import timedelta
from todos.models import Todo 
from django.db import models 
from .models import Todo, Category
from .serializers import (
    TodoSerializer,
    TodoCreateSerializer,
    TodoUpdateSerializer,
    TodoReorderSerializer,
    TodoBulkUpdateSerializer,
    TodoStatsSerializer,
    CategorySerializer
)
from .filters import TodoFilter

class TodoListCreateView(generics.ListCreateAPIView):
    """Todo一覧取得・作成"""
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = TodoFilter
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'updated_at', 'due_date', 'priority', 'order_index']
    ordering = ['order_index', '-created_at']

    def get_queryset(self):
        return Todo.objects.filter(user=self.request.user).prefetch_related(
            'todo_categories__category'
        )

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TodoCreateSerializer
        return TodoSerializer

    def perform_create(self, serializer):
        # order_indexが指定されていない場合、最大値+1を設定
        if 'order_index' not in serializer.validated_data:
            max_order = Todo.objects.filter(user=self.request.user).aggregate(
                max_order=models.Max('order_index')
            )['max_order'] or 0
            serializer.save(user=self.request.user, order_index=max_order + 1)
        else:
            serializer.save(user=self.request.user)

class TodoDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Todo詳細取得・更新・削除"""
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Todo.objects.filter(user=self.request.user).prefetch_related(
            'todo_categories__category'
        )

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return TodoUpdateSerializer
        return TodoSerializer

@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def toggle_todo(request, pk):
    """Todo完了状態切り替え"""
    try:
        todo = Todo.objects.get(id=pk, user=request.user)
        todo.completed = not todo.completed
        todo.save()
        serializer = TodoSerializer(todo)
        return Response(serializer.data)
    except Todo.DoesNotExist:
        return Response({'error': 'Todoが見つかりません。'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def reorder_todos(request):
    """Todo並び替え"""
    serializer = TodoReorderSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    todo_orders = serializer.validated_data['todo_orders']
    
    # バルクアップデートで効率的に更新
    todos_to_update = []
    for item in todo_orders:
        try:
            todo = Todo.objects.get(id=item['id'], user=request.user)
            todo.order_index = int(item['order_index'])
            todos_to_update.append(todo)
        except Todo.DoesNotExist:
            continue
    
    Todo.objects.bulk_update(todos_to_update, ['order_index'])
    
    return Response({'message': '並び順を更新しました。'})

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def bulk_update_todos(request):
    """Todo一括操作"""
    serializer = TodoBulkUpdateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    todo_ids = serializer.validated_data['todo_ids']
    action = serializer.validated_data['action']
    
    todos = Todo.objects.filter(id__in=todo_ids, user=request.user)
    
    if action == 'complete':
        todos.update(completed=True, completed_at=timezone.now())
        message = f'{todos.count()}件のTodoを完了にしました。'
    elif action == 'incomplete':
        todos.update(completed=False, completed_at=None)
        message = f'{todos.count()}件のTodoを未完了にしました。'
    elif action == 'delete':
        count = todos.count()
        todos.delete()
        message = f'{count}件のTodoを削除しました。'
    
    return Response({'message': message})

@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def clear_completed_todos(request):
    """完了済みTodo一括削除"""
    deleted_count = Todo.objects.filter(user=request.user, completed=True).delete()[0]
    return Response({'message': f'{deleted_count}件の完了済みTodoを削除しました。'})

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def todo_stats(request):
    """Todo統計情報"""
    user = request.user
    now = timezone.now()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=today_start.weekday())
    
    todos = Todo.objects.filter(user=user)
    total_todos = todos.count()
    completed_todos = todos.filter(completed=True).count()
    pending_todos = total_todos - completed_todos
    completion_rate = (completed_todos / total_todos * 100) if total_todos > 0 else 0
    
    overdue_todos = todos.filter(
        due_date__lt=now,
        completed=False
    ).count()
    
    today_completed = todos.filter(
        completed=True,
        completed_at__gte=today_start
    ).count()
    
    week_completed = todos.filter(
        completed=True,
        completed_at__gte=week_start
    ).count()
    
    # カテゴリ別統計
    categories_stats = {}
    categories = Category.objects.filter(user=user).annotate(
        total=Count('todo_categories__todo'),
        completed=Count('todo_categories__todo', filter=Q(todo_categories__todo__completed=True))
    )
    
    for category in categories:
        categories_stats[category.name] = {
            'total': category.total,
            'completed': category.completed,
            'pending': category.total - category.completed
        }
    
    stats_data = {
        'total_todos': total_todos,
        'completed_todos': completed_todos,
        'pending_todos': pending_todos,
        'completion_rate': round(completion_rate, 2),
        'overdue_todos': overdue_todos,
        'today_completed': today_completed,
        'week_completed': week_completed,
        'categories_stats': categories_stats
    }
    
    serializer = TodoStatsSerializer(stats_data)
    return Response(serializer.data)

# Category Views
class CategoryListCreateView(generics.ListCreateAPIView):
    """カテゴリ一覧取得・作成"""
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user).annotate(
            todo_count=Count('todo_categories')
        ).order_by('-created_at')

class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """カテゴリ詳細取得・更新・削除"""
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)