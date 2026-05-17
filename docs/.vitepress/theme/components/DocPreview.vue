<template>
  <div class="doc-preview">
    <div class="preview-content">
      <article class="post-article s-card">
        <slot />
      </article>
      <Aside v-if="showAside" :only-toc="onlyToc" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  showAside: {
    type: Boolean,
    default: false,
  },
  onlyToc: {
    type: Boolean,
    default: true,
  },
})
</script>

<style lang="scss" scoped>
.doc-preview {
  width: 100%;
  .preview-content {
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
    }
    .main-aside {
      width: 350px;
      flex-shrink: 0;
      padding-left: 1rem;
    }
    @media (max-width: 1200px) {
      .post-article {
        width: 100%;
      }
      .main-aside {
        display: none;
      }
    }
  }
}
</style>
