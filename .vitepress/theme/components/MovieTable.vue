<template>
  <div class="movie-table">
    <section
      v-for="(section, si) in sections"
      :key="si"
      class="movie-section"
    >
      <h2 v-if="section.title" class="section-title">{{ section.title }}</h2>
      <p v-if="section.desc" class="section-desc">{{ section.desc }}</p>
      <div class="table-container">
        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                <th
                  v-for="col in section.columns"
                  :key="col.key"
                  :style="col.width ? { width: col.width } : undefined"
                >
                  {{ col.label }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, ri) in section.data"
                :key="ri"
              >
                <td
                  v-for="col in section.columns"
                  :key="col.key"
                >
                  <slot
                    :name="`cell-${si}-${col.key}`"
                    :row="row"
                    :row-index="ri"
                    :col="col"
                  >
                    {{ row[col.key] }}
                  </slot>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <blockquote v-if="section.note" class="section-note">
        {{ section.note }}
      </blockquote>
    </section>
  </div>
</template>

<script setup>
defineProps({
  sections: {
    type: Array,
    required: true,
  },
})
</script>

<style scoped>
.movie-table {
  width: 100%;
  animation: fade-up 0.6s 0.2s backwards;
}
.movie-section {
  margin-bottom: 2rem;
}
.section-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 1.5rem 0 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px dashed var(--main-color-bg);
  color: var(--main-font-color);
}
.section-desc {
  color: var(--main-font-second-color);
  margin-bottom: 1rem;
  line-height: 1.8;
}
.table-container {
  position: relative;
  width: 100%;
  margin: 1rem 0;
  border: 1px solid var(--main-card-border);
  border-radius: 8px;
  overflow: hidden;
}
.table-scroll {
  overflow-x: auto;
  overflow-y: hidden;
}
table {
  width: 100%;
  min-width: 512px;
  max-width: 1200px;
  margin: 0 auto;
  border-collapse: collapse;
  border-spacing: 0;
}
td,
th {
  margin: 0;
  padding: 0.6rem 1rem;
  line-height: 1.6;
  letter-spacing: 0.3px;
  vertical-align: middle;
  border: 1px solid var(--main-card-border);
}
thead {
  background-color: var(--main-card-second-background);
}
thead th {
  font-weight: bold;
  color: var(--main-font-color);
  white-space: nowrap;
}
tbody tr {
  transition: background-color 0.3s;
}
tbody tr:hover {
  background-color: var(--main-card-second-background);
}
td {
  color: var(--main-font-color);
  font-size: 0.95rem;
}
.section-note {
  margin: 0.75rem 0;
  padding: 0.75rem 1.25rem;
  border-left: 4px solid var(--main-color);
  background: var(--main-color-bg);
  border-radius: 0 8px 8px 0;
  color: var(--main-font-second-color);
  font-size: 0.9rem;
  line-height: 1.6;
}
@media (max-width: 768px) {
  .movie-section {
    margin-bottom: 1.5rem;
  }
  .section-title {
    font-size: 1.25rem;
  }
  table {
    min-width: 100%;
    font-size: 0.85rem;
  }
  td,
  th {
    padding: 0.4rem 0.6rem;
  }
}
</style>
