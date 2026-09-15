@echo off
REM deploy.bat — Windows CMD 交互式部署脚本
REM 交互式菜单：可选择单步执行或一键部署
chcp 65001 >nul
setlocal enabledelayedexpansion

set "ROOT_DIR=%~dp0.."
set "PAGES_DIR=%ROOT_DIR%\pages"
set "POSTS_YEAR=2026"
set "PUSH_FAILED=0"

:menu
echo.
echo ========================================
echo  部署脚本 — 交互式菜单
echo ========================================
echo  1) 全部执行（一键完整部署）
echo  2) 更新抖音链接
echo  3) 生成统计数据 ^& 打包网站
echo  4) 提交 pages 子模块（仅提交）
echo  5) 提交 pages 子模块（提交 + 推送）
echo  6) 更新主仓库 submodule 引用（仅提交）
echo  7) 更新主仓库 submodule 引用（提交 + 推送）
echo  8) 启动开发服务器预览（pnpm run dev - Ctrl+C 返回菜单）
echo  0) 退出
echo ========================================
set /p choice=请输入编号 [0-8]: 

if "%choice%"=="1" call :step_all & goto :after_step
if "%choice%"=="2" call :step_douyin & goto :after_step
if "%choice%"=="3" call :step_build & goto :after_step
if "%choice%"=="4" call :step_pages_commit & goto :after_step
if "%choice%"=="5" call :step_pages_commit & call :step_pages_push & goto :after_step
if "%choice%"=="6" call :step_repo_commit & goto :after_step
if "%choice%"=="7" call :step_repo_commit & call :step_repo_push & goto :after_step
if "%choice%"=="8" call :step_dev & goto :after_step
if "%choice%"=="0" echo. & echo [完成] 已退出脚本 & goto :eof
echo [警告] 无效输入，请重新选择
timeout /t 1 >nul
goto menu

:after_step
pause
goto menu

:step_douyin
echo.
echo [更新抖音链接]...
if not exist "%ROOT_DIR%\douyinUrl.js" (
  echo [错误] 找不到 "%ROOT_DIR%\douyinUrl.js"
  exit /b 2
)
node "%ROOT_DIR%\douyinUrl.js" "%PAGES_DIR%\posts\%POSTS_YEAR%\"
if errorlevel 1 (
  echo [错误] douyinUrl.js 异常退出
  exit /b 2
)
echo [OK]  抖音链接更新完成
goto :eof

:step_build
echo.
echo [生成统计数据 ^& 打包网站]...
node "%ROOT_DIR%\scripts\generate-stats.mjs"
if errorlevel 1 (
  echo [错误] generate-stats.mjs 异常退出
  exit /b 2
)
npm --prefix "%ROOT_DIR%" run build
if errorlevel 1 (
  echo [错误] 打包失败
  exit /b 2
)
echo [OK]  打包完成
goto :eof

:step_pages_commit
echo.
echo [提交 pages 子模块]...
if not exist "%PAGES_DIR%\.git\" (
  echo [警告] "%PAGES_DIR%" 不是 git 仓库，跳过...
  goto :eof
)
pushd "%PAGES_DIR%"
git add -A
git diff --cached --quiet
if errorlevel 1 (
  git commit -m "chore: update douyin links"
  if errorlevel 1 (
    echo [错误] git commit 失败
    popd
    exit /b 2
  )
  echo [OK]  已提交
) else (
  echo [提示] 无变更，跳过提交
)
popd
goto :eof

:step_pages_push
echo.
echo [推送 pages 子模块]...
pushd "%PAGES_DIR%"
git push
if errorlevel 1 (
  echo [警告] push 失败：%PAGES_DIR%
  set PUSH_FAILED=1
) else (
  echo [OK]  已推送
)
popd
goto :eof

:step_repo_commit
echo.
echo [更新主仓库 submodule 引用]...
pushd "%ROOT_DIR%"
git add -A -- pages
git diff --cached --quiet
if errorlevel 1 (
  git commit -m "chore: update pages submodule" -- pages
  if errorlevel 1 (
    echo [错误] git commit 失败
    popd
    exit /b 2
  )
  echo [OK]  已提交
) else (
  echo [提示] 无变更，跳过提交
)
popd
goto :eof

:step_repo_push
echo.
echo [推送主仓库]...
pushd "%ROOT_DIR%"
git push
if errorlevel 1 (
  echo [警告] push 失败：%ROOT_DIR%
  set PUSH_FAILED=1
) else (
  echo [OK]  已推送
)
popd
goto :eof

:step_dev
echo.
echo [启动开发服务器预览] 按 Ctrl+C 停止后返回菜单...
where pnpm >nul 2>nul
if errorlevel 1 (
  echo [警告] 未检测到 pnpm，回退到 npm run dev
  pushd "%ROOT_DIR%"
  npm run dev
  popd
) else (
  pushd "%ROOT_DIR%"
  pnpm run dev
  popd
)
echo [OK]  开发服务器已停止，返回菜单
goto :eof

:step_all
echo.
echo ========================================
echo  一键完整部署开始
echo ========================================
set "PUSH_FAILED=0"
call :step_douyin
if errorlevel 2 goto :step_all_failed
call :step_build
if errorlevel 2 goto :step_all_failed
call :step_pages_commit
if errorlevel 2 goto :step_all_failed
call :step_pages_push
call :step_repo_commit
if errorlevel 2 goto :step_all_failed
call :step_repo_push
echo.
if "%PUSH_FAILED%"=="1" (
  echo [警告] 部署过程中有 push 失败，请检查网络/认证后重试（详见上方提示）
) else (
  echo [OK]  一键部署全部完成！
)
goto :eof

:step_all_failed
echo [错误] 一键部署中断（某一步失败）
goto :eof