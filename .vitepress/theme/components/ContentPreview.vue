<template>
  <div class="content-preview">
    <div :class="['preview-content', { 'with-aside': showAside }]">
      <div v-if="showCategories && allCategories.length" class="type-bar s-card hover">
        <div :class="['all-type', { expanded: catExpand }]">
          <span
            :class="['type-item', { choose: !selectedCategory }]"
            @click="selectedCategory = ''"
          >全部</span>
          <span
            v-for="cat in allCategories"
            :key="cat"
            :class="['type-item', { choose: selectedCategory === cat }]"
            @click="selectedCategory = cat"
          >{{ cat }} <span class="num">{{ categoryCount[cat] }}</span></span>
        </div>
        <span
          class="type-toggle"
          @click="catExpand = !catExpand"
        >
          <template v-if="catExpand">收起<i class="iconfont icon-up" /></template>
          <template v-else>更多<i class="iconfont icon-arrow-right" /></template>
        </span>
      </div>
      <div v-if="showTags && allTags.length" class="type-bar s-card hover">
        <div :class="['all-type', { expanded: tagExpand }]">
          <span
            :class="['type-item', { choose: !selectedTag }]"
            @click="selectedTag = ''"
          >全部</span>
          <span
            v-for="tag in allTags"
            :key="tag"
            :class="['type-item', { choose: selectedTag === tag }]"
            @click="selectedTag = tag"
          >{{ tag }} <span class="num">{{ tagCount[tag] }}</span></span>
        </div>
        <span
          class="type-toggle"
          @click="tagExpand = !tagExpand"
        >
          <template v-if="tagExpand">收起<i class="iconfont icon-up" /></template>
          <template v-else>更多<i class="iconfont icon-arrow-right" /></template>
        </span>
      </div>
      <div :class="['preview-list', { 'layout-grid': layoutType === 'twoColumns' }]" :style="gridStyle">
        <div
          v-for="(item, index) in displayData"
          :key="item.id || index"
          :class="['preview-item', 's-card', 'hover', { cover: showCover(item), [`cover-${layoutType}`]: showCover(item) }]"
          :style="{ animationDelay: `${0.4 + index / 10}s` }"
          @click="toPost(item.regularPath)"
        >
          <div v-if="showCover(item)" class="item-cover">
            <img :src="getCover(item)" :alt="item.title">
          </div>
          <div class="item-content">
            <div v-if="item?.categories?.length" class="item-category">
              <span v-for="cat in item.categories" :key="cat" class="cat-name">
                <i class="iconfont icon-folder" />
                {{ cat }}
              </span>
              <span v-if="item?.top" class="top">
                <i class="iconfont icon-align-top" />
                置顶
              </span>
            </div>
            <span class="item-title">{{ item.title }}</span>
            <span v-if="item?.description" class="item-desc">{{ item.description }}</span>
            <div class="item-meta">
              <div v-if="item?.tags?.length" class="item-tags">
                <span
                  v-for="tag in item.tags"
                  :key="tag"
                  class="tag-name"
                  @click.stop="router.go(withBase(`/pages/tags/${tag}`))"
                >
                  <i class="iconfont icon-hashtag" />
                  {{ tag }}
                </span>
              </div>
              <span class="item-time">{{ formatTimestamp(item.date) }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="showPagination && totalPages > 1" class="pagination">
        <div
          :class="['page-item', 'prev', { disabled: currentPage <= 1 }]"
          @click="currentPage > 1 && currentPage--"
        >
          <i class="iconfont icon-page-right" />
          <span class="page-text">上页</span>
        </div>
        <div class="page-number">
          <div
            v-for="p in totalPages"
            :key="p"
            :class="['page-item', { choose: p === currentPage }]"
            @click="currentPage = p"
          >
            <span class="page-num">{{ p }}</span>
          </div>
        </div>
        <div
          :class="['page-item', 'next', { disabled: currentPage >= totalPages }]"
          @click="currentPage < totalPages && currentPage++"
        >
          <span class="page-text">下页</span>
          <i class="iconfont icon-page-right" />
        </div>
      </div>
    </div>
    <Aside v-if="showAside" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue"
import { withBase, useData, useRouter } from "vitepress"
import { mainStore } from "@/store"
import { formatTimestamp } from "@/utils/helper"
import Aside from "@/components/Aside/index.vue"

const props = defineProps({
  data: { type: Array, default: () => [] },
  showCategories: { type: Boolean, default: true },
  showTags: { type: Boolean, default: true },
  showAside: { type: Boolean, default: true },
  showPagination: { type: Boolean, default: true },
  pageSize: { type: Number, default: null },
})

const router = useRouter()
const store = mainStore()
const { theme: themeConfig } = useData()

const pageSize = computed(() => props.pageSize ?? (themeConfig.value.postSize || 10))

const allFiles = computed(() => props.data)

const allCategories = computed(() => [...new Set(
  allFiles.value.flatMap((f) => f.categories),
)].sort((a, b) => a.localeCompare(b, "zh-CN")))

const allTags = computed(() => [...new Set(
  allFiles.value.flatMap((f) => f.tags),
)].sort((a, b) => a.localeCompare(b, "zh-CN")))

const selectedCategory = ref("")
const selectedTag = ref("")
const currentPage = ref(1)
const catExpand = ref(false)
const tagExpand = ref(false)

const categoryCount = computed(() => {
  const counts = {}
  allFiles.value.forEach((f) => f.categories.forEach((c) => { counts[c] = (counts[c] || 0) + 1 }))
  return counts
})

const tagCount = computed(() => {
  const counts = {}
  allFiles.value.forEach((f) => f.tags.forEach((t) => { counts[t] = (counts[t] || 0) + 1 }))
  return counts
})

const filteredData = computed(() => {
  let data = allFiles.value
  if (selectedCategory.value) {
    data = data.filter((f) => f.categories.includes(selectedCategory.value))
  }
  if (selectedTag.value) {
    data = data.filter((f) => f.tags.includes(selectedTag.value))
  }
  return data
})

const totalPages = computed(() => Math.ceil(filteredData.value.length / pageSize.value))

const displayData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredData.value.slice(start, start + pageSize.value)
})

