<template>
  <Teleport to="body">
    <div
      v-if="show"
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
import { mainStore } from "@/store";

defineProps({
  show: {
    type: Boolean,
    default: true,
  },
});

const store = mainStore();
</script>

<style lang="scss" scoped>
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
