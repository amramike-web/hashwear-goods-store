let PRODUCTS = [];
const money = n => `${n.toLocaleString("nb-NO")} NOK`;

async function boot() {
  const root = document.getElementById("grid");
  try {
    const res = await fetch("products.json", { cache: "no-store" });
    if (!res.ok) throw new Error("products.json HTTP " + res.status);
    const data = await res.json();
    PRODUCTS = data.products || [];
    if (!PRODUCTS.length) throw new Error("products list empty");
    render(PRODUCTS);
    bindFilters();
  } catch (err) {
    console.error(err);
    if (root) root.innerHTML = `<p class="hint">Could not load products (${String(err.message || err)}). Refresh or try again.</p>`;
  }
}

function bindFilters() {
  document.querySelectorAll("[data-filter]").forEach(el => {
    el.addEventListener("click", e => {
      e.preventDefault();
      const f = el.dataset.filter;
      setActiveFilter(f);
      applyFilter(f);
      if (el.classList.contains("line-card") || el.tagName === "A") {
        document.getElementById("drop")?.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
  document.querySelectorAll("[data-nav]").forEach(el => {
    el.addEventListener("click", () => {
      const f = el.dataset.nav;
      if (!f) return;
      setActiveFilter(f);
      applyFilter(f);
    });
  });
}

function setActiveFilter(f) {
  document.querySelectorAll(".pill[data-filter]").forEach(x => {
    x.classList.toggle("active", x.dataset.filter === f);
  });
}

function applyFilter(f) {
  if (f === "all") render(PRODUCTS);
  else render(PRODUCTS.filter(p => p.section === f || p.line === f));
}

function render(list) {
  const root = document.getElementById("grid");
  if (!root) return;
  if (!list.length) {
    root.innerHTML = `<p class="hint">No products in this filter.</p>`;
    return;
  }
  root.innerHTML = list.map(p => `
    <article class="card" data-id="${p.id}" tabindex="0" role="button" aria-label="${escapeHtml(p.name)}">
      <div class="ph">
        ${p.stub ? `<span class="stub-tag">TEXT CARD</span>` : ""}
        <img src="images/${encodeURIComponent(p.image)}" alt="${escapeHtml(p.name)}" loading="lazy">
      </div>
      <div class="meta">
        <p class="line">${escapeHtml(p.section)} · ${escapeHtml(p.line)} · ${escapeHtml(p.type)}</p>
        <h3 class="name">${escapeHtml(p.name)}</h3>
        <p class="price">${money(p.price)}</p>
      </div>
    </article>`).join("");
  root.querySelectorAll(".card").forEach(card => {
    const open = () => openProduct(card.dataset.id);
    card.addEventListener("click", open);
    card.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
    });
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function openProduct(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  const m = document.getElementById("modal");
  m.querySelector("img").src = `images/${p.image}`;
  m.querySelector("img").alt = p.name;
  m.querySelector("h3").textContent = p.name;
  m.querySelector(".desc").textContent = p.desc + (p.stub ? " (Placeholder visual — official model shot pending.)" : "");
  m.querySelector(".price").textContent = money(p.price);
  m.querySelector(".tags").textContent = `${p.section} · ${p.line} · ${p.type}`;
  const g = m.querySelector(".gelato-note");
  if (g) g.textContent = p.gelato ? `Gelato blank: ${p.gelato}` : "";
  m.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  document.getElementById("modal").classList.remove("open");
  document.body.style.overflow = "";
}

document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });
document.addEventListener("DOMContentLoaded", boot);
