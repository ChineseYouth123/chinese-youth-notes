<template>
  <div class="mobile-table-enhancer" />
</template>

<script setup>
let observer = null

function enhanceTables() {
  document.querySelectorAll(".table-container:not(.mobile-enhanced)").forEach(enhanceTable)
}

function enhanceTable(container) {
  container.classList.add("mobile-enhanced")
  container.style.position = "relative"

  const table = container.querySelector("table")
  if (!table) return

  // wrap table in scroll div so toggle button is not clipped by overflow
  const scrollWrap = document.createElement("div")
  scrollWrap.className = "table-scroll"
  table.parentNode.insertBefore(scrollWrap, table)
  scrollWrap.appendChild(table)

  const headers = parseHeaders(table)
  const rows = parseRows(table)
  if (rows.length === 0) return

  // toggle button (top‑right)
  const toggle = document.createElement("button")
  toggle.className = "mobile-table-toggle"
  toggle.type = "button"
  toggle.innerHTML = '<i class="iconfont icon-refresh"></i>'
  toggle.addEventListener("click", () => {
    if (container.dataset.tableView === "table") {
      container.dataset.tableView = "cards"
    } else {
      container.dataset.tableView = "table"
    }
  })
  container.insertBefore(toggle, scrollWrap)

  // card view
  const cardsEl = document.createElement("div")
  cardsEl.className = "mobile-table-cards"

  const track = document.createElement("div")
  track.className = "mobile-table-track"

  rows.forEach((row) => {
    const card = document.createElement("div")
    card.className = "mobile-table-card"
    row.forEach((html, ci) => {
      const label = headers[ci] || ""
      const field = document.createElement("div")
      field.className = "mobile-table-field"
      field.innerHTML = `<span class="mobile-table-label">${label}</span><span class="mobile-table-value">${html}</span>`
      card.appendChild(field)
    })
    track.appendChild(card)
  })

  cardsEl.appendChild(track)

  const dots = document.createElement("div")
  dots.className = "mobile-table-dots"
  for (let i = 0; i < rows.length; i++) {
    const dot = document.createElement("span")
    dot.className = "mobile-table-dot"
    dots.appendChild(dot)
  }
  const pageEl = document.createElement("div")
  pageEl.className = "mobile-table-page"
  pageEl.textContent = `1/${rows.length}`
  cardsEl.appendChild(pageEl)

  container.appendChild(cardsEl)

  setupSwipe(cardsEl, rows.length)
}

function parseHeaders(table) {
  const thead = table.querySelector("thead")
  if (thead) {
    return Array.from(thead.querySelectorAll("th")).map((th) => th.textContent.trim())
  }
  return []
}

function parseRows(table) {
  const tbody = table.querySelector("tbody")
  if (!tbody) return []
  return Array.from(tbody.querySelectorAll("tr")).map((tr) =>
    Array.from(tr.querySelectorAll("td")).map((td) => td.innerHTML),
  )
}

function setupSwipe(cardsEl, total) {
  const track = cardsEl.querySelector(".mobile-table-track")
  const dots = cardsEl.querySelector(".mobile-table-dots")
  if (!track || total <= 1) {
    if (dots) dots.style.display = "none"
    return
  }

  let index = 0
  let startX = 0
  let isDragging = false

  function goTo(newIndex) {
    index = Math.max(0, Math.min(newIndex, total - 1))
    track.style.transition = "transform 0.3s ease"
    track.style.transform = `translateX(-${index * 100}%)`
    dots.querySelectorAll(".mobile-table-dot").forEach((d, i) => d.classList.toggle("active", i === index))
    const pageEl = cardsEl.querySelector(".mobile-table-page")
    if (pageEl) pageEl.textContent = `${index + 1}/${total}`
  }

  track.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX
    isDragging = true
    track.style.transition = "none"
  }, { passive: true })

  track.addEventListener("touchmove", (e) => {
    if (!isDragging) return
    const diff = e.touches[0].clientX - startX
    const offset = -index * track.parentElement.clientWidth + diff
    track.style.transform = `translateX(${offset}px)`
  }, { passive: true })

  track.addEventListener("touchend", (e) => {
    if (!isDragging) return
    isDragging = false
    track.style.transition = "transform 0.3s ease"
    const diff = e.changedTouches[0].clientX - startX
    if (diff > 60 && index > 0) goTo(index - 1)
    else if (diff < -60 && index < total - 1) goTo(index + 1)
    else goTo(index)
  }, { passive: true })

  track.addEventListener("mousedown", (e) => {
    startX = e.clientX
    isDragging = true
    track.style.transition = "none"
  })

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return
    const diff = e.clientX - startX
    const offset = -index * track.parentElement.clientWidth + diff
    track.style.transform = `translateX(${offset}px)`
  })

  window.addEventListener("mouseup", (e) => {
    if (!isDragging) return
    isDragging = false
    track.style.transition = "transform 0.3s ease"
    const diff = e.clientX - startX
    if (diff > 60 && index > 0) goTo(index - 1)
    else if (diff < -60 && index < total - 1) goTo(index + 1)
    else goTo(index)
  })

  dots.querySelectorAll(".mobile-table-dot").forEach((dot, i) => {
    dot.addEventListener("click", () => goTo(i))
  })

  goTo(0)
}

onMounted(() => {
  enhanceTables()
  observer = new MutationObserver(() => enhanceTables())
  observer.observe(document.body, { childList: true, subtree: true })
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})
</script>
