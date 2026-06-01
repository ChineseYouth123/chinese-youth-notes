<template>
  <div class="file-list-wrapper">
    <div class="sort-controls">
      <button
        class="sort-btn"
        :class="{ active: sortBy === 'date' }"
        @click="toggleSort('date')"
      >
        按日期 {{ sortBy === 'date' ? (sortOrder === 'desc' ? '↓' : '↑') : '' }}
      </button>
      <button
        class="sort-btn"
        :class="{ active: sortBy === 'name' }"
        @click="toggleSort('name')"
      >
        按名称 {{ sortBy === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
      </button>
    </div>
    <div class="file-list">
      <a
        v-for="file in sortedFiles"
        :key="file.path"
        :href="withBase(file.link)"
        class="file-item s-card"
      >
        <div class="file-info">
          <span class="file-name">{{ file.name }}</span>
          <div class="file-meta">
            <span v-if="file.date" class="file-date">{{ formatDate(file.date) }}</span>
            <span v-if="file.tags && file.tags.length" class="file-tags">
              <span v-for="tag in file.tags" :key="tag" class="file-tag">{{ tag }}</span>
            </span>
          </div>
        </div>
        <span class="file-arrow">→</span>
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue"
import { withBase } from "vitepress"

const props = defineProps({
  files: {
    type: Array,
    required: true,
  },
})

const sortBy = ref("date")
const sortOrder = ref("desc")

const toggleSort = (key) => {
  if (sortBy.value === key) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc"
  } else {
    sortBy.value = key
    sortOrder.value = key === "date" ? "desc" : "asc"
  }
}

const sortedFiles = computed(() => {
  const sorted = [...props.files]
  if (sortBy.value === "date") {
    sorted.sort((a, b) => {
      const dateA = a.date || 0
      const dateB = b.date || 0
      return sortOrder.value === "desc" ? dateB - dateA : dateA - dateB
    })
  } else {
    sorted.sort((a, b) => {
      const cmp = a.name.localeCompare(b.name, "zh-CN")
      return sortOrder.value === "asc" ? cmp : -cmp
    })
  }
  return sorted
})

const formatDate = (ts) => {
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}
</script>

<style lang="scss" scoped>
.file-list-wrapper {
  margin-top: 1rem;
}
.sort-controls {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.sort-btn {
  padding: 0.4rem 0.85rem;
  border-radius: 8px;
  border: 1px solid var(--main-card-border);
  background: var(--main-card-background);
  color: var(--main-font-color);
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  &:hover {
    border-color: var(--main-theme-color);
    color: var(--main-theme-color);
  }
  &.active {
    border-color: var(--main-theme-color);
    color: var(--main-theme-color);
    background: color-mix(in srgb, var(--main-theme-color) 10%, transparent);
  }
}
.file-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1.25rem;
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
.file-info {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 0;
}
.file-name {
  font-size: 1rem;
  font-weight: 500;
}
.file-meta {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}
.file-date {
  font-size: 0.8rem;
  opacity: 0.6;
  white-space: nowrap;
}
.file-tags {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}
.file-tag {
  font-size: 0.72rem;
  padding: 0.1rem 0.45rem;
  border-radius: 4px;
  background: color-mix(in srgb, var(--main-theme-color) 15%, transparent);
  color: var(--main-theme-color);
  white-space: nowrap;
}
.file-arrow {
  font-size: 1.125rem;
  opacity: 0.5;
  flex-shrink: 0;
  margin-left: 0.75rem;
}
</style>
