````markdown
# 📝 Todo アプリ

React + TypeScript と Tailwind CSS で構築したシンプルな Todo アプリです。  
ユーザーはタスクを追加・編集・削除・完了管理でき、フィルタリングやダークモードにも対応しています。  
データはブラウザのローカルストレージに保存されるため、ページをリロードしてもタスクが保持されます。

---

## 🚀 主な機能

- ✅ タスクの追加、編集、削除
- ✅ タスク完了 / 未完了の管理
- 🔎 タスクのフィルタリング（すべて / 未完了 / 完了）
- 🌙 ダークモード対応
- 💾 タスクの自動保存（ローカルストレージ）

---

## 🧩 動作環境（推奨）

- Node.js 18+ / npm 8+
- Git
- ブラウザ（Chrome, Firefox, Edge 推奨）

---

## 📁 ディレクトリ構成

```plaintext
todo-app/
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   │   └── Card.tsx
│   │   ├── Todo/
│   │   │   ├── Todo.tsx
│   │   │   ├── TodoForm.tsx
│   │   │   └── TodoList.tsx
│   ├── types.ts
│   ├── App.tsx
│   └── index.tsx
├── public/
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── .gitignore
├── README.md
└── LICENSE
````

---

## ⚡ ローカルセットアップ手順

1️⃣ リポジトリをクローン

```bash
git clone <リポジトリURL>
cd todo-app
```

2️⃣ 依存関係をインストール

```bash
npm install
```

3️⃣ 開発サーバー起動

```bash
npm start  # CRA の場合
# npm run dev  # Vite の場合
```

ブラウザで [http://localhost:3000](http://localhost:3000) にアクセスしてアプリを確認できます。

---

## 🛠 よくあるトラブルと対処法

| 問題                | 対処法                                          |
| ----------------- | -------------------------------------------- |
| npm install が失敗する | Node.js と npm のバージョンを確認し、再インストール             |
| CSS が反映されない       | Tailwind CSS の設定を確認、`npm start` を再起動         |
| ダークモードが反映されない     | `darkMode` state と `className="dark"` の設定を確認 |

---

## 🧾 ライセンス

このプロジェクトは [MIT License](LICENSE) の下で公開されています。

---

## 🧭 開発ルール（推奨）

* コミットメッセージは下記を統一すると履歴が明快です：

  * `feat:` 新機能追加
  * `fix:` バグ修正
  * `chore:` ドキュメント・設定変更
* フロントエンドは単一リポジトリで管理可能ですが、機能ごとにブランチ分けが推奨

---

## ➕ 拡張アイデア

* ⏱ タスクの締切日を追加
* 📊 完了率や統計の表示
* 👤 ユーザーごとのタスク管理（ログイン機能追加）
* 🎨 UI を Tailwind CSS や Chakra UI でさらに強化

```