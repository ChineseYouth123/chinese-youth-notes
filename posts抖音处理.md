这个 Node.js 脚本（`fill-blog-table.js`）是一个**自动化博客内容整理工具**。

它的核心功能是：**读取 Markdown 文件中的表格，自动解析“完整链接”列里的抖音分享文本，提取出纯净的标题、标签和短链接，并回填到表格对应列中，最后生成一个新的 Markdown 文件。**

---

### 🛠️ 它具体做了什么？

1.  **解析 Frontmatter**：保留博客的元数据（标题、日期、分类等）。
2.  **定位表格**：找到文档中的 Markdown 表格。
3.  **智能提取**：
    *   **清洗标题**：从杂乱的抖音分享文案中，精准截取中文描述，去除时间戳、分享码、`@用户` 等噪声。
    *   **提取标签**：识别 `#标签`，并将其格式化为 `<code>标签</code>`（或反引号格式），填入“分类”列。
    *   **提取链接**：提取标准的抖音短链接 (`v.douyin.com/...`)，填入“链接”列。
4.  **回填更新**将处理好的干净数据写回原表格位置。
5.  **保存文件**：生成一个 `.filled.md` 新文件，保持原有格式不变。

---

### 🚀 如何使用？

#### 第一步：准备环境

确保你已安装 Node.js (建议 v18+)。

1. 创建项目文件夹并初始化：
   ```bash
   mkdir blog-tool && cd blog-tool
   npm init -y
   ```

2. 设置 ES Module 支持（在 `package.json` 中添加 `"type": "module"`）：
   ```json
   {
     "name": "blog-tool",
     "version": "1.0.0",
     "type": "module" 
   }
   ```

3. 安装依赖库：
   ```bash
   npm install gray-matter
   ```

4. 将上面的完整代码保存为 `fill-blog-table.js`。

#### 第二步：运行脚本

假设你的博客文件名为 `05-17-博客.md`，放在当前目录下。

```bash
node fill-blog-table.js ./05-17-博客.md
```

#### 第三步：查看结果

脚本会在同一目录下生成一个新文件：`05-17-博客.filled.md`。

打开该文件，你会发现表格变成了这样：

| 序号 | 分类 | 贡献用户 | url标题 | 链接 | 完整链接 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `<code>马斯克</code> <code>AI</code>` | @yonghu1 | 马斯克说4年后人类全部失业，我听完3小时访谈整个人都麻了 | https://v.douyin.com/b67_H-_lTO4/ | (原始长文本...) |

---

### ⚙️ 自定义配置（可选）

如果你不喜欢 `<code>` 格式的分类，想改成普通的文字或 Markdown 反引号，只需修改脚本中的这一行：

**修改前（HTML code 标签）：**
```javascript
const categoryHtml = tags.length > 0
  ? tags.map(t => `<code>${t}</code>`).join(' ')
  : '未分类';
```

**修改后（Markdown 反引号）：**
```javascript
const categoryHtml = tags.length > 0
  ? tags.map(t => `\`${t}\``).join(' ') // 变成 `马斯克` `AI`
  : '未分类';
```

**修改后（纯文本逗号分隔）：**
```javascript
const categoryHtml = tags.length > 0
  ? tags.join(', ') // 变成 马斯克, AI
  : '未分类';
```

---

### 💡 常见场景扩展

1.  **批量处理整个文件夹**：
    如果你想一次性处理所有 `.md` 文件，可以在脚本末尾添加以下代码：
    ```javascript
    import fs from 'fs';
    // ... 前面的代码 ...

    if (isMain) {
      const targetDir = process.argv[2] || '.';
      const files = fs.readdirSync(targetDir).filter(f => f.endsWith('.md') && !f.includes('.filled.'));
      
      for (const file of files) {
        console.log(`\n🔄 正在处理: ${file}`);
        try {
          fillBlogTable(path.join(targetDir, file));
        } catch (e) {
          console.error(`❌ 失败: ${file}`, e.message);
        }
      }
    }
    ```
    然后运行：`node fill-blog-table.js ./blogs`

2.  **导出为 Excel/CSV**：
    如果需要给非技术人员编辑，可以将 `processedData` 数组使用 `json2csv` 库转换为 CSV 文件。

这个工具能极大节省手动复制粘贴、清洗抖音分享文案的时间！如有其他需求欢迎继续提问。