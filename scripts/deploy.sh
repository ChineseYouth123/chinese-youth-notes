#!/usr/bin/env bash
# deploy.sh — 跨平台部署脚本（macOS / Linux / Windows Git Bash）
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PAGES_DIR="$ROOT_DIR/pages"

echo "========================================"
echo " 部署脚本 — 更新抖音链接 & 提交代码"
echo "========================================"

# 1. 更新抖音链接
echo ""
echo "🔄 [1/4] 更新抖音链接..."
if [ ! -f "$ROOT_DIR/douyinUrl.js" ]; then
  echo "❌ 错误: 找不到 $ROOT_DIR/douyinUrl.js"
  exit 1
fi
node "$ROOT_DIR/douyinUrl.js" "$PAGES_DIR/posts/2026/"

# 2. 提交 pages 子模块
echo ""
echo "🔄 [2/4] 提交 pages 子模块..."
if [ ! -d "$PAGES_DIR/.git" ]; then
  echo "⚠️  警告: '$PAGES_DIR' 不是 git 仓库，跳过..."
else
  git -C "$PAGES_DIR" add .
  git -C "$PAGES_DIR" commit -m "chore: update douyin links" --allow-empty
  git -C "$PAGES_DIR" push
fi

# 3. 更新主仓库 submodule 引用
echo ""
echo "🔄 [3/4] 更新主仓库 submodule 引用..."
git -C "$ROOT_DIR" add pages
git -C "$ROOT_DIR" commit -m "chore: update pages submodule" --allow-empty
git -C "$ROOT_DIR" push

# 4. 完成
echo ""
echo "========================================"
echo " ✅ 完成！"
echo "========================================"
