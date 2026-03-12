// @ts-nocheck — 임시 스캐폴드, Branch 3(feat/popup-timer-ui)에서 전면 교체 예정
const toggleBtn = document.getElementById("toggle-btn");
const siteInput = document.getElementById("site-input");
const addBtn = document.getElementById("add-btn");
const siteList = document.getElementById("site-list");

let isActive = false;
let blockedSites = [];

async function load() {
  const data = await chrome.storage.local.get({ isActive: false, blockedSites: [] });
  isActive = data.isActive;
  blockedSites = data.blockedSites;
  render();
}

function render() {
  toggleBtn.textContent = isActive ? "ON — 집중 중" : "OFF — 시작하기";
  toggleBtn.style.background = isActive ? "#e53e3e" : "#38a169";

  siteList.innerHTML = "";
  if (blockedSites.length === 0) {
    siteList.innerHTML = '<li class="empty">차단할 사이트를 추가하세요</li>';
    return;
  }
  for (const site of blockedSites) {
    const li = document.createElement("li");
    li.className = "list-item";
    li.innerHTML = `<span>${site}</span><button class="remove-btn" data-site="${site}">✕</button>`;
    siteList.appendChild(li);
  }
}

toggleBtn.addEventListener("click", async () => {
  isActive = !isActive;
  await chrome.storage.local.set({ isActive });
  render();
});

addBtn.addEventListener("click", addSite);
siteInput.addEventListener("keydown", (e) => e.key === "Enter" && addSite());

async function addSite() {
  const site = siteInput.value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
  if (!site || blockedSites.includes(site)) {
    siteInput.value = "";
    return;
  }
  blockedSites = [...blockedSites, site];
  siteInput.value = "";
  await chrome.storage.local.set({ blockedSites });
  render();
}

siteList.addEventListener("click", async (e) => {
  const btn = e.target.closest(".remove-btn");
  if (!btn) return;
  const site = btn.dataset.site;
  blockedSites = blockedSites.filter((s) => s !== site);
  await chrome.storage.local.set({ blockedSites });
  render();
});

load();
