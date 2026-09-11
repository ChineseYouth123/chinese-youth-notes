<template>
  <div class="dashboard">
    <div class="dash-header">
      <h1 class="dash-title">📊 网站数据大屏</h1>
      <span v-if="stats" class="dash-time">
        数据截至 {{ formatTime(stats.generatedAt) }} · 共 {{ stats.totals.postCount }} 篇文章
      </span>
    </div>

    <div v-if="error" class="dash-error">⚠️ 统计数据加载失败：{{ error }}</div>
    <div v-else-if="!stats" class="dash-loading">加载中...</div>

    <template v-if="stats">
      <!-- 指标卡 -->
      <div class="metric-row">
        <div v-for="m in metrics" :key="m.label" class="metric-card">
          <span class="metric-icon">{{ m.icon }}</span>
          <div class="metric-info">
            <span class="metric-value">{{ m.value }}</span>
            <span class="metric-label">{{ m.label }}</span>
          </div>
        </div>
      </div>

      <!-- 图表区 -->
      <div class="chart-grid">
        <div class="chart-card chart-wide">
          <h3 class="chart-title">按天发文趋势</h3>
          <div ref="dailyRef" class="chart-box chart-tall"></div>
        </div>
        <div class="chart-card">
          <h3 class="chart-title">分类占比</h3>
          <div ref="categoryRef" class="chart-box"></div>
        </div>
        <div class="chart-card">
          <h3 class="chart-title">标签 TOP15</h3>
          <div ref="tagRef" class="chart-box"></div>
        </div>
        <div class="chart-card">
          <h3 class="chart-title">单篇字数 TOP10</h3>
          <div ref="wordsRef" class="chart-box"></div>
        </div>
        <div class="chart-card">
          <h3 class="chart-title">字数区间分布</h3>
          <div ref="distRef" class="chart-box"></div>
        </div>
      </div>

      <!-- 榜单 -->
      <div class="list-grid">
        <div class="chart-card">
          <h3 class="chart-title">🆕 最新发布</h3>
          <ul class="post-list">
            <li v-for="(p, i) in stats.latest5" :key="'l' + i">
              <span class="list-rank">{{ i + 1 }}</span>
              <span class="list-title">{{ p.title }}</span>
              <span class="list-meta">{{ p.date }}</span>
            </li>
          </ul>
        </div>
        <div class="chart-card">
          <h3 class="chart-title">📏 最长文章</h3>
          <ul class="post-list">
            <li v-for="(p, i) in stats.longest5" :key="'w' + i">
              <span class="list-rank">{{ i + 1 }}</span>
              <span class="list-title">{{ p.title }}</span>
              <span class="list-meta">{{ formatWords(p.words) }} 字</span>
            </li>
          </ul>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { withBase } from "vitepress";
