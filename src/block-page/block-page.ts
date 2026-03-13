import type { SessionEntry } from "../shared/types";

export function initBlockPage(containerEl: HTMLElement): void {
  const reflectionInput = containerEl.querySelector<HTMLTextAreaElement>("#reflection-input");
  const submitBtn = containerEl.querySelector<HTMLButtonElement>("#submit-btn");

  submitBtn?.addEventListener("click", async () => {
    const text = reflectionInput?.value.trim() ?? "";

    const entry: SessionEntry = {
      id: crypto.randomUUID(),
      startedAt: Date.now(),
      durationMinutes: 0,
      reflection: text || null,
    };

    const data = await chrome.storage.local.get({ sessions: [] }) as { sessions: SessionEntry[] };
    data.sessions.push(entry);
    await chrome.storage.local.set({ sessions: data.sessions });

    chrome.tabs.getCurrent((tab) => {
      if (tab?.id != null) chrome.tabs.remove(tab.id);
    });
  });
}
