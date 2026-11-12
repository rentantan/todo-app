from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .serializers import (
    PasswordChangeSerializer,
    UserLoginSerializer,
    UserProfileUpdateSerializer,
    UserRegistrationSerializer,
    UserSerializer,
)


def _auth_response(user, message, status_code=status.HTTP_200_OK):
    """ユーザー情報と JWT トークンをまとめたレスポンスを返す"""
    refresh = RefreshToken.for_user(user)
    return Response(
        {
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'message': message,
        },
        status=status_code,
    )


class UserRegistrationView(generics.CreateAPIView):
    """ユーザー登録"""
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return _auth_response(user, 'ユーザー登録が完了しました。', status.HTTP_201_CREATED)


class UserLoginView(APIView):
    """ユーザーログイン"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        return _auth_response(serializer.validated_data['user'], 'ログインしました。')


class UserLogoutView(APIView):
    """ユーザーログアウト（リフレッシュトークンを無効化）"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'error': 'refresh トークンが必要です。'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            RefreshToken(refresh_token).blacklist()
        except TokenError:
            return Response({'error': 'トークンが無効です。'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': 'ログアウトしました。'}, status=status.HTTP_200_OK)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """ユーザープロフィール取得・更新"""
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return UserSerializer
        return UserProfileUpdateSerializer

    def update(self, request, *args, **kwargs):
        super().update(request, *args, **kwargs)
        # 更新後は完全なユーザー情報を返す
        return Response(UserSerializer(self.get_object()).data)


class PasswordChangeView(APIView):
    """パスワード変更"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()

        return Response({'message': 'パスワードを変更しました。'}, status=status.HTTP_200_OK)
