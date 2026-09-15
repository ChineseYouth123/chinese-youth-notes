# deploy.ps1 — Windows PowerShell 交互式部署脚本
# 交互式菜单：可选择单步执行或一键部署
$ErrorActionPreference = "Stop"

$ROOT_DIR = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$PAGES_DIR = Join-Path $ROOT_DIR "pages"
$POSTS_YEAR = "2026"
$PUSH_FAILED = $false

function log_ok { param([string]$msg) Write-Host "   ✅ $msg" }
function log_warn { param([string]$msg) Write-Host "   ⚠️  $msg" }
function log_error { param([string]$msg) Write-Host "   ❌ $msg" -ForegroundColor Red }

function pause-menu {
    Write-Host ""
    Read-Host "按回车键返回菜单..." | Out-Null
    Write-Host ""
}

# 有变更才提交（避免空提交污染 git 历史）
function Commit-IfDirty {
    param([string]$repo, [string]$msg, [string]$pathspec = ".")
    Push-Location -Path $repo
    try {
        git add -A -- $pathspec
        if ($LASTEXITCODE -ne 0) { throw "git add 失败" }
        git diff --cached --quiet
        if ($LASTEXITCODE -eq 0) {
            log_warn "无变更，跳过提交（$msg）"
        } else {
            git commit -m $msg -- $pathspec
            if ($LASTEXITCODE -ne 0) { throw "git commit 失败" }
            log_ok "已提交：$msg"
        }
    } finally {
        Pop-Location
    }
}

# 推送并聚合失败状态
function Git-Push {
    param([string]$repo)
    $branch = (git -C $repo branch --show-current 2>$null)
    Push-Location -Path $repo
    try {
        git push
        if ($LASTEXITCODE -eq 0) {
            log_ok "已推送（$branch）"
        } else {
            log_error "push 失败：$repo"
            $script:PUSH_FAILED = $true
        }
    } finally {
        Pop-Location
    }
}

# 运行步骤并捕获错误，交互式菜单中失败不终止脚本
function Run-Step {
    param([string]$name, [scriptblock]$action)
    Write-Host ""
    try {
        & $action
        if ($LASTEXITCODE -and $LASTEXITCODE -ne 0) { throw "命令退出码 $LASTEXITCODE" }
        log_ok "$name 执行成功"
    } catch {
        log_error "$name 执行失败：$($_.Exception.Message)"
    }
}

# ==================== 步骤函数 ====================

function step-douyin {
    Write-Host "🔄 [更新抖音链接]..."
    $js = Join-Path $ROOT_DIR "douyinUrl.js"
    if (-not (Test-Path $js)) { throw "找不到 $js" }
    node $js (Join-Path $PAGES_DIR "posts/$POSTS_YEAR/")
    if ($LASTEXITCODE -ne 0) { throw "douyinUrl.js 异常退出（$LASTEXITCODE）" }
}

function step-build {
    Write-Host "🔄 [生成统计数据 & 打包网站]..."
    node (Join-Path $ROOT_DIR "scripts/generate-stats.mjs")
    if ($LASTEXITCODE -ne 0) { throw "generate-stats.mjs 异常退出（$LASTEXITCODE）" }
    npm --prefix $ROOT_DIR run build
    if ($LASTEXITCODE -ne 0) { throw "npm run build 失败（$LASTEXITCODE）" }
}

function step-pages-commit {
    Write-Host "🔄 [提交 pages 子模块]..."
    if (-not (Test-Path (Join-Path $PAGES_DIR ".git"))) {
        log_warn "'$PAGES_DIR' 不是 git 仓库，跳过..."
        return
    }
    Commit-IfDirty -repo $PAGES_DIR -msg "chore: update douyin links"
}

function step-pages-push {
    Write-Host "🔄 [推送 pages 子模块]..."
    Git-Push -repo $PAGES_DIR
}

function step-repo-commit {
    Write-Host "🔄 [更新主仓库 submodule 引用]..."
    Commit-IfDirty -repo $ROOT_DIR -msg "chore: update pages submodule" -pathspec "pages"
}

function step-repo-push {
    Write-Host "🔄 [推送主仓库]..."
    Git-Push -repo $ROOT_DIR
}

function step-dev {
    Write-Host "🔄 [启动开发服务器预览] 按 Ctrl+C 停止后返回菜单..."
    $cmd = "pnpm"
    if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
        log_warn "未检测到 pnpm，回退到 npm run dev"
        $cmd = "npm"
    }
    Push-Location -Path $ROOT_DIR
    try {
        & $cmd run dev
    } finally {
        Pop-Location
    }
    Write-Host ""
    log_ok "开发服务器已停止，返回菜单"
}

function step-all {
    Write-Host ""
    Write-Host "🚀 开始一键完整部署..."
    $script:PUSH_FAILED = $false
    Run-Step "更新抖音链接" { step-douyin }
    Run-Step "生成统计数据 & 打包网站" { step-build }
    Run-Step "提交 pages 子模块" { step-pages-commit }
    step-pages-push
    Run-Step "更新主仓库 submodule 引用" { step-repo-commit }
    step-repo-push
    Write-Host ""
    if ($PUSH_FAILED) {
        log_warn "部署过程中有 push 失败，请检查网络 / 认证后重试（详见上方提示）"
    } else {
        log_ok "一键部署全部完成！"
    }
}

# ==================== 菜单 ====================

while ($true) {
    Write-Host ""
    Write-Host "========================================"
    Write-Host "  部署脚本 — 交互式菜单"
    Write-Host "========================================"
    Write-Host "  1) 全部执行（一键完整部署）"
    Write-Host "  2) 更新抖音链接"
    Write-Host "  3) 生成统计数据 & 打包网站"
    Write-Host "  4) 提交 pages 子模块（仅提交）"
    Write-Host "  5) 提交 pages 子模块（提交 + 推送）"
    Write-Host "  6) 更新主仓库 submodule 引用（仅提交）"
    Write-Host "  7) 更新主仓库 submodule 引用（提交 + 推送）"
    Write-Host "  8) 启动开发服务器预览（pnpm run dev · Ctrl+C 返回菜单）"
    Write-Host "  0) 退出"
    Write-Host "========================================"
    $choice = Read-Host "请输入编号 [0-8]"

    switch ($choice) {
        "1" { step-all; pause-menu }
        "2" { Run-Step "更新抖音链接" { step-douyin }; pause-menu }
        "3" { Run-Step "生成统计数据 & 打包网站" { step-build }; pause-menu }
        "4" { Run-Step "提交 pages 子模块" { step-pages-commit }; pause-menu }
        "5" { Run-Step "提交 pages 子模块" { step-pages-commit }; step-pages-push; pause-menu }
        "6" { Run-Step "更新主仓库 submodule 引用" { step-repo-commit }; pause-menu }
        "7" { Run-Step "更新主仓库 submodule 引用" { step-repo-commit }; step-repo-push; pause-menu }
        "8" { step-dev; pause-menu }
        "0" { Write-Host "👋 退出脚本"; break }
        default { log_warn "无效输入，请重新选择" }
    }
}