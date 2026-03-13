export interface SiteListOptions {
  containerEl: HTMLElement;
  sites: string[];
  onRemove: (site: string) => void;
}

export function renderSiteList({ containerEl, sites, onRemove }: SiteListOptions): void {
  containerEl.innerHTML = "";

  if (sites.length === 0) {
    containerEl.textContent = "차단된 사이트가 없습니다";
    return;
  }

  for (const site of sites) {
    const item = document.createElement("div");
    item.dataset.site = site;
    item.textContent = site;

    const btn = document.createElement("button");
    btn.dataset.remove = site;
    btn.textContent = "✕";
    btn.addEventListener("click", () => onRemove(site));

    item.appendChild(btn);
    containerEl.appendChild(item);
  }
}
