from django.contrib import admin
from .models import Todo, Category, TodoCategory

@admin.register(Todo)
class TodoAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'completed', 'priority', 'due_date', 'created_at')
    list_filter = ('completed', 'priority', 'created_at', 'due_date')
    search_fields = ('name', 'description', 'user__email')
    ordering = ('-created_at',)
    readonly_fields = ('id', 'completed_at', 'created_at', 'updated_at')
    
    fieldsets = (
        ('基本情報', {
            'fields': ('id', 'user', 'name', 'description')
        }),
        ('状態・優先度', {
            'fields': ('completed', 'completed_at', 'priority', 'order_index')
        }),
        ('日時', {
            'fields': ('due_date', 'created_at', 'updated_at')
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'color', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'user__email')
    ordering = ('-created_at',)
    readonly_fields = ('id', 'created_at', 'updated_at')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')

@admin.register(TodoCategory)
class TodoCategoryAdmin(admin.ModelAdmin):
    list_display = ('todo', 'category', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('todo__name', 'category__name')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('todo', 'category')