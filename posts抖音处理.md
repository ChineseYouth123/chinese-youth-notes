# 抖音博客表格处理工具

自动解析博客 Markdown 文件中抖音分享文本，提取纯净标题、标签和短链接，回填表格。

## 功能

输入 `完整链接` 列的原始抖音分享文本，自动识别并填入：

| 列 | 提取内容 | 示例 |
|---|---|---|
| 分类 | `#标签` → `<code>标签</code>` | `<code>马斯克</code> <code>AI</code>` |
| url标题 | 中文描述（去除时间戳、分享码、@用户） | 马斯克说4年后人类全部失业 |
| 链接 | 抖音短链接 | `https://v.douyin.com/b67_H-_lTO4/` |

## 使用

```bash
node fill-blog-table.js ./2026-05-19.md
```

输出 `2026-05-19.filled.md`，原始文件不变。

## 输入/输出示例

**处理前（`完整链接` 列的原始文本）：**

```
8.41 XzG:/ :6pm 01/10 X@Z.MJ 历史上的今天：1975年5月19日 全国劳模时传祥逝世
# 1975年# 劳动模范 # 劳模 # 时传祥 # 掏粪工 @抖音小助手 @DOU+小助手
https://v.douyin.com/YBBQqar_RO4/ 复制此链接，打开Dou音搜索，直接观看视频！
```

**处理后表格：**

| 分类 | url标题 | 链接 |
|---|---|---|
| `<code>1975年</code> <code>劳动模范</code> ... | 历史上的今天：1975年5月19日 全国劳模时传祥逝世 | https://v.douyin.com/YBBQqar_RO4/ |

## 输出格式自定义

编辑脚本中 `formatTags` 部分：

```js
// HTML 标签（默认）
tags.map(t => `<code>${t}</code>`).join(' ')

// Markdown 反引号
tags.map(t => `\`${t}\``).join(' ')

// 纯文本逗号分隔
tags.join(', ')
```

## 批量处理

```bash
node fill-blog-table.js ./posts目录
```
