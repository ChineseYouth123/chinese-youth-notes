<template>
  <!-- 正文页面（仅目录），随 tocShow 销毁/重建 -->
  <template v-if="onlyToc">
    <aside v-if="store.tocShow && !isMobile" class="main-aside">
      <Toc class="weidgets" />
    </aside>
    <!-- 移动端悬浮目录 -->
    <Teleport to="body">
      <div
        v-if="store.tocShow && isMobile"
        class="toc-overlay"
        @click.self="store.tocShow = false"
      >
        <div class="toc-panel">
          <button class="toc-close" @click="store.tocShow = false">
            <i class="iconfont icon-close" />
          </button>
          <Toc class="weidgets" />
        </div>
      </div>
    </Teleport>
  </template>
  <!-- 普通页面：显示侧边栏组件 + 目录 -->
  <template v-else>
    <aside class="main-aside full-aside">
      <Hello v-if="theme.aside.hello.enable" class="weidgets" />
      <div class="sticky">
        <Toc v-if="store.tocShow" class="weidgets" />
        <Countdown class="weidgets" />
        <Tags v-if="theme.aside.tags.enable" class="weidgets" />
        <SiteData v-if="theme.aside.siteData.enable" class="weidgets" />
      </div>
    </aside>
  </template>
</template>

<script setup>
import { mainStore } from '@/store'
const { theme } = useData();
const store = mainStore();
defineProps({
  onlyToc: {
    type: Boolean,
    default: false,
  },
});

const isMobile = ref(false);
let mq = null;

onMounted(() => {
  mq = window.matchMedia('(max-width: 1200px)');
  isMobile.value = mq.matches;
  mq.addEventListener('change', (e) => { isMobile.value = e.matches; });
});

onBeforeUnmount(() => {
  if (mq) mq.removeEventListener('change', () => {});
  document.body.style.overflow = '';
});

watch(() => store.tocShow && isMobile.value, (val) => {
  document.body.style.overflow = val ? 'hidden' : '';
});
</script>

<style lang="scss" scoped>
.main-aside {
  padding-left: 1rem;
  width: 350px;
  display: flex;
  flex-direction: column;
  animation: fade-up 0.6s 0.3s backwards;
  @media (max-width: 1200px) {
    display: none;
  }
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

  &.full-aside {
    @media (max-width: 1200px) {
      display: none;
    }
  }
}

.toc-overlay {
  display: none;
  @media (max-width: 1200px) {
    display: flex;
    position: fixed;
    inset: 0;
    z-index: 1001;
    background: rgba(0, 0, 0, 0.4);
    justify-content: flex-end;
    animation: fade-in 0.2s ease;
  }
  .toc-panel {
    position: relative;
    width: 320px;
    max-width: 85vw;
    height: 100%;
    background: var(--main-card-background);
    overflow-y: auto;
    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
    animation: slide-in-right 0.3s ease;
    .toc-close {
      position: absolute;
      top: 12px;
      right: 12px;
      z-index: 1;
      width: 32px;
      height: 32px;
      border: none;
      background: var(--main-card-border);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 0.6;
      transition: opacity 0.2s;
      &:hover {
        opacity: 1;
      }
      .iconfont {
        font-size: 16px;
        color: var(--main-font-color);
      }
    }
    .weidgets {
      padding: 0;
      margin: 0;
    }
  }
}

@keyframes slide-in-right {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
</style>
