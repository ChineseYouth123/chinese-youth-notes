<!-- 全局搜索 - VitePress 本地搜索 -->
<template>
  <Modal
    :show="store.searchShow"
    title="全局搜索"
    titleIcon="search"
    @mask-click="store.changeShowStatus('searchShow')"
    @modal-close="store.changeShowStatus('searchShow')"
  >
    <div class="local-search">
      <input
        v-model="query"
        class="search-input"
        placeholder="搜索文章..."
        autofocus
      />
      <div v-if="query" class="search-results">
        <div v-if="results.length" class="search-list">
          <div
            v-for="(item, index) in results"
            :key="index"
            class="search-item s-card hover"
            @click="jumpSearch(item.id)"
          >
            <p class="title" v-html="item.title" />
            <p v-if="item.titles?.length" class="anchor">{{ item.titles.join(' > ') }}</p>
          </div>
        </div>
        <div v-else class="no-result">
          <i class="iconfont icon-search-empty" />
          <span class="text">未找到结果</span>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup>
import { mainStore } from "@/store";
import MiniSearch from "minisearch";
import localSearchIndex from "@localSearchIndex";

const store = mainStore();
const router = useRouter();
const { localeIndex } = useData();

const query = ref("");
const results = ref([]);
const searchIndex = ref(null);

const loadIndex = async () => {
  const locale = localeIndex.value;
  const data = await localSearchIndex[locale]?.();
  if (data?.default) {
    searchIndex.value = MiniSearch.loadJSON(data.default, {
      fields: ["title", "titles", "text"],
      storeFields: ["title", "titles"],
    });
  }
};

const doSearch = () => {
  if (!searchIndex.value || !query.value.trim()) {
    results.value = [];
    return;
  }
  results.value = searchIndex.value.search(query.value.trim(), {
    prefix: true,
    fuzzy: 0.2,
    boost: { title: 4, text: 2, titles: 1 },
  });
};

watch(query, doSearch);

const jumpSearch = (url) => {
  store.changeShowStatus("searchShow");
  router.go(url);
};

onMounted(async () => {
  await loadIndex();
});

onBeforeUnmount(() => {
  query.value = "";
  results.value = [];
});
</script>

<style lang="scss" scoped>
.local-search {
  height: 100%;
  .search-input {
    width: 100%;
    height: 40px;
    outline: none;
    border-radius: 8px;
    font-size: 16px;
    padding: 0.6rem 1rem;
    color: var(--main-font-color);
    font-family: var(--main-font-family);
    border: 1px solid var(--main-card-border);
    background-color: var(--main-card-second-background);
    transition:
      border-color 0.3s,
      box-shadow 0.3s;
    &:focus {
      border-color: var(--main-color);
      box-shadow: 0 8px 16px -4px var(--main-color-bg);
    }
  }
  .search-results {
    margin-top: 20px;
    min-height: 200px;
    .no-result {
      height: 200px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      .iconfont {
        font-size: 40px;
        margin-bottom: 12px;
      }
      .text {
        font-size: 18px;
        opacity: 0.6;
      }
    }
    .search-list {
      .search-item {
        margin-bottom: 12px;
        .title {
          display: inline;
          font-size: 16px;
          margin-bottom: 6px;
        }
        .anchor {
          margin-top: 6px;
          color: var(--main-font-second-color);
          font-size: 14px;
        }
        p {
          margin: 0;
        }
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
}
</style>
