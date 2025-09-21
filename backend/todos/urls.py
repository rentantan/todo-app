from django.urls import path
from .views import (
    TodoListCreateView,
    TodoDetailView,
    toggle_todo,
    reorder_todos,
    bulk_update_todos,
    clear_completed_todos,
    todo_stats,
    CategoryListCreateView,
    CategoryDetailView
)

urlpatterns = [
    # Todo関連
    path('todos/', TodoListCreateView.as_view(), name='todo-list-create'),
    path('todos/<uuid:pk>/', TodoDetailView.as_view(), name='todo-detail'),
    path('todos/<uuid:pk>/toggle/', toggle_todo, name='todo-toggle'),
    path('todos/reorder/', reorder_todos, name='todo-reorder'),
    path('todos/bulk-update/', bulk_update_todos, name='todo-bulk-update'),
    path('todos/clear-completed/', clear_completed_todos, name='todo-clear-completed'),
    path('todos/stats/', todo_stats, name='todo-stats'),
    
    # Category関連
    path('categories/', CategoryListCreateView.as_view(), name='category-list-create'),
    path('categories/<uuid:pk>/', CategoryDetailView.as_view(), name='category-detail'),
]