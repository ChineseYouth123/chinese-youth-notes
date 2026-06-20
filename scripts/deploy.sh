#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "🔄 更新抖音链接..."
node "$ROOT_DIR/douyinUrl.js" "$ROOT_DIR/pages/posts/2026/"

echo ""
echo "🔄 提交 pages 子模块..."
cd "$ROOT_DIR/pages"
git add .
git commit -m "chore: update douyin links" --allow-empty
git push

echo ""
echo "🔄 更新主仓库 submodule 引用..."
cd "$ROOT_DIR"
git add pages
git commit -m "chore: update pages submodule"
git push

echo ""
echo "✅ 完成！"
