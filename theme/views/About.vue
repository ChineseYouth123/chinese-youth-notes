<template>
  <div class="about">
    <h1 class="title">关于本站</h1>
    
    <div class="about-content">
      <!-- 网站介绍 -->
      <div class="about-item introduction">
        <span class="tip">本站宗旨</span>
        <h2 class="section-title">马克思主义·列宁主义·毛泽东思想</h2>
        <p class="desc">
          本网站致力于马克思主义基本原理、列宁主义革命理论及毛泽东思想的学习与研究，
          为广大理论爱好者提供交流探讨的平台。
        </p>
        <p class="desc">
          我们坚持理论联系实际，倡导用科学的世界观和方法论分析现实问题，
          共同推进社会主义理论的创新与发展。
        </p>
      </div>

      <!-- 核心功能 -->
      <div class="about-item features">
        <span class="tip">主要功能</span>
        <div class="feature-list">
          <div class="feature-item">
            <span class="feature-icon">📚</span>
            <div class="feature-info">
              <h3>理论学习</h3>
              <p>发布经典著作解读、理论文章与学习心得</p>
            </div>
          </div>
          <div class="feature-item">
            <span class="feature-icon">💬</span>
            <div class="feature-info">
              <h3>话题讨论</h3>
              <p>围绕社会热点开展马克思主义视角的深度探讨</p>
            </div>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🤝</span>
            <div class="feature-info">
              <h3>交流互助</h3>
              <p>搭建学者与爱好者之间的思想交流平台</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 参与方式 -->
      <div class="about-item participation">
        <span class="tip">加入我们</span>
        <h3>共同学习 · 共同进步</h3>
        <p class="desc">
          欢迎您投稿理论文章、分享学习体会、参与话题讨论。
          让我们携手践行实事求是的思想路线，
          在理论武装中坚定理想信念。
        </p>
        <!-- <div class="action-btns">
          <button class="btn btn-primary" @click="goToArticle">浏览文章</button>
          <button class="btn btn-outline" @click="goToDiscussion">参与讨论</button>
        </div> -->
      </div>

      <!-- 站点统计（保留必要数据） -->
      <div class="about-item statistics" v-if="statisticsData">
        <span class="tip">站点数据</span>
        <div class="static-data">
          <div class="static-item">
            <span class="static-name">文章总数</span>
            <span class="static-num">{{ statisticsData.articleCount || 0 }}</span>
          </div>
          <div class="static-item">
            <span class="static-name">讨论话题</span>
            <span class="static-num">{{ statisticsData.topicCount || 0 }}</span>
          </div>
          <div class="static-item">
            <span class="static-name">学习伙伴</span>
            <span class="static-num">{{ statisticsData.userCount || 0 }}</span>
          </div>
          <div class="static-item">
            <span class="static-name">今日访问</span>
            <span class="static-num">{{ statisticsData.todayVisit || 0 }}</span>
          </div>
        </div>
      </div>

      <!-- 安装到桌面（仅移动端显示） -->
      <div class="about-item install-app">
        <span class="tip">安装到桌面</span>
        <h3 class="section-title">随时随地，便捷访问</h3>
        <p class="desc">
          将本站添加至手机桌面，即可像原生应用一样快速访问，
          无需每次打开浏览器输入网址，畅享沉浸式阅读体验。
        </p>

        <div v-if="isStandalone" class="installed-tip">
          <span class="check-icon">✓</span>
          已安装到桌面，建议添加到主屏幕以获得更好的浏览体验
        </div>

        <button v-else-if="installReady" class="install-btn" @click="installApp">
          安装到桌面
        </button>

        <div v-else class="manual-steps">
          <p class="manual-title">当前浏览器暂不支持一键安装，请按以下步骤操作：</p>
          <div class="steps">
            <div class="step">
              <span class="step-num">1</span>
              <span>打开浏览器菜单（⋮ 或 ⠇）</span>
            </div>
            <div class="step">
              <span class="step-num">2</span>
              <span>选择「添加到主屏幕」或「安装应用」</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, withBase } from 'vitepress'
import { getStatistics } from '@/api'
import { installPromptReady, getDeferredPrompt } from '@/composables/useInstallPrompt'
import { useInstallPrompt } from '@/composables/useInstallPrompt'

const { theme } = useData()
const router = useRouter()

// 站点统计数据
const statisticsData = ref(null)

// 安装状态
const isStandalone = ref(false)
const installReady = ref(false)

// 获取站点统计数据
const getStatisticsData = async () => {
  try {
    const result = await getStatistics(theme.value.tongji?.['51la'])
    statisticsData.value = result
  } catch (error) {
    console.warn('统计数据获取失败:', error)
  }
}

// 安装到桌面
const { install } = useInstallPrompt()
const installApp = () => install()

// 路由跳转
const goToArticle = () => router.push(withBase('/articles'))
const goToDiscussion = () => router.push(withBase('/discussions'))

onMounted(() => {
  getStatisticsData()

  if (typeof window !== 'undefined') {
    isStandalone.value = !!(
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone
    )
    installReady.value = !!getDeferredPrompt()
  }

  // 监听 beforeinstallprompt（事件可能在 mount 后触发）
  watch(installPromptReady, (val) => {
    installReady.value = val
  })
})
</script>

