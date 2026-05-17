# 中国青年笔记

一个基于 VitePress 的知识整理与分享站点。

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

- `pages/` — 文档内容（独立 Git 仓库管理）
- `theme/` — 自定义主题组件（基于 vitepress-theme-curve）
- `.vitepress/` — VitePress 配置与主题入口
- `public/` — 静态资源

## 文档管理

文档内容位于 `pages/` 目录，由独立的 Git 仓库管理：
`https://github.com/ChineseYouth123/docs.git`

## 技术栈

VitePress · Vue 3 · SCSS · PWA · Terser

> Powered by [vitepress-theme-curve](https://github.com/imsyy/vitepress-theme-curve)
