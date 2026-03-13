import type { SessionEntry } from "../shared/types";
import { createLogger } from "../shared/logger";
import { StorageError } from "../shared/errors";

const logger = createLogger("block-page");

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

    try {
      const data = await chrome.storage.local.get({ sessions: [] }) as { sessions: SessionEntry[] };
      data.sessions.push(entry);
      await chrome.storage.local.set({ sessions: data.sessions });
    } catch (cause) {
      logger.error("반성 저장 실패", new StorageError("sessions 저장 실패", cause));
      return;
    }

    chrome.tabs.getCurrent((tab) => {
      if (tab?.id != null) chrome.tabs.remove(tab.id);
    });
  });
}
