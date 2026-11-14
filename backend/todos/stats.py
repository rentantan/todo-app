from datetime import timedelta

from django.db.models import Count, Q
from django.utils import timezone

from .models import Category, Todo


def compute_todo_stats(user):
    """ユーザーのTodo統計情報を集計する（TodoStatsSerializer の形式）"""
    now = timezone.now()
    # TIME_ZONE (Asia/Tokyo) 基準で「今日」「今週」を判定する
    today_start = timezone.localtime(now).replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=today_start.weekday())
    today = today_start.date()

    agg = Todo.objects.filter(user=user).aggregate(
        n_total=Count('id'),
        n_completed=Count('id', filter=Q(completed=True)),
        n_overdue=Count('id', filter=Q(completed=False, due_date__lt=now)),
        n_due_today=Count('id', filter=Q(completed=False, due_date__date=today)),
        n_today_completed=Count('id', filter=Q(completed=True, completed_at__gte=today_start)),
        n_week_completed=Count('id', filter=Q(completed=True, completed_at__gte=week_start)),
    )
    total = agg['n_total']
    completed = agg['n_completed']

    categories = Category.objects.filter(user=user).annotate(
        total=Count('todo_categories'),
        done=Count('todo_categories', filter=Q(todo_categories__todo__completed=True)),
    )
    categories_stats = {
        c.name: {'total': c.total, 'completed': c.done, 'pending': c.total - c.done}
        for c in categories
    }

    return {
        'total_todos': total,
        'completed_todos': completed,
        'pending_todos': total - completed,
        'completion_rate': round(completed / total * 100, 2) if total else 0,
        'overdue_todos': agg['n_overdue'],
        'due_today_todos': agg['n_due_today'],
        'today_completed': agg['n_today_completed'],
        'week_completed': agg['n_week_completed'],
        'categories_stats': categories_stats,
    }
