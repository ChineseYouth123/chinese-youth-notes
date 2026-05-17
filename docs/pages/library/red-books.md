---
title: 红色书籍
---

# 红色书籍

红色经典相关电子图书资料。

<script setup>
const mdGlob = import.meta.glob('/pages/library/red-books/*.md')
const pdfGlob = import.meta.glob('/pages/library/red-books/*.pdf')

const files = [
  ...Object.keys(mdGlob).map((path) => {
    const name = path.split('/').pop().replace(/\.md$/, '')
    return { path, name, link: '/pages/library/red-books/' + encodeURIComponent(name), ext: '.md' }
  }),
  ...Object.keys(pdfGlob).map((path) => {
    const name = path.split('/').pop().replace(/\.pdf$/, '')
    return { path, name, link: '/pages/library/red-books/pdf/' + encodeURIComponent(name), ext: '.pdf' }
  }),
].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
</script>

<FileList :files="files" />
