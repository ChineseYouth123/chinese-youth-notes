# 东方红

> 让我们一起团结合作！一起创造更美好的未来！

基于 VitePress 构建的马列毛思想学习与交流站点。提供经典文献、学习笔记、资料汇编等内容。

🌐 在线访问：<https://chineseyouth123.github.io/chinese-youth-notes/>

## 目录结构

```
.
├── pages/                    # 📄 站点内容（Git 子模块）
│   ├── posts/                #   文章/学习笔记
│   ├── library/              #   文献库（马列毛著作等）
│   ├── categories/           #   分类页面
│   ├── tags/                 #   标签页面
│   ├── about.md              #   关于页面
│   ├── archives.md           #   归档页面
│   └── ...
├── theme/                    # 🎨 自定义主题
│   ├── components/           #   通用组件（导航、搜索、翻页、播放器等）
│   ├── views/                #   页面级视图（首页、文章页、归档等）
│   ├── composables/          #   Vue 组合式函数
│   ├── store/                #   状态管理
│   ├── style/                #   样式文件
│   └── utils/                #   工具函数（RSS 生成、数据处理等）
├── .vitepress/
│   ├── config.mjs            #   VitePress 主配置
│   └── theme/                #   主题入口与资源
└── public/                   # 🖼️ 静态资源
```

## 克隆与运行

```bash
# 克隆主仓库（含子模块）
git clone git@github.com:ChineseYouth123/chinese-youth-notes.git --recurse-submodules
cd chinese-youth-notes

# 如果已克隆但未拉取子模块
git submodule update --init --recursive

# 安装依赖并启动
pnpm install
pnpm dev       # → http://localhost:9877

# 其他命令
pnpm build     # 构建 → .vitepress/dist
pnpm preview   # 预览构建结果
pnpm lint      # ESLint
pnpm format    # Prettier
```

## 文档管理

站点内容位于 `pages/`，作为 Git 子模块独立管理，提交记录不混入主仓库。

- **子模块仓库**: `git@github.com:ChineseYouth123/pages.git`

### 更新文档

```bash
# 拉取子模块（文档）最新内容
git submodule update --remote pages

# 编辑后提交到子模块仓库
cd pages
git add . && git commit -m "update"
git push
cd ..
git add pages && git commit -m "chore: update pages submodule"
git push
```

## 功能特性

- **Markdown 扩展** — 自定义容器（时间线、卡片、按钮等）、Obsidian 风格提示块、标签页、数学公式、图片灯箱
- **PWA** — 离线缓存，可安装为应用
- **RSS** — 自动生成订阅源
- **全文搜索** — 站内搜索
- **音频播放器** — 支持音频内容
- **PDF 阅读** — 内置 PDF 浏览
- **代码高亮与行号**

## 技术栈

VitePress · Vue 3 · SCSS · PWA · Terser

> 主题基于 [vitepress-theme-curve](https://github.com/imsyy/vitepress-theme-curve)
