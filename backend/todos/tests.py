from datetime import timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APITestCase

from .models import Category, Todo

User = get_user_model()
PASSWORD = 'Str0ng-Passw0rd!'


class TodoApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='u@example.com', username='u', password=PASSWORD)
        self.other = User.objects.create_user(email='o@example.com', username='o', password=PASSWORD)
        self.client.force_authenticate(self.user)

    def test_create_returns_full_todo_and_appends_order(self):
        first = self.client.post('/api/todos/', {'name': 'first'}, format='json')
        second = self.client.post('/api/todos/', {'name': 'second'}, format='json')
        self.assertEqual(first.status_code, 201)
        self.assertIn('id', first.data)
        self.assertEqual(second.data['order_index'], first.data['order_index'] + 1)

    def test_blank_name_rejected(self):
        res = self.client.post('/api/todos/', {'name': '   '}, format='json')
        self.assertEqual(res.status_code, 400)

    def test_categories_roundtrip(self):
        cat = Category.objects.create(user=self.user, name='仕事')
        res = self.client.post('/api/todos/', {'name': 't', 'category_ids': [str(cat.id)]}, format='json')
        self.assertEqual(res.status_code, 201, res.data)
        self.assertEqual([c['name'] for c in res.data['categories']], ['仕事'])

        res = self.client.patch(f"/api/todos/{res.data['id']}/", {'category_ids': []}, format='json')
        self.assertEqual(res.data['categories'], [])

        res = self.client.get(f'/api/todos/?category={cat.id}')
        self.assertEqual(res.data, [])

    def test_cannot_use_other_users_category(self):
        cat = Category.objects.create(user=self.other, name='他人')
        res = self.client.post('/api/todos/', {'name': 't', 'category_ids': [str(cat.id)]}, format='json')
        self.assertEqual(res.status_code, 400)

    def test_duplicate_category_name_is_400_not_500(self):
        self.client.post('/api/categories/', {'name': '家事'}, format='json')
        res = self.client.post('/api/categories/', {'name': '家事'}, format='json')
        self.assertEqual(res.status_code, 400)

    def test_toggle_sets_completed_at(self):
        todo = Todo.objects.create(user=self.user, name='t')
        res = self.client.patch(f'/api/todos/{todo.id}/toggle/')
        self.assertTrue(res.data['completed'])
        self.assertIsNotNone(res.data['completed_at'])
        res = self.client.patch(f'/api/todos/{todo.id}/toggle/')
        self.assertIsNone(res.data['completed_at'])

    def test_cannot_access_other_users_todo(self):
        todo = Todo.objects.create(user=self.other, name='secret')
        self.assertEqual(self.client.get(f'/api/todos/{todo.id}/').status_code, 404)
        self.assertEqual(self.client.patch(f'/api/todos/{todo.id}/toggle/').status_code, 404)
        self.assertEqual(self.client.get('/api/todos/').data, [])

    def test_reorder(self):
        a = Todo.objects.create(user=self.user, name='a', order_index=0)
        b = Todo.objects.create(user=self.user, name='b', order_index=1)
        res = self.client.post('/api/todos/reorder/', {'todo_orders': [
            {'id': str(a.id), 'order_index': 1}, {'id': str(b.id), 'order_index': 0},
        ]}, format='json')
        self.assertEqual(res.status_code, 200)
        names = [t['name'] for t in self.client.get('/api/todos/').data]
        self.assertEqual(names, ['b', 'a'])

    def test_bulk_and_clear_completed(self):
        ids = [str(Todo.objects.create(user=self.user, name=n).id) for n in 'abc']
        res = self.client.post('/api/todos/bulk-update/', {'todo_ids': ids[:2], 'action': 'complete'}, format='json')
        self.assertEqual(res.data['count'], 2)
        res = self.client.delete('/api/todos/clear-completed/')
        self.assertEqual(res.data['count'], 2)
        self.assertEqual(Todo.objects.filter(user=self.user).count(), 1)

    def test_stats(self):
        Todo.objects.create(user=self.user, name='done', completed=True)
        Todo.objects.create(user=self.user, name='late', due_date=timezone.now() - timedelta(days=1))
        Todo.objects.create(user=self.other, name='not mine')
        res = self.client.get('/api/todos/stats/')
        self.assertEqual(res.data['total_todos'], 2)
        self.assertEqual(res.data['completed_todos'], 1)
        self.assertEqual(res.data['overdue_todos'], 1)
        self.assertEqual(res.data['today_completed'], 1)
