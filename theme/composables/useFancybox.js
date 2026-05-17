import { Fancybox } from "@fancyapps/ui/dist/index.esm.js";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import { mainStore } from "@/store";
import { storeToRefs } from "pinia";

const fancyboxOptions = {
  hideScrollbar: true,
  Carousel: {
    transition: "slide",
  },
  Hash: false,
  Toolbar: {
    display: {
      left: ["infobar"],
      middle: [
        "zoomIn",
        "zoomOut",
        "toggle1to1",
        "rotateCCW",
        "rotateCW",
        "flipX",
        "flipY",
      ],
      right: ["slideshow", "thumbs", "close"],
    },
  },
  l10n: {
    PANUP: "上移",
    PANDOWN: "下移",
    PANLEFT: "左移",
    PANRIGHT: "右移",
    ZOOMIN: "放大",
    ZOOMOUT: "缩小",
    TOGGLEZOOM: "切换缩放级别",
    TOGGLE1TO1: "切换缩放级别",
    ITERATEZOOM: "切换缩放级别",
    ROTATECCW: "逆时针旋转",
    ROTATECW: "顺时针旋转",
    FLIPX: "水平翻转",
    FLIPY: "垂直翻转",
    FITX: "水平适应",
    FITY: "垂直适应",
    RESET: "重置",
    TOGGLEFS: "切换全屏",
    CLOSE: "关闭",
    NEXT: "上一个",
    PREV: "下一个",
    MODAL: "使用 ESC 键关闭",
    ERROR: "发生了错误，请稍后再试",
    IMAGE_ERROR: "找不到图像",
    ELEMENT_NOT_FOUND: "找不到 HTML 元素",
    AJAX_NOT_FOUND: "载入 AJAX 时出错: 未找到",
    AJAX_FORBIDDEN: "载入 AJAX 时出错: 被阻止",
    IFRAME_ERROR: "加载页面出错",
    TOGGLE_ZOOM: "切换缩放级别",
    TOGGLE_THUMBS: "切换缩略图",
    TOGGLE_SLIDESHOW: "切换幻灯片",
    TOGGLE_FULLSCREEN: "切换全屏",
    DOWNLOAD: "下载",
  },
};

export function useFancybox() {
  const store = mainStore();
  const { fancyboxEnable } = storeToRefs(store);
  const route = useRoute();

  const bind = () => {
    if (!fancyboxEnable.value) return;
    Fancybox.bind("[data-fancybox]", fancyboxOptions);
  };

  const unbind = () => {
    Fancybox.unbind("[data-fancybox]");
  };

  const rebind = () => {
    unbind();
    bind();
  };

  onMounted(bind);

  watch(fancyboxEnable, (val) => {
    if (val) {
      bind();
    } else {
      unbind();
    }
  });

  watch(
    () => route.path,
    () => nextTick(bind),
  );

  onBeforeUnmount(unbind);

  return { bind, unbind, rebind };
}
