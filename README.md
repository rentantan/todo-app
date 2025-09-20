````markdown
# 📝 Todo アプリ

React + TypeScript + Tailwind CSS で構築したシンプルかつ直感的な Todo アプリです。  
タスクの追加・編集・削除・完了管理に加えて、ドラッグ＆ドロップによる並び替え、フィルタリング、ダークモードもサポートしています。  
データはブラウザの **ローカルストレージ** に保存され、リロード後も保持されます。

---

## 🚀 主な機能

- ✅ タスクの追加、編集、削除
- ✅ タスクの完了/未完了管理
- 🔎 フィルタリング（すべて / 未完了 / 完了）
- ↕️ **ドラッグ＆ドロップによる並び替え**（`@hello-pangea/dnd`）
- 🌙 ダークモード切り替え
- 💾 ローカルストレージへの自動保存

---

## 🧩 動作環境（推奨）

- Node.js **18+**
- npm **8+**
- 最新のブラウザ（Chrome, Firefox, Edge 推奨）

---

## 📁 ディレクトリ構成

```plaintext
frontend/
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   │   └── Card.tsx
│   │   └── Todo/
│   │       ├── Todo.tsx
│   │       ├── TodoForm.tsx
│   │       └── TodoList.tsx
│   ├── types.ts
│   ├── App.tsx
│   └── index.tsx
├── public/
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── .gitignore
├── README.md
└── LICENSE
````

---

## ⚡ ローカルセットアップ手順

1️⃣ リポジトリをクローン

```bash
git clone https://github.com/rentantan/todo-app
cd frontend
```

2️⃣ 依存関係をインストール

```bash
npm install
```

3️⃣ 開発サーバー起動

```bash
npm start
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開くとアプリを確認できます。

---

## 🛠 トラブルシューティング

| 問題                  | 対処法                               |
| ------------------- | --------------------------------- |
| `npm install` が失敗する | Node.js / npm のバージョンを確認し再インストール   |
| CSS が反映されない         | Tailwind の設定を確認し、`npm start` を再実行 |
| ダークモードが効かない         | `darkMode: 'class'` の設定とクラス付与を確認  |

---

## 🧾 ライセンス

このプロジェクトは [MIT License](LICENSE) の下で公開されています。

---

## 🧭 コミットメッセージ規約（推奨）

* `feat:` 新機能追加
* `fix:` バグ修正
* `style:` コード整形や UI 微調整
* `docs:` ドキュメント修正
* `chore:` 環境構築・依存関係・設定関連

---

## ➕ 今後の拡張アイデア

* ⏱ タスクの締切日設定
* 📊 完了率や統計の可視化
* 👤 ユーザー認証によるマルチユーザー対応
* 🎨 UI/UX のさらなる強化（Chakra UI, Framer Motion など）

````
