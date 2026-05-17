---
title: 毛泽东
---

# 毛泽东

毛泽东相关电子图书资料。

<script setup>
const mdGlob = import.meta.glob('/pages/library/maozedong/*.md')
const pdfGlob = import.meta.glob('/pages/library/maozedong/*.pdf')

const files = [
  ...Object.keys(mdGlob).map((path) => {
    const name = path.split('/').pop().replace(/\.md$/, '')
    return { path, name, link: '/pages/library/maozedong/' + encodeURIComponent(name), ext: '.md' }
  }),
  ...Object.keys(pdfGlob).map((path) => {
    const name = path.split('/').pop().replace(/\.pdf$/, '')
    return { path, name, link: '/pages/library/maozedong/pdf/' + encodeURIComponent(name), ext: '.pdf' }
  }),
].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
</script>

<FileList :files="files" />
