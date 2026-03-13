export interface SiteInputOptions {
  inputEl: HTMLInputElement;
  addBtnEl: HTMLElement;
  onAdd: (site: string) => void;
}

export function initSiteInput({ inputEl, addBtnEl, onAdd }: SiteInputOptions): void {
  function submit() {
    const value = normalizeSiteUrl(inputEl.value.trim());
    if (!value) return;
    onAdd(value);
    inputEl.value = "";
  }

  addBtnEl.addEventListener("click", submit);
  inputEl.addEventListener("keydown", (e) => {
    if ((e as KeyboardEvent).key === "Enter") submit();
  });
}

export function normalizeSiteUrl(raw: string): string {
  return raw
    .replace(/^https?:\/\//, "")
    .split("/")[0]
    .split("?")[0];
}
