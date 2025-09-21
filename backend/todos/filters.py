import django_filters
from django.utils import timezone
from .models import Todo, Category

class TodoFilter(django_filters.FilterSet):
    """Todoフィルター"""
    
    # 完了状態フィルター
    completed = django_filters.BooleanFilter(field_name='completed')
    
    # 優先度フィルター
    priority = django_filters.ChoiceFilter(
        field_name='priority',
        choices=Todo._meta.get_field('priority').choices
    )
    
    # カテゴリフィルター
    category = django_filters.ModelChoiceFilter(
        field_name='todo_categories__category',
        queryset=Category.objects.none(),  # 動的に設定
        to_field_name='id'
    )
    
    # 期限フィルター
    due_date = django_filters.DateFilter(field_name='due_date__date')
    due_date_gte = django_filters.DateFilter(field_name='due_date__date', lookup_expr='gte')
    due_date_lte = django_filters.DateFilter(field_name='due_date__date', lookup_expr='lte')
    
    # 作成日フィルター
    created_at = django_filters.DateFilter(field_name='created_at__date')
    created_at_gte = django_filters.DateFilter(field_name='created_at__date', lookup_expr='gte')
    created_at_lte = django_filters.DateFilter(field_name='created_at__date', lookup_expr='lte')
    
    # 期限切れフィルター
    overdue = django_filters.BooleanFilter(method='filter_overdue')
    
    # 今日期限フィルター
    due_today = django_filters.BooleanFilter(method='filter_due_today')
    
    # 今週期限フィルター
    due_this_week = django_filters.BooleanFilter(method='filter_due_this_week')

    class Meta:
        model = Todo
        fields = [
            'completed', 'priority', 'category', 'due_date', 'due_date_gte', 'due_date_lte',
            'created_at', 'created_at_gte', 'created_at_lte', 'overdue', 'due_today', 'due_this_week'
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # リクエストユーザーのカテゴリのみを選択肢に設定
        if self.request and hasattr(self.request, 'user') and self.request.user.is_authenticated:
            self.filters['category'].queryset = Category.objects.filter(user=self.request.user)

    def filter_overdue(self, queryset, name, value):
        """期限切れのTodoをフィルター"""
        if value:
            return queryset.filter(
                due_date__lt=timezone.now(),
                completed=False
            )
        return queryset

    def filter_due_today(self, queryset, name, value):
        """今日期限のTodoをフィルター"""
        if value:
            today = timezone.now().date()
            return queryset.filter(due_date__date=today)
        return queryset

    def filter_due_this_week(self, queryset, name, value):
        """今週期限のTodoをフィルター"""
        if value:
            now = timezone.now()
            start_of_week = now - timezone.timedelta(days=now.weekday())
            end_of_week = start_of_week + timezone.timedelta(days=6)
            return queryset.filter(
                due_date__date__range=[start_of_week.date(), end_of_week.date()]
            )
        return queryset