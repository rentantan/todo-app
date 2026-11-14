from django.core.cache import cache
from rest_framework.test import APITestCase

PASSWORD = 'Str0ng-Passw0rd!'


class AuthApiTests(APITestCase):
    def setUp(self):
        # 回数制限のカウントはキャッシュに残るため、テストごとにリセットする
        cache.clear()

    def register(self, email='alice@example.com', username='alice'):
        return self.client.post('/api/auth/register/', {
            'email': email, 'username': username,
            'password': PASSWORD, 'password_confirm': PASSWORD,
        }, format='json')

    def test_register_login_logout(self):
        res = self.register()
        self.assertEqual(res.status_code, 201)
        self.assertIn('access', res.data)

        res = self.client.post('/api/auth/login/', {'email': 'ALICE@example.com', 'password': PASSWORD}, format='json')
        self.assertEqual(res.status_code, 200, res.data)

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {res.data['access']}")
        refresh = res.data['refresh']
        res = self.client.post('/api/auth/logout/', {'refresh': refresh}, format='json')
        self.assertEqual(res.status_code, 200, res.data)

        # ログアウト後のリフレッシュトークンは使えない
        res = self.client.post('/api/auth/token/refresh/', {'refresh': refresh}, format='json')
        self.assertEqual(res.status_code, 401)

    def test_duplicate_email_is_case_insensitive(self):
        self.register()
        res = self.register(email='Alice@Example.com', username='alice2')
        self.assertEqual(res.status_code, 400)
        self.assertIn('email', res.data)

    def test_password_mismatch(self):
        res = self.client.post('/api/auth/register/', {
            'email': 'bob@example.com', 'username': 'bob',
            'password': PASSWORD, 'password_confirm': PASSWORD + 'x',
        }, format='json')
        self.assertEqual(res.status_code, 400)
        self.assertIn('password_confirm', res.data)

    def test_wrong_password(self):
        self.register()
        res = self.client.post('/api/auth/login/', {'email': 'alice@example.com', 'password': 'nope'}, format='json')
        self.assertEqual(res.status_code, 400)

    def test_login_is_throttled(self):
        self.register()
        for _ in range(9):  # 登録 1 回 + ログイン 9 回 = 上限 10 回
            self.client.post('/api/auth/login/', {'email': 'alice@example.com', 'password': 'nope'}, format='json')
        res = self.client.post('/api/auth/login/', {'email': 'alice@example.com', 'password': PASSWORD}, format='json')
        self.assertEqual(res.status_code, 429)
