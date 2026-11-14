# 📝 Todo アプリ

React + TypeScript のフロントエンドと、Django REST Framework のバックエンドで作ったタスク管理アプリです。
JWT 認証でユーザーごとにタスクを管理でき、カテゴリ分け・絞り込み・ドラッグ＆ドロップでの並び替えができます。

| | 使用技術 |
|---|---|
| **フロントエンド** | React 19 / TypeScript / Tailwind CSS / Axios / @hello-pangea/dnd |
| **バックエンド** | Django 5.2 / Django REST Framework / Simple JWT / django-filter |
| **データベース** | SQLite（開発用・デフォルト） / PostgreSQL（Docker） |

---

## 目次

- [主な機能](#-主な機能)
- [クイックスタート](#-クイックスタート)
- [環境変数](#️-環境変数)
- [API 一覧](#-api-一覧)
- [ディレクトリ構成](#-ディレクトリ構成)
- [開発用コマンド](#-開発用コマンド)

---

## ✨ 主な機能

**タスク管理**
- タスクの追加・編集・削除（名前／説明／優先度／期限／カテゴリ）
- 削除は 5 秒間「元に戻す」で取り消し可能
- 期限は「今日中」「明日」「1週間後」をワンタップで設定
- チェックで完了・未完了を切り替え（完了日時を自動記録）
- ドラッグ＆ドロップで並び替え（順序はサーバーに保存）
- 「すべて完了」「完了タスクを削除」の一括操作

**整理・検索**
- 色付きカテゴリの作成・削除、タスクへの複数付与
- キーワード検索 / 状態・優先度・カテゴリ・期限切れ・今日期限で絞り込み
- 進捗バー（完了率・今日／今週の完了数）

**使いやすさ**
- ダークモード（初回は OS の設定に追従）
- 操作結果やエラーをトースト通知で表示
- 期限を「今日 18:00」「あと3日」「2日超過」のように表示し、近い順に色分け
- ダブルクリックで編集、`⌘/Ctrl + Enter` で保存、`Esc` でキャンセル
- キーボードショートカット：`N` で新規タスク入力、`/` で検索
- ダークモード対応の確認ダイアログ（`Esc` で閉じる）
- スマートフォンでも使えるレスポンシブレイアウト

**認証**
- メールアドレスでの登録・ログイン（JWT）
- アクセストークンの自動更新、ログアウト時のトークン無効化

---

## 🚀 クイックスタート

### 必要なもの

- Python 3.11 以上
- Node.js 18 以上

### 1. リポジトリを取得

```bash
git clone <このリポジトリの URL>
cd todo-app
```

### 2. バックエンドを起動（ターミナル 1）

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # 必要に応じて編集
python manage.py migrate
python manage.py runserver
```

→ API: <http://localhost:8000/api/> / 管理画面: <http://localhost:8000/admin/>

> 💡 `./setup.sh` を実行すると、上記の手順（仮想環境の作成〜マイグレーション）をまとめて実行できます。

### 3. フロントエンドを起動（ターミナル 2）

```bash
cd frontend
npm install
cp .env.example .env
npm start
```

→ アプリ: <http://localhost:3000>

画面の「新規登録」からアカウントを作ればすぐに使えます。

### Docker で動かす場合（PostgreSQL）

```bash
cd backend
docker compose up --build
```

バックエンドと PostgreSQL が起動し、マイグレーションも自動で実行されます。フロントエンドは上記の手順 3 で起動してください。

---

## ⚙️ 環境変数

### バックエンド（`backend/.env`）

| 変数 | 既定値 | 説明 |
|---|---|---|
| `DEBUG` | `True` | 本番では `False` |
| `SECRET_KEY` | 開発用の値 | `DEBUG=False` のときは**必須** |
| `ALLOWED_HOSTS` | `localhost,127.0.0.1,0.0.0.0` | カンマ区切り |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000,http://127.0.0.1:3000` | フロントエンドの URL（カンマ区切り） |
| `DATABASE_URL` | SQLite (`backend/db.sqlite3`) | 例: `postgresql://user:pass@localhost:5432/db` |
| `JWT_ACCESS_MINUTES` | `60` | アクセストークンの有効期限（分） |
| `JWT_REFRESH_DAYS` | `7` | リフレッシュトークンの有効期限（日） |
| `AUTH_THROTTLE_RATE` | `10/min` | ログイン・登録の回数制限（IP ごと） |

### フロントエンド（`frontend/.env`）

| 変数 | 既定値 | 説明 |
|---|---|---|
| `REACT_APP_API_URL` | `http://localhost:8000/api` | バックエンド API の URL |

---

## 📡 API 一覧

`/api/auth/register/` と `/api/auth/login/` 以外は `Authorization: Bearer <access token>` ヘッダーが必要です。

<details>
<summary><b>認証</b> <code>/api/auth/</code></summary>

| メソッド | パス | 説明 |
|---|---|---|
| POST | `register/` | ユーザー登録（トークンを返す） |
| POST | `login/` | ログイン（トークンを返す） |
| POST | `logout/` | ログアウト（`refresh` を無効化） |
| POST | `token/refresh/` | アクセストークンの再発行 |
| GET / PATCH | `profile/` | プロフィールの取得・更新 |
| POST | `change-password/` | パスワード変更 |

</details>

<details>
<summary><b>タスク</b> <code>/api/todos/</code></summary>

| メソッド | パス | 説明 |
|---|---|---|
| GET | `todos/` | 一覧（下記の絞り込みが使えます） |
| POST | `todos/` | 作成 |
| GET / PATCH / PUT / DELETE | `todos/<id>/` | 取得・更新・削除 |
| PATCH | `todos/<id>/toggle/` | 完了状態の切り替え |
| POST | `todos/reorder/` | 並び替え `{"todo_orders": [{"id", "order_index"}]}` |
| POST | `todos/bulk-update/` | 一括操作 `{"todo_ids": [...], "action": "complete" \| "incomplete" \| "delete"}` |
| DELETE | `todos/clear-completed/` | 完了済みを一括削除 |
| GET | `todos/stats/` | 統計情報 |

**絞り込みパラメータ**: `search` / `completed` / `priority` (`low`・`medium`・`high`) / `category` / `overdue` / `due_today` / `due_this_week` / `due_date_gte` / `due_date_lte` / `ordering`

</details>

<details>
<summary><b>カテゴリ</b> <code>/api/categories/</code></summary>

| メソッド | パス | 説明 |
|---|---|---|
| GET / POST | `categories/` | 一覧・作成 `{"name", "color": "#RRGGBB"}` |
| GET / PATCH / PUT / DELETE | `categories/<id>/` | 取得・更新・削除 |

</details>

---

## 📁 ディレクトリ構成

```plaintext
todo-app/
├── backend/                  # Django REST API
│   ├── config/               #   設定（settings.py / urls.py）
│   ├── accounts/             #   ユーザー認証（カスタム User モデル・JWT・tests）
│   ├── todos/                #   タスク・カテゴリ（models / views / filters / stats / tests）
│   ├── requirements.txt
│   ├── .env.example
│   ├── setup.sh              #   初回セットアップスクリプト
│   ├── Dockerfile
│   └── docker-compose.yml
│
└── frontend/                 # React アプリ
    ├── src/
    │   ├── components/
    │   │   ├── Auth/         #   ログイン・新規登録
    │   │   ├── Category/     #   カテゴリの管理・選択・表示
    │   │   ├── Layout/       #   ヘッダー・カード・トースト
    │   │   └── Todo/         #   タスクのフォーム・一覧・フィルター・進捗
    │   ├── contexts/         #   AuthContext（ログイン状態）
    │   ├── hooks/            #   useTodos（データ取得・操作）/ useToast / useDarkMode / useDebounce
    │   ├── pages/            #   TodoPage（メイン画面）
    │   ├── services/         #   API 呼び出し（Axios）
    │   ├── utils/            #   日付・エラー処理・フィルター条件
    │   ├── constants.ts      #   優先度ラベルなどの定数
    │   ├── types.ts          #   モデル・API リクエストの型
    │   └── App.tsx
    └── .env.example
```

### データモデル

```plaintext
User ─┬─< Todo >──< TodoCategory >──┐
      └─< Category >────────────────┘
```

- **User**: UUID 主キー、メールアドレスでログイン
- **Todo**: 名前・説明・優先度・期限・完了状態・並び順
- **Category**: ユーザーごとの色付きラベル（同名は不可）

---

## 🧪 開発用コマンド

| 目的 | コマンド |
|---|---|
| バックエンドのテスト | `cd backend && python manage.py test` |
| 管理ユーザーの作成 | `cd backend && python manage.py createsuperuser` |
| フロントエンドの型チェック | `cd frontend && npx tsc --noEmit` |
| フロントエンドのビルド | `cd frontend && npm run build` |

---

## 📄 ライセンス

[MIT License](./LICENSE)
