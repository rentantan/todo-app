````markdown
# 📝 Todo アプリ

このプロジェクトは、React と TypeScript で構築されたフロントエンドと、Django REST API で構築されたバックエンドで構成される、モダンな Todo 管理アプリケーションです。

---

## 🚀 主な機能

### 認証機能
- JWT 認証によるセキュアなログイン
- ユーザー登録
- 自動トークン更新

### Todo 機能
- タスクの作成、編集、削除
- 完了ステータスの切り替え
- 並び替え、ドラッグ＆ドロップ
- 一括操作（完了・削除）

### 高度なフィルタリング
- 状態、優先度、期限、キーワードでタスクを絞り込み

### UI/UX
- レスポンシブデザイン
- ダークモード
- ローディング状態表示
- 親切なエラーメッセージ

### API 連携
- フロントエンドとバックエンドが分離しており、スケーラブルな開発が可能

---

## 💻 技術スタック

### フロントエンド
- コア技術: React (TypeScript), Tailwind CSS
- ライブラリ: React Router DOM, Axios, @hello-pangea/dnd
- 状態管理: React Context API

### バックエンド
- コア技術: Django, Django REST Framework
- 認証: django-rest-framework-simplejwt
- データベース: SQLite (開発用) / PostgreSQL (本番用)

---

## 🛠 セットアップ手順

### 全体共通
リポジトリをクローンします。

```bash
git clone [ここにGitHubリポジトリのURLを挿入]
````

---

### フロントエンドのセットアップ

1. ディレクトリに移動

```bash
cd frontend
```

2. 依存関係をインストール

```bash
npm install
```

3. 環境変数を設定

```bash
cp .env.example .env
# .env 内の REACT_APP_API_URL をバックエンドの URL に設定
```

4. 開発サーバーを起動

```bash
npm start
```

---

### バックエンドのセットアップ

1. 仮想環境作成・有効化

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
```

2. 依存関係をインストール

```bash
pip install -r requirements.txt
```

3. 環境変数を設定

```bash
cp .env.example .env
# 必要に応じて設定を編集
```

4. データベースのマイグレーション

```bash
python manage.py makemigrations
python manage.py migrate
```

5. 開発サーバー起動

```bash
python manage.py runserver
```

---

## 📁 ディレクトリ構成

```plaintext
todo-app/
├── frontend/             # React フロントエンド
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── services/
│   │   └── App.tsx
│   └── ...
└── backend/              # Django バックエンド
    ├── todo_app/
    ├── venv/
    ├── manage.py
    └── ...
```
