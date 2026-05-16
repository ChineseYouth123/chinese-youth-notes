<template>
  <aside class="main-aside">
    <!-- 正文页面：仅显示目录 -->
    <template v-if="onlyToc">
      <Toc class="weidgets" />
    </template>
    <!-- 普通页面：显示侧边栏组件 -->
    <template v-else>
      <Hello v-if="theme.aside.hello.enable" class="weidgets" />
      <div class="sticky">
        <Countdown class="weidgets" />
        <Tags v-if="theme.aside.tags.enable" class="weidgets" />
        <SiteData v-if="theme.aside.siteData.enable" class="weidgets" />
      </div>
    </template>
  </aside>
</template>

<script setup>
const { theme } = useData();
defineProps({
  onlyToc: {
    type: Boolean,
    default: false,
  },
});
</script>

<style lang="scss" scoped>
.main-aside {
  padding-left: 1rem;
  display: flex;
  flex-direction: column;
  animation: fade-up 0.6s 0.3s backwards;
  &:has(> .weidgets:only-child) {
    :deep(.toc) {
      position: sticky;
      top: calc(60px + 1rem);
    }
  }
  .weidgets {
    padding: 18px;
    margin-bottom: 1rem;
    :deep(.title) {
      margin-bottom: 12px;
      font-weight: bold;
      display: flex;
      align-items: center;
      opacity: 0.75;
      .iconfont {
        opacity: 0.6;
        margin-right: 6px;
      }
      .title-name {
        opacity: 0.8;
      }
    }
  }
  .sticky {
    position: sticky;
    top: calc(60px + 1rem);
    .weidgets {
      animation: fade-up 0.6s 0.4s backwards;
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style>
