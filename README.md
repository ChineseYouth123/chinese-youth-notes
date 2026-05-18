# 中国青年笔记

一个基于 VitePress 的知识整理与分享站点。

## 克隆项目

```bash
# 克隆主仓库（含子模块）
git clone git@github.com:ChineseYouth123/chinese-youth-notes.git --recurse-submodules
cd chinese-youth-notes

# 如果已克隆主仓库，拉取子模块
git submodule update --init --recursive
```

## 快速开始

```bash
pnpm install
pnpm dev       # 开发服务器 → http://localhost:9877
pnpm build     # 构建 → .vitepress/dist
pnpm preview   # 预览构建结果
pnpm lint      # ESLint
pnpm format    # Prettier
```

## 目录结构

- `pages/` — 文档内容（Git 子模块，独立仓库管理）
- `theme/` — 自定义主题组件（基于 vitepress-theme-curve）
- `.vitepress/` — VitePress 配置与主题入口
- `public/` — 静态资源

## 文档管理

文档内容位于 `pages/`，作为 Git 子模块单独管理：

- **子模块仓库**: `git@github.com:ChineseYouth123/pages.git`
- **子模块的提交记录不存储在主仓库中**

### 更新文档内容

```bash
# 拉取子模块最新内容
git submodule update --remote pages

# 进入 pages 目录编辑后提交到子模块仓库
cd pages
git add . && git commit -m "update"
git push
cd ..
git add pages && git commit -m "chore: update pages submodule"
git push
```

## 技术栈

VitePress · Vue 3 · SCSS · PWA · Terser

> Powered by [vitepress-theme-curve](https://github.com/imsyy/vitepress-theme-curve)
