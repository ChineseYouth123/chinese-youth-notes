<template>
  <!-- 背景图片 -->
  <Background />
  <!-- 加载提示 -->
  <Loading />
  <!-- 中控台 -->
  <Control />
  <!-- 导航栏 -->
  <Nav />
  <!-- 主内容 -->
  <main :class="['mian-layout', { loading: loadingStatus, 'is-post': isPostPage }]">
    <!-- 404 -->
    <NotFound v-if="page.isNotFound" />
    <!-- 首页 -->
    <Home v-if="frontmatter.layout === 'home'" showHeader />
    <!-- 页面 -->
    <template v-else>
      <!-- 文章页面 -->
      <Post v-if="isPostPage" />
      <!-- 普通页面 -->
      <Page v-else-if="!page.isNotFound" />
    </template>
  </main>
  <!-- 页脚 -->
  <!-- <FooterLink v-show="!loadingStatus" :showBar="isPostPage && !page.isNotFound" /> -->
  <Footer v-show="!loadingStatus" />
  <!-- 悬浮菜单 -->
  <Teleport to="body">
    <!-- 左侧菜单 (仅保留播放器) -->
    <div :class="['left-menu', { hidden: footerIsShow }]">
      <!-- 全局播放器 -->
      <Player />
    </div>
    <!-- 返回顶部 -->
    <div
      :class="['to-top-fab', { hidden: scrollData.height === 0 }]"
      title="返回顶部"
      @click="smoothScrolling()"
    >
      <div class="to-top-btn">
        <i class="iconfont icon-up"></i>
      </div>
    </div>
  </Teleport>
  <!-- 全局设置 (按钮已移至右上角导航栏) -->
  <div style="display: none">
    <Settings />
  </div>
  <!-- 右键菜单 -->
  <RightMenu ref="rightMenuRef" />
  <!-- 全局消息 -->
  <Message />
</template>

<script setup>
import { storeToRefs } from "pinia";
import { mainStore } from "@/store";
import { calculateScroll, specialDayGray, smoothScrolling } from "@/utils/helper";

const route = useRoute();
const store = mainStore();
const { frontmatter, page, theme } = useData();
const { loadingStatus, footerIsShow, themeValue, themeType, backgroundType, fontFamily, fontSize, scrollData } =
  storeToRefs(store);

// 右键菜单
const rightMenuRef = ref(null);

// 判断是否为文章页面
const isPostPage = computed(() => {
  const routePath = decodeURIComponent(route.path);
  return routePath.includes("/posts/");
});

// 开启右键菜单
const openRightMenu = (e) => {
  console.log("[contextmenu] right-click detected, rightMenuRef exists:", !!rightMenuRef.value);
  try {
    if (rightMenuRef.value) {
      const shouldShowDefault = rightMenuRef.value.openRightMenu(e);
      // 仅在右键组件明确要求显示系统菜单时放行
      if (shouldShowDefault !== true) {
        e.preventDefault();
      }
    }
    // rightMenuRef 为空：什么也不做，保留浏览器默认菜单
  } catch (err) {
    console.error("[RightMenu] 右键菜单出错:", err);
    e.preventDefault();
  }
};

// 复制时触发
const copyTip = () => {
  const copiedText = window.getSelection().toString();
  // 检查文本内容是否不为空
  if (copiedText.trim().length > 0 && typeof $message !== "undefined") {
    $message.success("复制成功，在转载时请标注本文地址");
  }
};

// 更改正确主题类别
const changeSiteThemeType = () => {
  // 主题 class
  const themeClasses = {
    dark: "dark",
    light: "light",
    auto: "auto",
  };
  // 必要数据
  const htmlElement = document.documentElement;
  console.log("当前模式：", themeType.value);
  // 清除所有 class
  Object.values(themeClasses).forEach((themeClass) => {
    htmlElement.classList.remove(themeClass);
  });
  // 添加新的 class
  if (themeType.value === "auto") {
    // 根据当前操作系统颜色方案更改明暗主题
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const autoThemeClass = systemPrefersDark ? themeClasses.dark : themeClasses.light;
    htmlElement.classList.add(autoThemeClass);
    themeValue.value = autoThemeClass;
  } else if (themeClasses[themeType.value]) {
    htmlElement.classList.add(themeClasses[themeType.value]);
    themeValue.value = themeClasses[themeType.value];
  }
  if (backgroundType.value === "image") {
    htmlElement.classList.add("image");
  } else {
    htmlElement.classList.remove("image");
  }
};

// 切换系统字体样式
const changeSiteFont = () => {
  try {
    const htmlElement = document.documentElement;
    htmlElement.classList.remove("lxgw", "hmos");
    htmlElement.classList.add(fontFamily.value);
    htmlElement.style.fontSize = fontSize.value + "px";
  } catch (error) {
    console.error("切换系统字体样式失败", error);
  }
};

// 监听设置变化
watch(
  () => [themeType.value, backgroundType.value],
  () => changeSiteThemeType(),
);
watch(
  () => fontFamily.value,
  () => changeSiteFont(),
);

onMounted(() => {
  console.log("[onMounted] App mounted, registering contextmenu listener");
  // 全站置灰
  specialDayGray();
  // 更改主题类别
  changeSiteThemeType();
  // 切换系统字体样式
  changeSiteFont();
  // 滚动监听
  window.addEventListener("scroll", calculateScroll);
  // 右键监听
  window.addEventListener("contextmenu", openRightMenu);
  // 复制监听
  window.addEventListener("copy", copyTip);
  // 监听系统颜色
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", changeSiteThemeType);
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", calculateScroll);
  window.removeEventListener("contextmenu", openRightMenu);
});
</script>

<style lang="scss" scoped>
.mian-layout {
  width: 100%;
  max-width: 1400px;
  // height: calc(100% - 60px - 75px);
  margin: 0 auto;
  padding: 1rem 2rem;
  // 手动实现加载动画
  animation: show 0.5s forwards;
  animation-duration: 0.5s;
  display: block;
  &.loading {
    display: none;
  }
  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
    &.is-post {
      padding: 0;
    }
  }
}
.left-menu {
  position: fixed;
  left: 20px;
  bottom: 20px;
  z-index: 1002;
  transition:
    opacity 0.3s,
    transform 0.3s;
  &.hidden {
    opacity: 0;
    transform: translateY(100px);
  }
}

.to-top-fab {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 1002;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;

  .to-top-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background-color: var(--main-color);
    box-shadow: 0 4px 12px var(--main-color-bg);
    transition: all 0.3s;

    .icon-up {
      color: #fff;
      font-size: 20px;
    }
  }

  &.hidden {
    opacity: 0;
    transform: scale(0);
    pointer-events: none;
  }

  &:hover {
    opacity: 0.85;
  }

  &:active {
    transform: scale(0.9);
  }
}
</style>
