<template>
  <div class="file-list">
    <a
      v-for="file in files"
      :key="file.path"
      :href="withBase(file.link)"
      class="file-item s-card"
    >
      <span class="file-name">{{ file.name }}</span>
      <span class="file-arrow">→</span>
    </a>
  </div>
</template>

<script setup>
import { withBase } from "vitepress"

defineProps({
  files: {
    type: Array,
    required: true,
  },
})
</script>

<style lang="scss" scoped>
.file-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
}
.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  border: 1px solid var(--main-card-border);
  background-color: var(--main-card-background);
  box-shadow: 0 4px 12px -2px var(--main-border-shadow);
  text-decoration: none;
  color: var(--main-font-color);
  transition: all 0.2s ease;
  &:hover {
    transform: translateX(4px);
    box-shadow: 0 6px 16px -2px var(--main-border-shadow);
    border-color: var(--main-theme-color);
    color: var(--main-theme-color);
  }
}
.file-name {
  font-size: 1rem;
  font-weight: 500;
}
.file-arrow {
  font-size: 1.125rem;
  opacity: 0.5;
}
</style>