watch([selectedCategory, selectedTag], () => {
  currentPage.value = 1
})

const layoutType = computed(() =>
  themeConfig.value?.cover?.twoColumns ? "twoColumns" : themeConfig.value?.cover?.showCover?.coverLayout ?? "left"
)

const gridStyle = computed(() =>
  layoutType.value === "twoColumns" ? {
    "--grid-columns": 2,
    "--grid-gap": "1rem",
  } : {}
)

const showCover = (item) => themeConfig.value?.cover?.showCover?.enable && item

const getCover = (item) => {
  const { cover } = themeConfig.value ?? {}
  if (!cover?.showCover?.enable) return false
  if (item?.cover) return withBase(item.cover)
  const fallback = Array.isArray(cover.showCover.defaultCover)
    ? cover.showCover.defaultCover[Math.floor(Math.random() * cover.showCover.defaultCover.length)]
    : false
  return fallback ? withBase(fallback) : false
}

const toPost = (path) => {
  if (typeof window !== "undefined") {
    store.lastScrollY = window.scrollY
  }
  router.go(withBase(path))
}
</script>

<style lang="scss" scoped>
.content-preview {
  width: 100%;
  display: flex;
  flex-direction: row;

  .preview-content {
    width: 100%;
    transition: width 0.3s;

    &.with-aside {
      width: calc(100% - 300px);
    }
  }

  @media (max-width: 1200px) {
    .preview-content {
      width: 100% !important;
    }
    .main-aside {
      display: none;
    }
  }
}

.type-bar {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.6rem;
  font-weight: bold;
  animation: fade-up 0.6s 0.3s backwards;

  .all-type {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-wrap: nowrap;
    overflow: hidden;
    mask: linear-gradient(
      90deg,
      #fff 0,
      #fff 90%,
      hsla(0, 0%, 100%, 0.6) 95%,
      hsla(0, 0%, 100%, 0) 100%
    );
    &.expanded {
      flex-wrap: wrap;
      overflow: visible;
      mask: none;
    }
  }

  .all-type .type-item {
    display: flex;
    align-items: center;
    padding: 0.1rem 0.5rem;
    margin-right: 6px;
    font-weight: bold;
    border-radius: 8px;
    white-space: nowrap;
    height: 30px;
    cursor: pointer;

    .num {
      margin-left: 4px;
      font-weight: normal;
      padding: 2px 6px;
      font-size: 0.75rem;
      color: var(--main-font-color);
      background-color: var(--main-card-border);
      border-radius: 8px;
    }

    &.choose {
      color: var(--main-card-background);
      background-color: var(--main-color);
      .num {
        color: var(--main-color);
        background-color: rgba(255, 255, 255, 0.2);
      }
    }

    &:hover {
      color: var(--main-card-background);
      background-color: var(--main-color);
      .num {
        color: var(--main-color);
        background-color: rgba(255, 255, 255, 0.2);
      }
    }
  }

  .type-toggle {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-shrink: 0;
    margin-left: 8px;
    font-weight: bold;
    white-space: nowrap;
    cursor: pointer;
    color: var(--main-font-second-color);
    transition: color 0.3s;
    .iconfont {
      margin-left: 4px;
      font-size: 0.9375rem;
      transition: color 0.3s;
    }
    &:hover {
      color: var(--main-color);
      .iconfont {
        color: var(--main-color);
      }
    }
  }
}

