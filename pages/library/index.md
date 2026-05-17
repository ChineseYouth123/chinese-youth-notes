---
title: 图书馆
---

# 📚 图书馆

欢迎来到图书馆，这里收录了各类电子图书资料。

## 分类导航

| 类别 | 说明 | 链接 |
|------|------|------|
| 毛泽东 | 毛泽东相关电子图书资料 | [进入 →](./maozedong) |
| 红色书籍 | 红色经典相关电子图书资料 | [进入 →](./red-books) |
| 资料 | 各类电子图书资料 | [进入 →](./materials) |

<script setup>
const txtGlob = import.meta.glob('/pages/library/*.txt')
const pdfGlob = import.meta.glob('/pages/library/*.pdf')

const files = [
  ...Object.keys(txtGlob).map((path) => {
    const name = path.split('/').pop().replace(/\.txt$/, '')
    return { path, name, link: '/pages/library/view/' + encodeURIComponent(name), ext: '.txt' }
  }),
  ...Object.keys(pdfGlob).map((path) => {
    const basename = path.split('/').pop()
    const name = basename.replace(/\.pdf$/, '')
    return { path, name, link: '/pages/library/' + encodeURIComponent(basename), ext: '.pdf' }
  }),
].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
</script>

<FileList v-if="files.length" :files="files" />
