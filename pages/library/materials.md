---
title: 资料
---

# 资料

各类电子图书资料。

<script setup>
const mdGlob = import.meta.glob('/pages/library/materials/*.md')
const txtGlob = import.meta.glob('/pages/library/materials/*.txt')
const pdfGlob = import.meta.glob('/pages/library/materials/*.pdf')

const files = [
  ...Object.keys(mdGlob).map((path) => {
    const name = path.split('/').pop().replace(/\.md$/, '')
    return { path, name, link: '/pages/library/materials/' + encodeURIComponent(name), ext: '.md' }
  }),
  ...Object.keys(txtGlob).map((path) => {
    const name = path.split('/').pop().replace(/\.txt$/, '')
    return { path, name, link: '/pages/library/materials/view/' + encodeURIComponent(name), ext: '.txt' }
  }),
  ...Object.keys(pdfGlob).map((path) => {
    const name = path.split('/').pop().replace(/\.pdf$/, '')
    return { path, name, link: '/pages/library/materials/pdf/' + encodeURIComponent(name), ext: '.pdf' }
  }),
].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
</script>

<FileList :files="files" />
