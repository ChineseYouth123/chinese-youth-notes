---
title: 红色书籍
---

<script setup>
import { useData } from "vitepress";

const { params } = useData();
const fileName = params.value.name + ".pdf";
const title = params.value.name;

const pdfModules = import.meta.glob("/pages/library/red-books/*.pdf", { eager: true });
const pdfKey = Object.keys(pdfModules).find((k) => k.endsWith(fileName));
const mod = pdfKey ? pdfModules[pdfKey] : null;
const pdfUrl = mod?.default || mod || "";
</script>

<PdfContent :title="title" :pdf-url="pdfUrl" />
