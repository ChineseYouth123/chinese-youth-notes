#!/usr/bin/env bash
# deploy.sh — 跨平台部署脚本（macOS / Linux / Windows Git Bash）
set -euo pipefail

# 加载 nvm（非交互式 shell 不会自动加载 ~/.bashrc）
export NVM_DIR="$HOME/.config/nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PAGES_DIR="$ROOT_DIR/pages"

# 本地 nginx 部署配置
NGINX_HOME="$HOME/.local/nginx-local"
SITE_DIR="$NGINX_HOME/site"
DIST_DIR="$ROOT_DIR/.vitepress/dist"

echo "========================================"
echo " 部署脚本 — 打包 & 本地部署 & 提交代码"
echo "========================================"

# 1. 更新抖音链接
echo ""
echo "🔄 [1/4] 更新抖音链接..."
if [ ! -f "$ROOT_DIR/douyinUrl.js" ]; then
  echo "❌ 错误: 找不到 $ROOT_DIR/douyinUrl.js"
  exit 1
fi
node "$ROOT_DIR/douyinUrl.js" "$PAGES_DIR/posts/2026/"

# 2. 自动打包
echo ""
echo "🔄 [2/5] 打包网站..."
npm --prefix "$ROOT_DIR" run build

# 3. 本地同步部署（nginx）
echo ""
echo "🔄 [3/5] 同步部署到本地 nginx..."
if [ ! -x "$NGINX_HOME/nginx" ]; then
  echo "❌ 错误: 找不到 $NGINX_HOME/nginx，请先安装本地 nginx"
  exit 1
fi
mkdir -p "$SITE_DIR"
rsync -a --delete "$DIST_DIR/" "$SITE_DIR/"
if [ -f "$NGINX_HOME/run/nginx.pid" ] && kill -0 "$(cat "$NGINX_HOME/run/nginx.pid")" 2>/dev/null; then
  "$NGINX_HOME/nginx" -c "$NGINX_HOME/nginx.conf" -s reload
  echo "   nginx 已重载"
else
  "$NGINX_HOME/nginx" -c "$NGINX_HOME/nginx.conf"
  echo "   nginx 已启动"
fi
echo "   ✅ 本地地址: http://localhost:8080/chinese-youth-notes/"

# 4. 提交 pages 子模块
echo ""
echo "🔄 [4/5] 提交 pages 子模块..."
if [ ! -e "$PAGES_DIR/.git" ]; then
  echo "⚠️  警告: '$PAGES_DIR' 不是 git 仓库，跳过..."
else
  git -C "$PAGES_DIR" add .
  git -C "$PAGES_DIR" commit -m "chore: update douyin links" --allow-empty
  git -C "$PAGES_DIR" push || echo "⚠️  警告: 子模块 push 失败，跳过..."
fi

# 5. 更新主仓库 submodule 引用
echo ""
echo "🔄 [5/5] 更新主仓库 submodule 引用..."
git -C "$ROOT_DIR" add pages
git -C "$ROOT_DIR" commit -m "chore: update pages submodule" --allow-empty
git -C "$ROOT_DIR" push || echo "⚠️  警告: 主仓库 push 失败，跳过..."

# 4. 完成
echo ""
echo "========================================"
echo " ✅ 完成！"
echo "========================================"
