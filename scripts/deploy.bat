@echo off
REM deploy.bat — Windows CMD 部署脚本
chcp 65001 >nul

setlocal enabledelayedexpansion
set "ROOT_DIR=%~dp0.."
set "PAGES_DIR=%ROOT_DIR%\pages"

echo ========================================
echo  部署脚本 — 更新抖音链接 ^& 提交代码
echo ========================================

REM 1. 更新抖音链接
echo.
echo [1/4] 更新抖音链接...
if not exist "%ROOT_DIR%\douyinUrl.js" (
    echo [错误] 找不到 "%ROOT_DIR%\douyinUrl.js"
    exit /b 1
)
node "%ROOT_DIR%\douyinUrl.js" "%PAGES_DIR%\posts\2026\"

REM 2. 提交 pages 子模块
echo.
echo [2/4] 提交 pages 子模块...
if not exist "%PAGES_DIR%\.git\" (
    echo [警告] "%PAGES_DIR%" 不是 git 仓库，跳过...
) else (
    pushd "%PAGES_DIR%"
    git add .
    git commit -m "chore: update douyin links" --allow-empty
    git push
    popd
)

REM 3. 更新主仓库 submodule 引用
echo.
echo [3/4] 更新主仓库 submodule 引用...
pushd "%ROOT_DIR%"
git add pages
git commit -m "chore: update pages submodule" --allow-empty
git push
popd

REM 4. 完成
echo.
echo ========================================
echo  [完成]
echo ========================================
endlocal
