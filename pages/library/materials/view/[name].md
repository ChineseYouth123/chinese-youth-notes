---
title: 资料
---

<script setup>
import { useData } from "vitepress";

const { params } = useData();
const fileName = params.value.name + ".txt";
const title = params.value.name;

const txtModules = import.meta.glob("/pages/library/materials/*.txt", {
  as: "raw",
  eager: true,
});
const contentKey = Object.keys(txtModules).find((k) => k.endsWith(fileName));
const content = contentKey ? txtModules[contentKey] : "文件未找到";
</script>

<TextContent :title="title" :content="content" />
