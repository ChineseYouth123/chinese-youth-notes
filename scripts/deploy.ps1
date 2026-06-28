# deploy.ps1 — Windows PowerShell 部署脚本
$ErrorActionPreference = "Stop"

$ROOT_DIR = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$PAGES_DIR = Join-Path $ROOT_DIR "pages"

Write-Host "========================================"
Write-Host " 部署脚本 — 更新抖音链接 & 提交代码"
Write-Host "========================================"

# 1. 更新抖音链接
Write-Host "`n[1/4] 更新抖音链接..."
$douyinJs = Join-Path $ROOT_DIR "douyinUrl.js"
if (-not (Test-Path $douyinJs)) {
    Write-Host "❌ 错误: 找不到 $douyinJs"
    exit 1
}
node $douyinJs (Join-Path $PAGES_DIR "posts/2026/")

# 2. 提交 pages 子模块
Write-Host "`n[2/4] 提交 pages 子模块..."
$pagesGit = Join-Path $PAGES_DIR ".git"
if (-not (Test-Path $pagesGit)) {
    Write-Host "⚠️  警告: '$PAGES_DIR' 不是 git 仓库，跳过..."
} else {
    Push-Location $PAGES_DIR
    try {
        git add .
        git commit -m "chore: update douyin links" --allow-empty
        git push
    } finally {
        Pop-Location
    }
}

# 3. 更新主仓库 submodule 引用
Write-Host "`n[3/4] 更新主仓库 submodule 引用..."
Push-Location $ROOT_DIR
try {
    git add pages
    git commit -m "chore: update pages submodule" --allow-empty
    git push
} finally {
    Pop-Location
}

# 4. 完成
Write-Host "`n========================================"
Write-Host " ✅ 完成！"
Write-Host "========================================"
