# vitepress-theme-curve — Agent Guide

## ⚠️ 永久记忆：实现功能前先查阅官方文档，优先官方方案
修改功能前先查阅对应官方文档，理解 API 与最佳实践，再规划实现。优先使用官方提供的实现方式，其次才自己手写。

## ⚠️ 永久记忆：涉及算法时优先用第三方库
需要算法时先搜索 npm/github 寻找成熟库，避免手写不完善的逻辑。
修改功能前先查阅对应官方文档，理解 API 与最佳实践，再规划实现。优先使用官方提供的实现方式，其次才自己手写。

## ⚠️ 永久记忆：每次修改功能后，务必执行 git 备份
修改完功能后必须执行以下命令提交代码：
```bash
git add . && git commit -m "feat: ..." && git push
```

## Quick start
```bash
npm run dev        # dev server on port 9877
npm run build      # output → .vitepress/dist
npm run preview    # preview built site
npm run lint       # ESLint (vue3 + airbnb-base, runs --fix)
npm run format     # Prettier
```

## Registry & package manager
- `.npmrc` uses npmmirror registry with `shamefully-hoist=true`
- Both `package-lock.json` and `pnpm-lock.yaml` committed; pnpm preferred per README

## Architecture
- VitePress site using custom theme (`curve`) by imsyy
- Theme entry: `.vitepress/theme/index.mjs`
- VitePress config: `.vitepress/config.mjs`
- `@` alias → `.vitepress/theme` (configured in vite section of config.mjs)
- `type: "module"` — all config/scripts are ESM

## Theme configuration
- Default config: `.vitepress/theme/assets/themeConfig.mjs`
- User override: copy to root as `themeConfig.mjs` (gitignored); `.vitepress/init.mjs` merges it at build/dev time
- **Do not rename or delete the original file** or override won't apply

## Content structure
- `pages/posts/` — blog posts (markdown, frontmatter with `title`, `date`, `tags`, `categories`, `top`, `cover`, `description`)
- `pages/` — static pages
- `page-example/` — dynamic route example for pagination (`[num].paths.mjs`)
- `public/` — static assets

## Build & tooling quirks
- Build minifier: **terser** (strips `console.log` via `pure_funcs`)
- Generated files (do not edit): `.vitepress/auto-imports.d.ts`, `.vitepress/components.d.ts`
- `cleanUrls: true` — no `.html` in URLs
- PWA via `@vite-pwa/vitepress`
- Vite dev server port: **9877** (not default 5173)

## Markdown extensions
- Custom containers: `::: timeline`, `::: radio`, `::: button`, `::: card`
- Obsidian-style admonitions: `ad-note`, `ad-tip`, `ad-warning`, `ad-danger`, `ad-question`, `ad-summary`, `ad-hint`, `ad-important`, `ad-caution`, `ad-error`
- `markdown-it-attrs` — add classes/attrs to elements via `{#id .class}`
- `vitepress-plugin-tabs` — tabbed content
- MathJax, image lazy loading, line numbers, fancybox lightbox

## Testing
- No test framework configured

## ESLint
- Extends `airbnb-base` + `plugin:vue/vue3-essential`
- Double quotes, `import/extensions: off`, `no-console: off`
- Lint command runs `--fix` by default
