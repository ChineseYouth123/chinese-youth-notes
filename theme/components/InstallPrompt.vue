<template>
  <Teleport to="body">
    <Transition name="fadeDown" mode="out-in">
      <div v-if="showPrompt" class="install-prompt">
        <span class="text">安装本应用到桌面，获得更好的浏览体验</span>
        <span class="action" @click.stop="install">安装</span>
        <span class="close" @click.stop="dismiss">
          <i class="iconfont icon-close" />
        </span>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { useInstallPrompt } from "@/composables/useInstallPrompt";

const { showPrompt, install, dismiss } = useInstallPrompt();
</script>

<style lang="scss" scoped>
.install-prompt {
  position: fixed;
  top: 0;
  left: 0;
  display: none;
  align-items: center;
  justify-content: center;
  height: 56px;
  width: 100vw;
  background-color: var(--main-color);
  z-index: 3000;
  gap: 12px;
  padding: 0 16px;

  .text {
    color: var(--main-card-background);
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
  }

  .action {
    flex-shrink: 0;
    padding: 4px 14px;
    border-radius: 4px;
    background-color: var(--main-card-background);
    color: var(--main-color);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s;
    &:active {
      opacity: 0.7;
    }
  }

  .close {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    cursor: pointer;
    transition: background-color 0.2s;
    .iconfont {
      font-size: 12px;
      color: var(--main-card-background);
      opacity: 0.6;
    }
    &:active {
      background-color: var(--main-color-white);
    }
  }

  @media (max-width: 768px) {
    display: flex;
  }
}
</style>
