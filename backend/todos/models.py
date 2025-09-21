import uuid
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Todo(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='todos')
    name = models.CharField(max_length=500, verbose_name='タスク名')
    description = models.TextField(blank=True, verbose_name='説明')
    completed = models.BooleanField(default=False, verbose_name='完了状態')
    order_index = models.IntegerField(default=0, verbose_name='並び順')
    priority = models.CharField(
        max_length=10,
        choices=[
            ('low', '低'),
            ('medium', '中'),
            ('high', '高'),
        ],
        default='medium',
        verbose_name='優先度'
    )
    due_date = models.DateTimeField(null=True, blank=True, verbose_name='期限')
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name='完了日時')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='作成日時')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新日時')

    class Meta:
        ordering = ['order_index', '-created_at']
        verbose_name = 'Todo'
        verbose_name_plural = 'Todos'

    def __str__(self):
        return f"{self.name} - {self.user.email}"

    # todos/models.py の Todo モデル内

    def save(self, *args, **kwargs):
        is_new_object = not self.pk
        old_completed = None

        if not is_new_object:
            try:
                old_todo = Todo.objects.get(pk=self.pk)
                old_completed = old_todo.completed
            except Todo.DoesNotExist:
                # 非常にまれなケースだが、既存のオブジェクトが見つからなかった場合の処理
                pass
        
        # 完了状態が変更された場合、または新規作成時に完了状態がTrueの場合
        if self.completed and (is_new_object or old_completed is not self.completed):
            from django.utils import timezone
            self.completed_at = timezone.now()
        elif not self.completed and old_completed is not self.completed:
            self.completed_at = None
            
        super().save(*args, **kwargs)

class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='categories')
    name = models.CharField(max_length=100, verbose_name='カテゴリ名')
    color = models.CharField(max_length=7, default='#3B82F6', verbose_name='カラー')  # HEX color
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='作成日時')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新日時')

    class Meta:
        unique_together = ['user', 'name']
        verbose_name = 'カテゴリ'
        verbose_name_plural = 'カテゴリ'

    def __str__(self):
        return f"{self.name} - {self.user.email}"

class TodoCategory(models.Model):
    todo = models.ForeignKey(Todo, on_delete=models.CASCADE, related_name='todo_categories')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='todo_categories')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['todo', 'category']
        verbose_name = 'Todoカテゴリ'
        verbose_name_plural = 'Todoカテゴリ'