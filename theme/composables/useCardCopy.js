import { copyText } from "@/utils/helper";

export function useCardCopy() {
  const LONG_PRESS_MS = 500;
  let timer = null;
  let target = null;

  const onTouchStart = (e) => {
    target = e.currentTarget;
    timer = setTimeout(() => {
      const text = target.textContent.trim();
      if (text) {
        copyText(text);
        target.classList.add("card-copied");
        setTimeout(() => target.classList.remove("card-copied"), 600);
      }
    }, LONG_PRESS_MS);
  };

  const onTouchEnd = () => {
    clearTimeout(timer);
  };

  const onTouchMove = () => {
    clearTimeout(timer);
  };

  const bind = () => {
    document.querySelectorAll(".card p").forEach((el) => {
      el.addEventListener("touchstart", onTouchStart, { passive: true });
      el.addEventListener("touchend", onTouchEnd, { passive: true });
      el.addEventListener("touchmove", onTouchMove, { passive: true });
    });
  };

  const unbind = () => {
    document.querySelectorAll(".card p").forEach((el) => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchmove", onTouchMove);
    });
  };

  const rebind = () => {
    unbind();
    bind();
  };

  onMounted(bind);

  const route = useRoute();
  watch(
    () => route.path,
    () => nextTick(bind),
  );

  onBeforeUnmount(unbind);

  return { bind, unbind, rebind };
}
