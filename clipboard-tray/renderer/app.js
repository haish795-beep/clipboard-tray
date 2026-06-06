let history = [];
let query = "";
const listEl  = document.getElementById("list");
const countEl = document.getElementById("count");
const searchEl = document.getElementById("search");
function timeAgo(ts) {
  const d = Date.now() - ts;
  if (d < 60000)  return "방금";
  if (d < 3600000) return `${Math.floor(d / 60000)}분 전`;
  if (d < 86400000) return `${Math.floor(d / 3600000)}시간 전`;
  return `${Math.floor(d / 86400000)}일 전`;
}
function render() {
  const filtered = query
    ? history.filter((h) =>
        h.type === "text" && h.data.toLowerCase().includes(query.toLowerCase())
      )
    : history;
  countEl.textContent = history.length;
  if (!filtered.length) {
    listEl.innerHTML = `
      <div class="empty">
        <div class="empty-icon">📋</div>
        <div>${query ? "검색 결과 없음" : "클립보드가 비어있어요"}</div>
      </div>`;
    return;
  }

  listEl.innerHTML = filtered.map((item) => {
    const icon = item.type === "image"
      ? `<div class="item-icon"><img src="${item.data}" /></div>`
      : `<div class="item-icon">📄</div>`;

    const text = item.type === "image"
      ? "이미지"
      : escHtml(item.preview ?? item.data.slice(0, 200));

    return `
      <div class="item" data-id="${item.id}">
        ${icon}
        <div class="item-body">
          <div class="item-text">${text}</div>
          <div class="item-meta">${timeAgo(item.time)}</div>
        </div>
        <button class="del-btn" data-del="${item.id}">✕</button>
      </div>`;
  }).join("");

  listEl.querySelectorAll(".item").forEach((el) => {
    el.addEventListener("click", (e) => {
      if (e.target.closest("[data-del]")) return;
      window.api.copyItem(el.dataset.id);
    });
  });

  listEl.querySelectorAll("[data-del]").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      await window.api.deleteItem(btn.dataset.del);
      await refresh();
    });
  });
}

function escHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function refresh() {
  history = await window.api.getHistory();
  render();
}

searchEl.addEventListener("input", (e) => {
  query = e.target.value;
  render();
});

document.getElementById("clearBtn").addEventListener("click", async () => {
  await window.api.clearAll();
  await refresh();
});

document.getElementById("closeBtn").addEventListener("click", () => {
  window.api.hide();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") window.api.hide();
});

window.api.onRefresh(async () => {
  searchEl.value = "";
  query = "";
  await refresh();
});
refresh();