import * as echarts from "echarts/core";
import { BarChart, LineChart, PieChart } from "echarts/charts";
import {
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([
  BarChart,
  LineChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  CanvasRenderer,
]);

const stats = ref(null);
const error = ref(null);
const dailyRef = ref(null);
const categoryRef = ref(null);
const tagRef = ref(null);
const wordsRef = ref(null);
const distRef = ref(null);

let charts = [];

// 深色大屏配色
const C = {
  bg: "transparent",
  text: "#e8eaf2",
  sub: "#8b93a7",
  accent: "#4f9cff",
  accent2: "#38e1c0",
  accent3: "#ffd166",
  accent4: "#ff7eb6",
  grid: "rgba(139,147,167,.18)",
};

const baseTooltip = {
  backgroundColor: "rgba(20,24,38,.92)",
  borderColor: "rgba(79,156,255,.35)",
  textStyle: { color: C.text },
};

const metrics = computed(() => {
  if (!stats.value) return [];
  const t = stats.value.totals;
  return [
    { icon: "📄", label: "文章总数", value: t.postCount },
    { icon: "✍️", label: "总字数", value: formatWords(t.totalWords) },
    { icon: "📁", label: "分类数", value: t.categoryCount },
    { icon: "🏷️", label: "标签数", value: t.tagCount },
    { icon: "📅", label: "最近更新", value: t.lastUpdate || "-" },
    { icon: "⚡", label: "日均发文", value: t.avgPerDay },
  ];
});

function formatTime(iso) {
  return iso ? iso.slice(0, 10) : "-";
}
function formatWords(n) {
  if (n == null) return "-";
  return n >= 10000 ? (n / 10000).toFixed(1) + " 万" : String(n);
}

function makeOptionDaily(daily) {
  const dates = daily.map((d) => d.date.slice(5)); // MM-DD
  return {
    backgroundColor: C.bg,
    tooltip: { ...baseTooltip, trigger: "axis" },
    legend: { textStyle: { color: C.sub }, top: 0 },
    grid: { left: 40, right: 40, top: 36, bottom: 48 },
    xAxis: {
      type: "category",
      data: dates,
      axisLabel: { color: C.sub },
      axisLine: { lineStyle: { color: C.grid } },
    },
    yAxis: [
      { type: "value", name: "篇", axisLabel: { color: C.sub }, splitLine: { lineStyle: { color: C.grid } } },
      { type: "value", name: "累计", axisLabel: { color: C.sub }, splitLine: { show: false } },
    ],
    dataZoom: [{ type: "inside" }, { type: "slider", height: 16, bottom: 8, borderColor: C.grid, textStyle: { color: C.sub } }],
    series: [
      {
        name: "当日发文",
        type: "bar",
        data: daily.map((d) => d.count),
        itemStyle: { color: C.accent, borderRadius: [3, 3, 0, 0] },
        barMaxWidth: 14,
      },
      {
        name: "累计文章",
        type: "line",
        yAxisIndex: 1,
        data: daily.map((d) => d.cumulative),
        smooth: true,
        symbol: "none",
        lineStyle: { color: C.accent2, width: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(56,225,192,.35)" },
            { offset: 1, color: "rgba(56,225,192,0)" },
          ]),
        },
      },
    ],
  };
}

function makeOptionPie(categories) {
  const palette = [C.accent, C.accent2, C.accent3, C.accent4, "#a78bfa", "#f97316"];
  return {
    backgroundColor: C.bg,
    tooltip: { ...baseTooltip, trigger: "item", formatter: "{b}: {c} 篇 ({d}%)" },
    legend: { orient: "vertical", right: 8, top: "center", textStyle: { color: C.sub } },
    color: palette,
    series: [
      {
        type: "pie",
        radius: ["45%", "72%"],
        center: ["42%", "52%"],
        avoidLabelOverlap: true,
        itemStyle: { borderColor: "#12151f", borderWidth: 2 },
        label: { color: C.text, formatter: "{b}\n{d}%" },
        data: categories,
      },
    ],
  };
}

function makeOptionBarH(items, color, unit) {
  const sorted = [...items].reverse(); // 倒序使最大值在顶部
  return {
    backgroundColor: C.bg,
    tooltip: { ...baseTooltip, trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { left: 8, right: 48, top: 8, bottom: 8, containLabel: true },
    xAxis: { type: "value", axisLabel: { color: C.sub }, splitLine: { lineStyle: { color: C.grid } } },
    yAxis: {
      type: "category",
      data: sorted.map((i) => (i.title || i.name).slice(0, 12)),
      axisLabel: { color: C.text },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        type: "bar",
        data: sorted.map((i) => i.value ?? i.words),
        itemStyle: { color, borderRadius: [0, 4, 4, 0] },
        label: { show: true, position: "right", color: C.sub, formatter: `{c}${unit}` },
        barMaxWidth: 14,
      },
    ],
  };
}

function makeOptionDist(dist) {
  return {
    backgroundColor: C.bg,
    tooltip: { ...baseTooltip, trigger: "axis", formatter: "{b}: {c} 篇" },
    grid: { left: 40, right: 24, top: 24, bottom: 32 },
    xAxis: { type: "category", data: dist.map((d) => d.name), axisLabel: { color: C.sub }, axisLine: { lineStyle: { color: C.grid } } },
    yAxis: { type: "value", axisLabel: { color: C.sub }, splitLine: { lineStyle: { color: C.grid } } },
    series: [
      {
        type: "bar",
        data: dist.map((d) => d.value),
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: C.accent3 },
            { offset: 1, color: "rgba(255,209,102,.15)" },
          ]),
        },
        barMaxWidth: 40,
      },
    ],
  };
}