<style lang="scss" scoped>
.about {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;

  .title {
    font-size: 2.4rem;
    text-align: center;
    margin-bottom: 2.5rem;
    color: var(--main-font-color);
    font-weight: bold;
  }

  .about-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;

    .about-item {
      position: relative;
      display: flex;
      flex-direction: column;
      padding: 1.8rem;
      border-radius: 12px;
      background-color: var(--main-card-background);
      border: 1px solid var(--main-card-border);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      transition: transform 0.3s, box-shadow 0.3s;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      }

      .tip {
        font-size: 13px;
        color: var(--main-color);
        font-weight: 500;
        margin-bottom: 1rem;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .section-title {
        font-size: 1.5rem;
        font-weight: bold;
        margin: 0.5rem 0 1rem;
        color: var(--main-font-color);
        line-height: 1.4;
      }

      .desc {
        font-size: 1rem;
        line-height: 1.8;
        color: var(--main-font-second-color);
        margin-bottom: 1rem;
        
        &:last-child {
          margin-bottom: 0;
        }
      }

      // 功能列表样式
      &.features {
        .feature-list {
          margin-top: 0.5rem;
        }
        
        .feature-item {
          display: flex;
          align-items: flex-start;
          padding: 1rem 0;
          border-bottom: 1px dashed var(--main-card-border);
          
          &:last-child {
            border-bottom: none;
            padding-bottom: 0;
          }
          
          .feature-icon {
            font-size: 1.5rem;
            margin-right: 1rem;
            min-width: 28px;
          }
          
          .feature-info {
            flex: 1;
            
            h3 {
              font-size: 1.1rem;
              font-weight: 600;
              margin: 0 0 0.3rem;
              color: var(--main-font-color);
            }
            
            p {
              font-size: 0.95rem;
              color: var(--main-font-second-color);
              margin: 0;
              line-height: 1.6;
            }
          }
        }
      }

      // 参与方式样式
      &.participation {
        h3 {
          font-size: 1.3rem;
          font-weight: bold;
          margin: 0.5rem 0 1rem;
          color: var(--main-font-color);
        }
        
        .action-btns {
          display: flex;
          gap: 12px;
          margin-top: 1.5rem;
          
          .btn {
            flex: 1;
            padding: 0.75rem 1rem;
            border-radius: 8px;
            font-size: 0.95rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s;
            border: none;
            
            &.btn-primary {
              background: linear-gradient(135deg, #c41e3a 0%, #8b0000 100%);
              color: #fff;
              
              &:hover {
                opacity: 0.9;
                transform: translateY(-2px);
              }
            }
            
            &.btn-outline {
              background: transparent;
              color: var(--main-color);
              border: 2px solid var(--main-color);
              
              &:hover {
                background: var(--main-color);
                color: #fff;
              }
            }
          }
        }
      }

      // 安装到桌面样式
      &.install-app {
        display: none;

        .installed-tip {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: var(--main-success-color-gray);
          border-radius: 8px;
          font-size: 0.9rem;
          color: var(--main-font-color);

          .check-icon {
            font-size: 1.1rem;
            font-weight: bold;
            color: var(--main-success-color);
          }
        }

        .install-btn {
          width: 100%;
          padding: 14px 0;
          border: none;
          border-radius: 8px;
          background: var(--main-color);
          color: #fff;
          font-size: 1.05rem;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;

          &:active {
            opacity: 0.8;
          }
        }

        .manual-steps {
          .manual-title {
            font-size: 0.9rem;
            color: var(--main-font-second-color);
            margin-bottom: 12px;
            line-height: 1.6;
          }

          .steps {
            display: flex;
            flex-direction: column;
            gap: 8px;

            .step {
              display: flex;
              align-items: center;
              gap: 10px;
              padding: 10px 14px;
              background: var(--main-site-background);
              border-radius: 8px;
              font-size: 0.9rem;
              color: var(--main-font-color);
              line-height: 1.5;

              .step-num {
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 22px;
                height: 22px;
                border-radius: 50%;
                background: var(--main-color);
                color: #fff;
                font-size: 0.8rem;
                font-weight: 600;
              }
            }
          }
        }

        @media (max-width: 768px) {
          display: flex;
        }
      }

      // 统计数据样式
      &.statistics {
        .static-data {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-top: 0.5rem;
          
          .static-item {
            display: flex;
            flex-direction: column;
            padding: 0.8rem;
            background: var(--main-site-background);
            border-radius: 8px;
            
            .static-name {
              font-size: 0.9rem;
              color: var(--main-font-second-color);
              margin-bottom: 0.3rem;
            }
            
            .static-num {
              font-size: 1.8rem;
              font-weight: bold;
              color: var(--main-color);
            }
          }
        }
      }
    }
  }

  // 移动端适配
  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
    
    .title {
      font-size: 2rem;
      margin-bottom: 2rem;
    }
    
    .about-content {
      grid-template-columns: 1fr;
      
      .about-item {
        padding: 1.5rem;
        
        &.participation .action-btns {
          flex-direction: column;
        }
      }
    }
  }
}
</style>