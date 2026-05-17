<template>
  <div class="post">
    <div class="post-meta">
      <h1 class="title">{{ title }}</h1>
    </div>
    <div class="post-content">
      <article class="post-article s-card">
        <div class="text-body markdown-main-style">
          <pre>{{ content }}</pre>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  content: String,
})
</script>

<style lang="scss" scoped>
.post {
  width: 100%;
  display: flex;
  flex-direction: column;
  animation: fade-up 0.6s 0.1s backwards;
  .post-meta {
    padding: 2rem 0 3rem 18px;
    width: 100%;
    .title {
      font-size: 2.2rem;
      line-height: 1.2;
      color: var(--main-font-color);
      margin: 1.4rem 0;
    }
  }
  .post-content {
    width: 100%;
    display: flex;
    flex-direction: row;
    animation: fade-up 0.6s 0.3s backwards;
    .post-article {
      flex: 1;
      min-width: 0;
      max-width: var(--content-width, 900px);
      margin: 0 auto;
      padding: 1rem 2.2rem 2.2rem 2.2rem;
      user-select: text;
      cursor: auto;
      &:hover {
        border-color: var(--main-card-border);
      }
      .text-body {
        :deep(pre) {
          white-space: pre-wrap;
          word-wrap: break-word;
          font-size: 1rem;
          line-height: 1.8;
          background: transparent;
          border: none;
          padding: 0;
          margin: 0;
          font-family: inherit;
        }
      }
    }
  }
}
</style>
