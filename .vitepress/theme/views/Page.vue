<!-- 普通页面 -->
<template>
  <div :class="[frontmatter.layout || 'page', { 'has-aside': frontmatter.aside, 'post-style': frontmatter.postStyle }]">
    <template v-if="frontmatter.postStyle">
      <div class="post-style-wrapper">
        <MarkdownPreview
          :title="frontmatter.title"
          :date="frontmatter.date"
          :tags="frontmatter.tags"
          :categories="frontmatter.categories"
          :description="frontmatter.description"
        >
          <Content id="page-content" class="markdown-main-style" />
          <References />
          <Copyright v-if="frontmatter.copyright !== false" />
          <div v-if="frontmatter.tags?.length" class="post-other-meta">
            <div class="all-tags">
              <a
                v-for="tag in frontmatter.tags"
                :key="tag"
                :href="withBase(`/pages/tags/${tag}`)"
                class="tag-item"
              >
                <i class="iconfont icon-hashtag" />
                <span class="name">{{ tag }}</span>
              </a>
            </div>
            <a :href="withBase('/pages/fankui')" class="report">
              <i class="iconfont icon-report" />
              反馈与投诉
            </a>
          </div>
          <RewardBtn />
          <NextPost />
          <RelatedPost />
          <Comments />
        </MarkdownPreview>
        <Aside v-if="frontmatter.aside" :only-toc="frontmatter.onlyToc ?? true" />
      </div>
    </template>
    <template v-else>
      <div class="page-content">
        <Content id="page-content" :class="['markdown-main-style', { 's-card': frontmatter.card }]" />
        <Comments v-if="frontmatter.comment" />
      </div>
      <Aside v-if="frontmatter.aside" :only-toc="frontmatter.onlyToc" />
    </template>
  </div>
  <TocToggle :show="!!frontmatter.postStyle" />
</template>

<script setup>
import { withBase } from "vitepress";
const { frontmatter } = useData();
</script>

<style lang="scss" scoped>
@use "../style/post.scss";

.page {
  width: 100%;
  display: flex;
  flex-direction: row;
  animation: fade-up 0.6s 0.1s backwards;
  &.post-style {
    display: block;

    .post-style-wrapper {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: center;
      animation: fade-up 0.6s 0.3s backwards;

      .markdown-preview {
        flex: 1;
        min-width: 0;
        max-width: var(--content-width, 900px);
      }

      .main-aside {
        width: 350px;
        flex-shrink: 0;
        padding-left: 1rem;
      }

      @media (max-width: 1200px) {
        .markdown-preview {
          width: 100%;
        }
        .main-aside {
          display: none;
        }
      }
    }

    .post-other-meta {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      margin: 2rem 0;
      opacity: 0.8;

      .all-tags {
        display: flex;
        flex-direction: row;
        align-items: center;
        flex-wrap: wrap;

        .tag-item {
          display: flex;
          flex-direction: row;
          align-items: center;
          padding: 6px 12px;
          font-size: 14px;
          font-weight: bold;
          border-radius: 8px;
          background-color: var(--main-card-border);
          margin-right: 12px;
          margin-top: 4px;

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

      .report {
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 6px 12px;
        font-size: 14px;
        font-weight: bold;
        border-radius: 8px;
        background-color: var(--main-card-border);
        white-space: nowrap;

        .iconfont {
          margin-right: 6px;
        }

        &:hover {
          color: #efefef;
          background-color: var(--main-error-color);

          .iconfont {
            color: #efefef;
          }
        }
      }

      @media (max-width: 768px) {
        flex-direction: column;

        .all-tags {
          flex-wrap: wrap;

          .tag-item {
            margin-top: 12px;
          }
        }

        .report {
          margin-top: 20px;
        }
      }
    }
  }
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
</style>
