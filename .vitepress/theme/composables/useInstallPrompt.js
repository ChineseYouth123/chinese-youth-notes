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
