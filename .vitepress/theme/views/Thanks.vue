<template>
  <div class="thanks">
    <h1 class="title">致谢名单</h1>
    <p class="subtitle">感谢所有支持和帮助过本站的朋友</p>

    <div class="thanks-content">
      <div class="thanks-section">
        <div class="people-list">
          <div
            v-for="(person, index) in people"
            :key="index"
            class="people-card"
            @mouseenter="hoveredIndex = index"
            @mouseleave="hoveredIndex = null"
          >
            <div class="avatar-wrapper">
              <img
                :src="person.avatar"
                :alt="person.name"
                class="avatar"
                loading="lazy"
              />
              <div class="avatar-ring" />
            </div>
            <span class="name">{{ person.name }}</span>
            <span v-if="person.role" class="role">{{ person.role }}</span>

            <Transition name="popover">
              <div
                v-if="hoveredIndex === index"
                class="hover-popover"
              >
                <div class="popover-arrow" />
                <div class="popover-inner">
                  <img
                    :src="person.avatar"
                    :alt="person.name"
                    class="popover-avatar"
                  />
                  <div class="popover-info">
                    <span class="popover-name">{{ person.name }}</span>
                    <span v-if="person.role" class="popover-role">{{ person.role }}</span>
                    <p v-if="person.desc" class="popover-desc">{{ person.desc }}</p>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const hoveredIndex = ref(null);

const people = [
  {
    name: "狸花猫",
    role: "赞助者",
    desc: "感谢您的慷慨支持",
    avatar: "https://sns-webpic-qc.xhscdn.com/202605171017/10128395e041c19fcc4f3458104cdb35/1040g00831i3p691vmk0g5pa5lao0rq6qp7g18lg!nd_dft_wgth_webp_3",
  },
  {
    name: "橘猫",
    role: "赞助者",
    desc: "感谢您的慷慨支持",
    avatar: "https://sns-webpic-qc.xhscdn.com/202605171023/84e2723e1f990a88f041c4bd700bb39d/notes_pre_post/1040g3k031miih6e96g305on3akv7qo5jkjaf6g0!nd_prv_wgth_webp_3",
  },
];
</script>

<style lang="scss" scoped>
.thanks {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;

  .title {
    font-size: 2.4rem;
    text-align: center;
    margin-bottom: 0.5rem;
    color: var(--main-font-color);
    font-weight: bold;
    position: relative;

    &::after {
      content: "";
      display: block;
      width: 60px;
      height: 3px;
      background: var(--main-color);
      margin: 0.8rem auto 0;
      border-radius: 2px;
    }
  }

  .subtitle {
    text-align: center;
    color: var(--main-font-second-color);
    margin-bottom: 2.5rem;
    font-size: 1rem;
  }

  .thanks-content {
    .thanks-section {
      position: relative;
      padding: 2.5rem 2rem;
      border-radius: 16px;
      background-color: var(--main-card-background);
      border: 1px solid var(--main-card-border);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);

      .people-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 24px;

        .people-card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1.5rem 1rem 1rem;
          border-radius: 14px;
          background: var(--main-site-background);
          cursor: pointer;
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.35s ease;

          &:hover {
            transform: translateY(-6px);
            box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);

            .avatar {
              transform: scale(1.1);
            }

            .avatar-ring {
              opacity: 1;
              transform: scale(1);
            }

            .name {
              color: var(--main-color);
            }
          }

          .avatar-wrapper {
            position: relative;
            margin-bottom: 0.8rem;

            .avatar {
              width: 76px;
              height: 76px;
              border-radius: 50%;
              object-fit: cover;
              display: block;
              position: relative;
              z-index: 1;
              transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            }

            .avatar-ring {
              position: absolute;
              inset: -4px;
              border-radius: 50%;
              background: linear-gradient(135deg, var(--main-color), var(--main-color-bg, rgba(0,0,0,0.1)));
              opacity: 0;
              transform: scale(0.85);
              transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
              z-index: 0;
            }
          }

          .name {
            font-size: 1rem;
            font-weight: 600;
            color: var(--main-font-color);
            transition: color 0.3s ease;
          }

          .role {
            font-size: 0.8rem;
            color: var(--main-font-second-color);
            margin-top: 0.2rem;
            opacity: 0.7;
          }

          .hover-popover {
            position: absolute;
            bottom: calc(100% + 16px);
            left: 50%;
            transform: translateX(-50%);
            z-index: 100;
            pointer-events: none;

            .popover-arrow {
              position: absolute;
              bottom: -6px;
              left: 50%;
              transform: translateX(-50%) rotate(45deg);
              width: 12px;
              height: 12px;
              background: var(--main-card-background);
              border: 1px solid var(--main-card-border);
              border-top: none;
              border-left: none;
              z-index: -1;
            }

            .popover-inner {
              display: flex;
              align-items: center;
              gap: 1rem;
              padding: 0.9rem 1.2rem;
              border-radius: 14px;
              background: var(--main-card-background);
              border: 1px solid var(--main-card-border);
              box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
              white-space: nowrap;

              .popover-avatar {
                width: 52px;
                height: 52px;
                border-radius: 50%;
                object-fit: cover;
                flex-shrink: 0;
                border: 2px solid var(--main-color);
              }

              .popover-info {
                display: flex;
                flex-direction: column;

                .popover-name {
                  font-size: 1rem;
                  font-weight: 700;
                  color: var(--main-font-color);
                }

                .popover-role {
                  font-size: 0.78rem;
                  color: var(--main-color);
                  margin-top: 0.15rem;
                  font-weight: 500;
                }

                .popover-desc {
                  font-size: 0.78rem;
                  color: var(--main-font-second-color);
                  margin: 0.2rem 0 0;
                  opacity: 0.75;
                }
              }
            }
          }
        }
      }
    }
  }

  &.popover-enter-active,
  .popover-leave-active {
    transition: opacity 0.2s ease, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .popover-enter-from,
  .popover-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(8px);
  }

  .popover-enter-to,
  .popover-leave-from {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }

  @media (max-width: 768px) {
    padding: 1.5rem 1rem;

    .title {
      font-size: 2rem;
    }

    .thanks-content .thanks-section {
      padding: 1.5rem 1rem;

      .people-list {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 16px;

        .people-card {
          padding: 1rem 0.8rem;

          .avatar-wrapper .avatar {
            width: 64px;
            height: 64px;
          }
        }
      }
    }
  }
}
</style>
