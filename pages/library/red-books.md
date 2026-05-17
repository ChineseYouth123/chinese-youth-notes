---
title: 红色书籍
---

# 红色书籍

红色经典相关电子图书资料。

<script setup>
const glob = import.meta.glob('/pages/library/red-books/*.md')

const files = Object.keys(glob)
  .map((path) => {
    const name = path.split('/').pop().replace(/\.md$/, '')
    const link = '/pages/library/red-books/' + encodeURIComponent(name)
    return { path, name, link }
  })
  .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
</script>

<FileList :files="files" />
