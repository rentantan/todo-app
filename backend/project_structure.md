# Django Todo Backend - プロジェクト構成

```
backend/
├── config/                     # Django設定
│   ├── __init__.py
│   ├── settings.py            # メイン設定ファイル
│   ├── urls.py               # ルートURL設定
│   ├── wsgi.py               # WSGI設定
│   └── asgi.py               # ASGI設定
│
├── accounts/                   # ユーザー認証アプリ
│   ├── __init__.py
│   ├── models.py             # User モデル
│   ├── serializers.py        # API シリアライザー
│   ├── views.py              # API ビュー
│   ├── urls.py               # URL設定
│   ├── admin.py              # 管理画面設定
│   ├── apps.py               # アプリ設定
│   └── migrations/           # マイグレーションファイル
│
├── todos/                     # Todo管理アプリ
│   ├── __init__.py
│   ├── models.py             # Todo, Category モデル
│   ├── serializers.py        # API シリアライザー
│   ├── views.py              # API ビュー
│   ├── urls.py               # URL設定
│   ├── filters.py            # フィルター設定
│   ├── admin.py              # 管理画面設定
│   ├── apps.py               # アプリ設定
│   └── migrations/           # マイグレーションファイル
│
├── static/                    # 静的ファイル
├── media/                     # メディアファイル
├── staticfiles/              # 収集された静的ファイル
│
├── manage.py                  # Django管理スクリプト
├── requirements.txt           # Python依存関係
├── .env.example              # 環境変数例
├── .env                      # 環境変数（実際のファイル）
├── Dockerfile                # Docker設定
├── docker-compose.yml        # Docker Compose設定
├── setup.sh                  # セットアップスクリプト
└── README.md                 # ドキュメント
```

## ファイル説明

### 設定ファイル
- **config/settings.py**: Django の メイン設定（データベース、認証、CORS等）
- **config/urls.py**: ルートURL設定
- **requirements.txt**: Python パッケージ依存関係
- **.env**: 環境変数（SECRET_KEY、DATABASE_URL等）

### アプリケーション
- **accounts/**: ユーザー認証・プロフィール管理
- **todos/**: Todo・カテゴリ管理

### モデル設計
- **User**: カスタムユーザーモデル（UUID主キー、email認証）
- **Todo**: Todoアイテム（優先度、期限、カテゴリ付き）
- **Category**: カテゴリ（色付きラベル）
- **TodoCategory**: Todo-Category多対多関係

### API設計
- **REST API**: DRF（Django REST Framework）使用
- **JWT認証**: Simple JWT使用
- **フィルタリング**: django-filter使用
- **CORS対応**: django-cors-headers使用

## 起動手順

1. 環境構築: `chmod +x setup.sh && ./setup.sh`
2. サーバー起動: `python manage.py runserver`
3. 管理画面: `http://localhost:8000/admin/`
4. API: `http://localhost:8000/api/`