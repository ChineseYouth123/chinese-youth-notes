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

function isLocalhost() {
  return (
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1" ||
    location.hostname === "[::1]"
  );
}

let deferredPrompt = null;
const listeners = new Set();

// 模块级响应式状态，供其他组件（如 About.vue）使用
export const installPromptReady = ref(false);
export function getDeferredPrompt() {
  return deferredPrompt;
}

// 模块级提前捕获，避免在组件 mount 前错过事件
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    console.log("[useInstallPrompt] beforeinstallprompt captured");
    e.preventDefault();
    deferredPrompt = e;
    installPromptReady.value = true;
    listeners.forEach((fn) => fn());
  });
}

export function useInstallPrompt() {
  const showPrompt = ref(false);

  function onPromptReady() {
    if (isStandalone() || isInCooldown()) return;
    console.log("[useInstallPrompt] showing prompt bar");
    showPrompt.value = true;
  }

  async function install() {
    if (!deferredPrompt) return;
    console.log("[useInstallPrompt] user clicked install");
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === "accepted") {
      console.log("[useInstallPrompt] user accepted install");
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
      showPrompt.value = false;
    }
    deferredPrompt = null;
  }

  function dismiss() {
    console.log("[useInstallPrompt] user dismissed prompt");
    showPrompt.value = false;
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  }

  function setupFallback() {
    const delay = isLocalhost() ? 3000 : 10000;
    setTimeout(() => {
      if (showPrompt.value) return;
      if (isStandalone() || isInCooldown()) return;
      console.log("[useInstallPrompt] fallback: showing prompt bar");
      showPrompt.value = true;
    }, delay);
  }

  onMounted(() => {
    console.log("[useInstallPrompt] mounted", {
      deferredPrompt: !!deferredPrompt,
      standalone: isStandalone(),
      cooldown: isInCooldown(),
      localhost: isLocalhost(),
    });

    if (isStandalone() || isInCooldown()) return;

    if (deferredPrompt) {
      onPromptReady();
      return;
    }

    // 注册回调，等待事件触发
    listeners.add(onPromptReady);

    // 兜底：事件可能永远不会触发（如 dev 模式）
    setupFallback();
  });

  onBeforeUnmount(() => {
    listeners.delete(onPromptReady);
  });

  // 调试入口
  if (typeof window !== "undefined") {
    window.__showInstallPrompt = () => {
      console.log("[useInstallPrompt] debug: forced show");
      showPrompt.value = true;
    };
  }

  return { showPrompt, install, dismiss };
}
