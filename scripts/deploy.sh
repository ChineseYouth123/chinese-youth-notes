#!/usr/bin/env bash
# deploy.sh — 跨平台部署脚本（macOS / Linux / Windows Git Bash）
# 交互式菜单：可选择单步执行或一键部署
set -euo pipefail

# 加载 nvm（非交互式 shell 不会自动加载 ~/.bashrc）
export NVM_DIR="$HOME/.config/nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PAGES_DIR="$ROOT_DIR/pages"
POSTS_YEAR=2026
PUSH_FAILED=0

# ==================== 工具函数 ====================

log_ok()   { echo "   ✅ $*"; }
log_warn() { echo "   ⚠️  $*"; }
log_error(){ echo "   ❌ $*" >&2; }

pause() {
  echo ""
  read -r -p "按回车键返回菜单..." _input
  echo ""
}

# 有变更才提交（避免空提交污染 git 历史）
commit_if_dirty() {
  local repo="$1" msg="$2" pathspec="${3:-.}"
  git -C "$repo" add -A -- "$pathspec"
  if git -C "$repo" diff --cached --quiet; then
    log_warn "无变更，跳过提交（$msg）"
    return 1
  fi
  git -C "$repo" commit -m "$msg" -- "$pathspec"
  log_ok "已提交：$msg"
  return 0
}

# 推送并聚合失败状态
git_push() {
  local repo="$1"
  local branch
  branch="$(git -C "$repo" branch --show-current 2>/dev/null || echo '?')"
  if git -C "$repo" push; then
    log_ok "已推送（$branch）"
  else
    log_error "push 失败：$repo"
    PUSH_FAILED=1
    return 1
  fi
}

# 运行步骤并捕获错误，交互式菜单中失败不终止脚本
run_step() {
  set +e
  "$@"
  local code=$?
  set -e
  echo ""
  if [ "$code" -eq 0 ]; then
    log_ok "步骤执行成功"
  else
    log_error "步骤执行失败（退出码 $code）"
  fi
  return 0
}

# ==================== 步骤函数 ====================

# 步骤 2: 更新抖音链接
step_douyin() {
  echo ""
  echo "🔄 [更新抖音链接]..."
  if [ ! -f "$ROOT_DIR/douyinUrl.js" ]; then
    log_error "找不到 $ROOT_DIR/douyinUrl.js"
    return 1
  fi
  node "$ROOT_DIR/douyinUrl.js" "$PAGES_DIR/posts/$POSTS_YEAR/"
  log_ok "抖音链接更新完成"
}

# 步骤 3: 生成统计数据 & 打包网站
step_build() {
  echo ""
  echo "🔄 [生成统计数据 & 打包网站]..."
  node "$ROOT_DIR/scripts/generate-stats.mjs"
  npm --prefix "$ROOT_DIR" run build
  log_ok "打包完成"
}

# 步骤 4/5: 提交 pages 子模块
step_pages_commit() {
  echo ""
  echo "🔄 [提交 pages 子模块]..."
  if [ ! -e "$PAGES_DIR/.git" ]; then
    log_warn "'$PAGES_DIR' 不是 git 仓库，跳过..."
    return 0
  fi
  commit_if_dirty "$PAGES_DIR" "chore: update douyin links"
}

step_pages_push() {
  echo ""
  echo "🔄 [推送 pages 子模块]..."
  git_push "$PAGES_DIR"
}

# 步骤 6/7: 更新主仓库 submodule 引用
step_repo_commit() {
  echo ""
  echo "🔄 [更新主仓库 submodule 引用]..."
  commit_if_dirty "$ROOT_DIR" "chore: update pages submodule" "pages"
}

step_repo_push() {
  echo ""
  echo "🔄 [推送主仓库]..."
  git_push "$ROOT_DIR"
}

# 步骤 8: 启动开发服务器预览
step_dev() {
  echo ""
  echo "🔄 [启动开发服务器预览] 按 Ctrl+C 停止后返回菜单..."
  local pkg_mgr="pnpm"
  if ! command -v pnpm >/dev/null 2>&1; then
    log_warn "未检测到 pnpm，回退到 npm run dev"
    pkg_mgr="npm"
  fi
  set +e
  trap '' INT
  ( cd "$ROOT_DIR" && "$pkg_mgr" run dev )
  local code=$?
  trap - INT
  set -e
  echo ""
  if [ "$code" -eq 0 ] || [ "$code" -eq 130 ]; then
    log_ok "开发服务器已停止，返回菜单"
  else
    log_warn "开发服务器异常退出（退出码 $code）"
  fi
}

# 步骤 1: 全部执行
run_all() {
  echo ""
  echo "🚀 开始一键完整部署..."
  PUSH_FAILED=0
  run_step step_douyin
  run_step step_build
  run_step step_pages_commit
  step_pages_push || true
  run_step step_repo_commit
  step_repo_push || true
  echo ""
  if [ "$PUSH_FAILED" -eq 0 ]; then
    log_ok "一键部署全部完成！"
  else
    log_warn "部署过程中有 push 失败，请检查网络 / 认证后重试（详见上方提示）"
  fi
}

# ==================== 菜单 ====================

show_menu() {
  echo ""
  echo "========================================"
  echo "  部署脚本 — 交互式菜单"
  echo "========================================"
  echo "  1) 全部执行（一键完整部署）"
  echo "  2) 更新抖音链接"
  echo "  3) 生成统计数据 & 打包网站"
  echo "  4) 提交 pages 子模块（仅提交）"
  echo "  5) 提交 pages 子模块（提交 + 推送）"
  echo "  6) 更新主仓库 submodule 引用（仅提交）"
  echo "  7) 更新主仓库 submodule 引用（提交 + 推送）"
  echo "  8) 启动开发服务器预览（pnpm run dev · Ctrl+C 返回菜单）"
  echo "  0) 退出"
  echo "========================================"
}

while true; do
  show_menu
  read -r -p "请输入编号 [0-8]: " choice
  echo ""
  case "$choice" in
    1) run_all; pause ;;
    2) run_step step_douyin; pause ;;
    3) run_step step_build; pause ;;
    4) run_step step_pages_commit; pause ;;
    5) run_step step_pages_commit; step_pages_push || true; pause ;;
    6) run_step step_repo_commit; pause ;;
    7) run_step step_repo_commit; step_repo_push || true; pause ;;
    8) step_dev; pause ;;
    0) echo "👋 退出脚本"; break ;;
    *) log_warn "无效输入，请重新选择"; sleep 1 ;;
  esac
done