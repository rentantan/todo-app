#!/bin/bash
set -e
cd "$(dirname "$0")"

# Django Todo Backend セットアップスクリプト

echo "🚀 Django Todo Backend セットアップを開始します..."

# 仮想環境の作成
echo "📦 仮想環境を作成中..."
python3 -m venv venv

# 仮想環境の有効化（OS別）
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    # Windows
    source venv/Scripts/activate
else
    # macOS/Linux
    source venv/bin/activate
fi

echo "✅ 仮想環境を有効化しました"

# 依存関係のインストール
echo "📚 依存関係をインストール中..."
pip install --upgrade pip
pip install -r requirements.txt

echo "✅ 依存関係のインストールが完了しました"

# 環境変数ファイルの作成
if [ ! -f .env ]; then
    echo "⚙️ 環境変数ファイルを作成中..."
    cp .env.example .env
    echo "✅ .env ファイルを作成しました。必要に応じて編集してください。"
else
    echo "ℹ️ .env ファイルは既に存在します"
fi

# マイグレーションの実行
echo "🗄️ データベースマイグレーションを実行中..."
python manage.py migrate

echo "✅ マイグレーションが完了しました"

# スーパーユーザーの作成（オプション）
echo "👤 スーパーユーザーを作成しますか？ (y/N)"
read -r create_superuser
if [[ $create_superuser == "y" || $create_superuser == "Y" ]]; then
    python manage.py createsuperuser
    echo "✅ スーパーユーザーを作成しました"
fi

echo ""
echo "🎉 セットアップが完了しました！"
echo ""
echo "開発サーバーを起動するには:"
echo "  python manage.py runserver"
echo ""
echo "管理画面にアクセス:"
echo "  http://localhost:8000/admin/"
echo ""
echo "Happy coding! 🚀"