function renderCharts() {
  const s = stats.value;
  if (!s) return;
  const defs = [
    [dailyRef.value, makeOptionDaily(s.daily)],
    [categoryRef.value, makeOptionPie(s.categories)],
    [tagRef.value, makeOptionBarH(s.tagsTop15, C.accent4, "")],
    [wordsRef.value, makeOptionBarH(s.topWords10.map((w) => ({ title: w.title, words: w.words })), C.accent, " 字")],
    [distRef.value, makeOptionDist(s.wordsDistribution)],
  ];
  charts = defs
    .filter(([el]) => el)
    .map(([el, option]) => {
      const chart = echarts.init(el);
      chart.setOption(option);
      return chart;
    });
}

function handleResize() {
  charts.forEach((c) => c.resize());
}

onMounted(async () => {
  try {
    const res = await fetch(withBase("/dashboard-stats.json"));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    stats.value = await res.json();
  } catch (e) {
    error.value = e.message;
    return;
  }
  await nextTick();
  renderCharts();
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  charts.forEach((c) => c.dispose());
  charts = [];
});
</script>

<style scoped>
.dashboard {
  --dash-bg: #12151f;
  --dash-card: #181c29;
  --dash-border: rgba(79, 156, 255, 0.18);
  max-width: 100%;
  padding: 20px;
  background: var(--dash-bg);
  border-radius: 12px;
  min-height: 60vh;
}

.dash-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 18px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--dash-border);
}

.dash-title {
  margin: 0;
  font-size: 26px;
  color: var(--main-font-color, #e8eaf2);
  letter-spacing: 2px;
}

.dash-time {
  font-size: 13px;
  color: var(--main-font-second-color, #8b93a7);
}

.dash-loading,
.dash-error {
  padding: 60px 0;
  text-align: center;
  color: var(--main-font-second-color, #8b93a7);
}

/* 指标卡 */
.metric-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.metric-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(145deg, rgba(79, 156, 255, 0.08), rgba(56, 225, 192, 0.04)), var(--dash-card);
  border: 1px solid var(--dash-border);
  border-radius: 10px;
  transition: transform 0.25s, box-shadow 0.25s;
}

.metric-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(79, 156, 255, 0.15);
}

.metric-icon {
  font-size: 28px;
}

.metric-info {
  display: flex;
  flex-direction: column;
}

.metric-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--main-font-color, #e8eaf2);
  font-variant-numeric: tabular-nums;
}

.metric-label {
  font-size: 12px;
  color: var(--main-font-second-color, #8b93a7);
}

/* 图表 */
.chart-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.chart-wide {
  grid-column: 1 / -1;
}

.chart-card {
  padding: 14px;
  background: var(--dash-card);
  border: 1px solid var(--dash-border);
  border-radius: 10px;
}

.chart-title {
  margin: 0 0 8px;
  font-size: 15px;
  color: var(--main-font-color, #e8eaf2);
  padding-left: 10px;
  border-left: 3px solid var(--main-color, #4f9cff);
}

.chart-box {
  width: 100%;
  height: 300px;
}

.chart-tall {
  height: 360px;
}

/* 榜单 */
.list-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.post-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.post-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 4px;
  border-bottom: 1px dashed rgba(139, 147, 167, 0.2);
  font-size: 14px;
}

.post-list li:last-child {
  border-bottom: none;
}

.list-rank {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 12px;
  color: #fff;
  background: linear-gradient(135deg, var(--main-color, #4f9cff), #38e1c0);
}

.list-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--main-font-color, #e8eaf2);
}

.list-meta {
  flex-shrink: 0;
  font-size: 12px;
  color: var(--main-font-second-color, #8b93a7);
  font-variant-numeric: tabular-nums;
}

@media (max-width: 768px) {
  .chart-grid,
  .list-grid {
    grid-template-columns: 1fr;
  }

  .chart-box {
    height: 260px;
  }
}
</style>
