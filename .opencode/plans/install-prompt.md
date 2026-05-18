# PWA 安装提示 — 实现方案

## 新建文件

### 1. `theme/composables/useInstallPrompt.js`

```js
const COOLDOWN_DAYS = 7;
const STORAGE_KEY = "install-prompt-dismissed";

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone
  );
}

function isInCooldown() {
  const last = localStorage.getItem(STORAGE_KEY);
  if (!last) return false;
  return Date.now() - Number(last) < COOLDOWN_DAYS * 86400000;
}

let deferredPrompt = null;

export function useInstallPrompt() {
  const showPrompt = ref(false);

  async function install() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === "accepted") {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
      showPrompt.value = false;
    }
    deferredPrompt = null;
  }

  function dismiss() {
    showPrompt.value = false;
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  }

  function onBeforeInstallPrompt(e) {
    e.preventDefault();
    deferredPrompt = e;
    showPrompt.value = true;
  }

  onMounted(() => {
    if (isStandalone() || isInCooldown()) return;
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  });

  return { showPrompt, install, dismiss };
}
```

### 2. `theme/components/InstallPrompt.vue`

```vue
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
```

## 修改文件

### 3. `theme/App.vue`

**template** — 在 `<Message />` 之后添加：

```diff
   <!-- 全局消息 -->
   <Message />
+  <!-- PWA 安装提示 -->
+  <InstallPrompt />
```

**script** — 添加 import：

```diff
 import { useFancybox } from "@/composables/useFancybox";
 import { useCardCopy } from "@/composables/useCardCopy";
+import { useInstallPrompt } from "@/composables/useInstallPrompt";
```

## 执行步骤

1. 创建 `theme/composables/useInstallPrompt.js`
2. 创建 `theme/components/InstallPrompt.vue`
3. 修改 `theme/App.vue`（template 加组件，script 加 import）
4. `npm run build` 验证构建
5. `git add . && git commit -m "feat: PWA 安装顶部提示条" && git push`

## 关键设计决策

| 项目 | 决定 |
|------|------|
| 交互方式 | 顶部通知条（复用 fadeDown 动画） |
| iOS 处理 | 跳过（iOS 不支持 beforeinstallprompt） |
| 冷却期 | 7 天 localStorage |
| 桌面端 | CSS `display:none` 隐藏 |
| 已安装检测 | `display-mode: standalone` / `navigator.standalone` |
| 拒绝/关闭 | 写入 localStorage + 隐藏 |
