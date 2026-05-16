<!-- 普通页面 -->
<template>
  <div :class="[frontmatter.layout || 'page', { 'has-aside': frontmatter.aside }]">
    <div class="page-content">
      <!-- 页面内容 -->
      <Content id="page-content" :class="['markdown-main-style', { 's-card': frontmatter.card }]" />
      <!-- 评论 -->
      <Comments v-if="frontmatter.comment" />
    </div>
    <Aside v-if="frontmatter.aside" />
  </div>
  <Teleport to="body">
    <div
      v-if="frontmatter.aside"
      class="toc-toggle"
      :class="{ active: store.tocShow }"
      title="显示/隐藏目录"
      @click="store.tocShow = !store.tocShow"
    >
      <div class="toc-btn">
        <i class="iconfont icon-toc" />
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { mainStore } from '@/store'
const { frontmatter } = useData();
const store = mainStore();
</script>

<style lang="scss" scoped>
@use "../style/post.scss";

.page {
  width: 100%;
  display: flex;
  flex-direction: row;
  animation: fade-up 0.6s 0.1s backwards;
  .page-content {
    flex: 1;
    min-width: 0;
    transition: width 0.3s;
    :deep(#main-comment) {
      width: 100%;
      .comment-content {
        .atk-list {
          .atk-list-header {
            margin-bottom: 8px;
          }
          .atk-list-comments-wrap {
            > .atk-comment-wrap {
              padding: 0.8rem;
              margin-bottom: 1rem;
              border-bottom: none;
              border-radius: 16px;
              background-color: var(--main-card-background);
              border: 1px solid var(--main-card-border);
              box-shadow: 0 8px 16px -4px var(--main-border-shadow);
            }
          }
        }
      }
    }
    .s-card {
      padding: 1rem 2rem;
    }
  }
  &.has-aside {
    animation: fade-up 0.6s 0.3s backwards;
    .page-content {
      flex: 1;
      min-width: 0;
    }
    .main-aside {
      width: 350px;
      flex-shrink: 0;
      padding-left: 1rem;
    }
  }
  @media (max-width: 1200px) {
    .page-content {
      width: 100% !important;
    }
    .main-aside {
      display: none;
    }
  }
}

.toc-toggle {
  position: fixed;
  right: 24px;
  bottom: 80px;
  z-index: 1002;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;

  .toc-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background-color: var(--main-card-background);
    border: 1px solid var(--main-card-border);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transition: all 0.3s;

    .icon-toc {
      color: var(--main-font-color);
      font-size: 20px;
      transition: color 0.3s;
    }
  }

  &.active .toc-btn {
    background-color: var(--main-color);
    border-color: var(--main-color);
    .icon-toc { color: #fff; }
  }

  &:hover { opacity: 0.85; }
  &:active { transform: scale(0.9); }
}
</style>
