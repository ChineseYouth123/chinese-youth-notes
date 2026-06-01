<template>
  <div class="markdown-preview">
    <div v-if="title" class="preview-header">
      <div class="meta-row">
        <div v-if="categories?.length" class="categories">
          <a
            v-for="cat in categories"
            :key="cat"
            :href="withBase(`/pages/categories/${cat}`)"
            class="cat-item"
          >
            <i class="iconfont icon-folder" />
            <span class="name">{{ cat }}</span>
          </a>
        </div>
        <div v-if="tags?.length" class="tags">
          <a
            v-for="tag in tags"
            :key="tag"
            :href="withBase(`/pages/tags/${tag}`)"
            class="tag-item"
          >
            <i class="iconfont icon-hashtag" />
            <span class="name">{{ tag }}</span>
          </a>
        </div>
      </div>
      <h1 class="preview-title">{{ title }}</h1>
      <div v-if="showMeta && date" class="other-meta">
        <span class="meta date">
          <i class="iconfont icon-date" />
          {{ formatTimestamp(date) }}
        </span>
      </div>
      <p v-if="description" class="preview-desc">{{ description }}</p>
    </div>
    <div class="preview-body s-card">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { withBase } from "vitepress"
import { formatTimestamp } from "@/utils/helper"

defineProps({
  title: { type: String, default: "" },
  date: { type: [Number, String, Date], default: null },
  tags: { type: Array, default: () => [] },
  categories: { type: Array, default: () => [] },
  description: { type: String, default: "" },
  showMeta: { type: Boolean, default: true },

})
</script>

<style lang="scss" scoped>
.markdown-preview {
  width: 100%;
  animation: fade-up 0.6s 0.1s backwards;

  .preview-header {
    padding: 2rem 0 3rem 18px;
    width: 100%;

    .meta-row {
      display: flex;
      flex-direction: row;
      align-items: center;

      .categories {
        margin-right: 12px;

        .cat-item {
          display: flex;
          flex-direction: row;
          align-items: center;
          padding: 6px 12px;
          font-size: 14px;
          font-weight: bold;
          border-radius: 8px;
          background-color: var(--main-mask-Inverse-background);
          opacity: 0.8;

          .iconfont {
            margin-right: 6px;
          }

          &:hover {
            color: var(--main-color);
            background-color: var(--main-color-bg);

            .iconfont {
              color: var(--main-color);
            }
          }
        }
      }

      .tags {
        display: flex;
        flex-direction: row;
        align-items: center;

        .tag-item {
          display: flex;
          flex-direction: row;
          align-items: center;
          padding: 6px 12px;
          font-size: 14px;
          font-weight: bold;
          border-radius: 8px;
          opacity: 0.8;

          .iconfont {
            margin-right: 4px;
            opacity: 0.6;
            font-weight: normal;
          }

          &:hover {
            color: var(--main-color);
            background-color: var(--main-color-bg);

            .iconfont {
              color: var(--main-color);
            }
          }
        }
      }
    }

    .preview-title {
      font-size: 2.2rem;
      line-height: 1.2;
      color: var(--main-font-color);
      margin: 1.4rem 0;
    }

    .other-meta {
      display: flex;
      flex-direction: row;
      align-items: center;

      .meta {
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 6px 12px;
        font-size: 14px;
        border-radius: 8px;
        opacity: 0.8;

        .iconfont {
          margin-right: 6px;
          transition: color 0.3s;
        }

        &.date {
          padding-left: 0;
        }
      }
    }

    .preview-desc {
      color: var(--main-font-second-color);
      line-height: 1.8;
      margin: 0.5rem 0 0;
      font-size: 0.95rem;
    }
  }

  .preview-body {
    padding: 1rem 2.2rem 2.2rem;
    user-select: text;
    cursor: auto;
    border-color: var(--main-card-border);

    &:hover {
      border-color: var(--main-card-border);
    }
  }

  @media (max-width: 768px) {
    .preview-header {
      padding: 4rem 1.5rem;

      .meta-row {
        justify-content: center;

        .categories {
          margin-right: 0;
        }

        .tags {
          display: none;
        }
      }

      .preview-title {
        font-size: 1.6rem;
        text-align: center;
        line-height: 40px;
      }

      .other-meta {
        justify-content: center;
      }
    }

    .preview-body {
      padding: 20px 30px;
      border: none;
    }
  }
}
</style>
