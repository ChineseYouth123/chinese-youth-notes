<template>
  <div class="fankui">
    <h1 class="title">反馈与投诉</h1>
    <p class="subtitle">感谢您对本网站的关心与支持，如有任何意见或建议，欢迎填写以下表单反馈</p>
    <div class="fankui-content">
      <iframe
        :src="feedbackUrl"
        width="100%"
        height="800"
        frameborder="0"
        allowfullscreen
      />
    </div>
  </div>
</template>

<script setup>
import { useData } from 'vitepress'

const { theme } = useData()

const feedbackUrl = theme.value.siteMeta?.feedbackUrl || ''
</script>

<style lang="scss" scoped>
.fankui {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1.5rem;

  .title {
    font-size: 2.4rem;
    text-align: center;
    margin-bottom: 0.75rem;
    color: var(--main-font-color);
    font-weight: bold;
  }

  .subtitle {
    text-align: center;
    color: var(--main-font-second-color);
    font-size: 1rem;
    margin-bottom: 2rem;
    line-height: 1.6;
  }

  .fankui-content {
    border-radius: 12px;
    overflow: hidden;
    background-color: var(--main-card-background);
    border: 1px solid var(--main-card-border);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  @media (max-width: 768px) {
    padding: 1.5rem 1rem;

    .title {
      font-size: 2rem;
    }

    .subtitle {
      font-size: 0.95rem;
    }
  }
}
</style>