.preview-list {
  .preview-item {
    padding: 0 !important;
    display: flex;
    margin-bottom: 1rem;
    animation: fade-up 0.6s 0.4s backwards;
    cursor: pointer;
    overflow: hidden;
    height: 200px;

    .item-cover {
      flex: 0 0 35%;
      overflow: hidden;
      transform: translateZ(0);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transform-origin: center center;
        will-change: transform, filter;
        transition: transform 0.5s ease-out, filter 0.5s ease-out;
        backface-visibility: hidden;
      }
    }

    .item-content {
      flex: 1;
      padding: 1.6rem 2rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .item-category {
        display: flex;
        flex-wrap: wrap;
        width: 100%;
        color: var(--main-font-second-color);
        font-size: 14px;
        .cat-name {
          display: flex;
          flex-direction: row;
          align-items: center;
          .iconfont {
            opacity: 0.8;
            margin-right: 6px;
            color: var(--main-font-second-color);
          }
        }
        .top {
          margin-left: 12px;
          color: var(--main-color);
          .iconfont {
            opacity: 0.8;
            color: var(--main-color);
          }
        }
      }

      .item-title {
        font-size: 20px;
        line-height: 30px;
        font-weight: bold;
        margin: 0.6rem 0;
        transition: color 0.3s;
        display: -webkit-box;
        overflow: hidden;
        word-break: break-all;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
      }

      .item-desc {
        margin-top: -0.4rem;
        margin-bottom: 0.8rem;
        opacity: 0.8;
        line-height: 30px;
        display: -webkit-box;
        overflow: hidden;
        word-break: break-all;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
      }

      .item-meta {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        color: var(--main-font-second-color);

        .item-tags {
          display: flex;
          flex-wrap: wrap;
          opacity: 0.8;
          margin-right: 20px;
          overflow: hidden;
          mask: linear-gradient(
            90deg,
            #fff 0,
            #fff 90%,
            hsla(0, 0%, 100%, 0.6) 95%,
            hsla(0, 0%, 100%, 0) 100%
          );
          .tag-name {
            display: flex;
            flex-direction: row;
            align-items: center;
            margin-right: 12px;
            white-space: nowrap;
            transition: color 0.3s;
            .iconfont {
              font-weight: normal;
              opacity: 0.6;
              margin-right: 4px;
              transition: color 0.3s;
            }
            &:hover {
              color: var(--main-color);
              .iconfont {
                color: var(--main-color);
              }
            }
          }
          @media (max-width: 768px) {
            flex-wrap: nowrap;
          }
        }

        .item-time {
          opacity: 0.6;
          font-size: 13px;
          white-space: nowrap;
        }
      }
    }

    &:last-child {
      margin-bottom: 0;
    }

    &:hover {
      .item-cover img {
        filter: brightness(0.8);
        transform: scale(1.05);
      }
      .item-content .item-title {
        color: var(--main-color);
      }
    }

    &:active {
      transform: scale(0.98);
    }

    @media (max-width: 768px) {
      flex-direction: column;
      height: auto;
      .item-cover {
        flex: none;
        width: 100%;
        height: 200px;
      }
    }

    &.cover-left {
      flex-direction: row;
    }
    &.cover-right {
      flex-direction: row-reverse;
    }
    &.cover-both {
      &:nth-child(odd) { flex-direction: row; }
      &:nth-child(even) { flex-direction: row-reverse; }
    }

    @media (max-width: 768px) {
      &.cover-left,
      &.cover-right,
      &.cover-both {
        flex-direction: column !important;
      }
    }
  }

  &.layout-grid {
    display: grid;
    grid-template-columns: repeat(var(--grid-columns, 2), 1fr);
    gap: var(--grid-gap, 1rem);

    .preview-item {
      margin: 0;
      flex-direction: column;
      height: auto;

      .item-cover {
        flex: none;
        width: 100%;
        height: 225px;
      }
      .item-content {
        flex: 1;
      }
    }

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }
}

.pagination {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
  width: 100%;
  height: 40px;
  animation: fade-up 0.6s 0.4s backwards;

  .page-item {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    overflow: hidden;
    background-color: var(--main-card-background);
    border: 1px solid var(--main-card-border);
    box-shadow: 0 8px 16px -4px var(--main-border-shadow);
    transition: border-color 0.3s, box-shadow 0.3s;
    cursor: pointer;

    &.prev,
    &.next {
      position: absolute;
      width: 80px;
    }

    &.prev {
      left: 0;
      .iconfont {
        transform: rotate(180deg);
        transition: color 0.3s, transform 0.3s;
      }
      .page-text {
        margin-left: 4px;
        margin-right: -36px;
      }
    }

    &.next {
      left: auto;
      right: 0;
      .page-text {
        margin-right: 4px;
        margin-left: -36px;
      }
    }

    .page-text {
      opacity: 0;
      transition: opacity 0.3s, margin 0.3s;
    }

    &.disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    &:hover {
      border-color: var(--main-color);
      box-shadow: 0 8px 16px -4px var(--main-color-bg);
      .iconfont { color: var(--main-color); }
      .page-text {
        opacity: 1;
        margin-right: 0;
      }
    }

    &.next:hover .page-text {
      margin-right: 4px;
      margin-left: 0;
    }

    &.choose {
      color: var(--main-card-background);
      border-color: var(--main-color);
      background-color: var(--main-color);
      box-shadow: 0 8px 16px -4px var(--main-color-bg);
    }
  }

  .page-number {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;

    .page-item {
      margin: 0 6px;
    }
  }

  @media (max-width: 768px) {
    .page-number {
      display: none;
    }
  }
}
</style>
