<template>
  <div class="thanks">
    <h1 class="title">致谢名单</h1>
    <p class="subtitle">感谢所有支持和帮助过本站的朋友</p>

    <div class="thanks-content">
      <div class="thanks-section">
        <span class="tip">感谢支持</span>
        <div class="people-list">
          <div
            v-for="(person, index) in people"
            :key="index"
            class="people-card"
          >
            <img
              :src="person.avatar"
              :alt="person.name"
              class="avatar"
              loading="lazy"
            />
            <span class="name">{{ person.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const people = [
  {
    name: "狸花猫",
    avatar: "https://sns-webpic-qc.xhscdn.com/202605171017/10128395e041c19fcc4f3458104cdb35/1040g00831i3p691vmk0g5pa5lao0rq6qp7g18lg!nd_dft_wgth_webp_3",
  },
  {
    name: "橘猫",
    avatar: "https://sns-webpic-qc.xhscdn.com/202605171023/84e2723e1f990a88f041c4bd700bb39d/notes_pre_post/1040g3k031miih6e96g305on3akv7qo5jkjaf6g0!nd_prv_wgth_webp_3",
  },
   {
    name: "更多",
    avatar: "",
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
  }

  .subtitle {
    text-align: center;
    color: var(--main-font-second-color);
    margin-bottom: 2.5rem;
    font-size: 1rem;
  }

  .thanks-content {
    display: grid;
    gap: 24px;

    .thanks-section {
      position: relative;
      display: flex;
      flex-direction: column;
      padding: 1.8rem;
      border-radius: 12px;
      background-color: var(--main-card-background);
      border: 1px solid var(--main-card-border);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

      .tip {
        font-size: 13px;
        color: var(--main-color);
        font-weight: 500;
        margin-bottom: 1.5rem;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .people-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 20px;

        .people-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1.2rem 1rem;
          border-radius: 12px;
          background: var(--main-site-background);
          transition: transform 0.3s, box-shadow 0.3s;
          cursor: default;

          &:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          }

          .avatar {
            width: 72px;
            height: 72px;
            border-radius: 50%;
            object-fit: cover;
            margin-bottom: 0.8rem;
            border: 2px solid var(--main-card-border);
          }

          .name {
            font-size: 1rem;
            font-weight: 600;
            color: var(--main-font-color);
          }
        }
      }
    }
  }

  @media (max-width: 768px) {
    padding: 1.5rem 1rem;

    .title {
      font-size: 2rem;
    }

    .thanks-content .thanks-section .people-list {
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 16px;
    }
  }
}
</style>
