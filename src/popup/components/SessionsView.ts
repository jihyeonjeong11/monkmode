import type { SessionEntry } from "../../shared/types";

export interface SessionsViewOptions {
  summaryEl: HTMLElement;
  listEl: HTMLElement;
  sessions: SessionEntry[];
}

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

function isToday(timestamp: number): boolean {
  const d = new Date(timestamp);
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

export function renderSessionsView({ summaryEl, listEl, sessions }: SessionsViewOptions): void {
  const todaySessions = sessions.filter((s) => isToday(s.startedAt));

  const totalMinutes = todaySessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  summaryEl.textContent = `오늘 ${todaySessions.length} sessions / ${h}h ${m}m`;

  listEl.innerHTML = "";
  for (const s of todaySessions.slice().reverse()) {
    const d = new Date(s.startedAt);
    const time = `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
    const item = document.createElement("div");
    item.className = "session-item";
    item.innerHTML = `
      <div class="session-meta">${time} ${Math.round(s.durationMinutes)}m</div>
      <div class="session-reflection">${s.reflection ?? "(반성 없음)"}</div>
    `;
    listEl.appendChild(item);
  }
}
