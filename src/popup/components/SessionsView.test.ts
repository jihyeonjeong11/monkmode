import { describe, test, expect, beforeEach } from "bun:test";
import { JSDOM } from "jsdom";
import { renderSessionsView } from "./SessionsView";
import type { SessionEntry } from "../../shared/types";

let dom: JSDOM;

function makeSession(overrides: Partial<SessionEntry> = {}): SessionEntry {
  return {
    id: crypto.randomUUID(),
    startedAt: Date.now(),
    durationMinutes: 60,
    reflection: null,
    ...overrides,
  };
}

function todayAt(hour: number, minute = 0): number {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.getTime();
}

function yesterdayTimestamp(): number {
  return Date.now() - 24 * 60 * 60 * 1000;
}

beforeEach(() => {
  dom = new JSDOM(`
    <div id="summary"></div>
    <div id="list"></div>
  `);
  globalThis.document = dom.window.document as unknown as Document;
});

describe("renderSessionsView — 요약", () => {
  test("오늘 세션 수와 총 시간을 표시한다", () => {
    const summaryEl = document.getElementById("summary")!;
    const listEl = document.getElementById("list")!;
    const sessions = [
      makeSession({ startedAt: todayAt(10), durationMinutes: 60 }),
      makeSession({ startedAt: todayAt(14), durationMinutes: 120 }),
    ];

    renderSessionsView({ summaryEl, listEl, sessions });

    expect(summaryEl.textContent).toContain("2 sessions");
    expect(summaryEl.textContent).toContain("3h");
  });

  test("세션이 없으면 0 sessions를 표시한다", () => {
    const summaryEl = document.getElementById("summary")!;
    renderSessionsView({ summaryEl, listEl: document.getElementById("list")!, sessions: [] });
    expect(summaryEl.textContent).toContain("0 sessions");
  });

  test("어제 세션은 집계에 포함하지 않는다", () => {
    const summaryEl = document.getElementById("summary")!;
    const sessions = [
      makeSession({ startedAt: yesterdayTimestamp(), durationMinutes: 60 }),
      makeSession({ startedAt: todayAt(10), durationMinutes: 30 }),
    ];
    renderSessionsView({ summaryEl, listEl: document.getElementById("list")!, sessions });
    expect(summaryEl.textContent).toContain("1 sessions");
  });
});

describe("renderSessionsView — 목록", () => {
  test("오늘 세션을 렌더링한다", () => {
    const listEl = document.getElementById("list")!;
    const sessions = [makeSession({ startedAt: todayAt(10) })];
    renderSessionsView({ summaryEl: document.getElementById("summary")!, listEl, sessions });
    expect(listEl.children.length).toBe(1);
  });

  test("어제 세션은 목록에 표시하지 않는다", () => {
    const listEl = document.getElementById("list")!;
    const sessions = [makeSession({ startedAt: yesterdayTimestamp() })];
    renderSessionsView({ summaryEl: document.getElementById("summary")!, listEl, sessions });
    expect(listEl.children.length).toBe(0);
  });

  test("시작 시간이 HH:MM 형식으로 표시된다", () => {
    const listEl = document.getElementById("list")!;
    const sessions = [makeSession({ startedAt: todayAt(9, 5) })];
    renderSessionsView({ summaryEl: document.getElementById("summary")!, listEl, sessions });
    expect(listEl.textContent).toContain("09:05");
  });

  test("지속 시간이 표시된다", () => {
    const listEl = document.getElementById("list")!;
    const sessions = [makeSession({ startedAt: todayAt(10), durationMinutes: 90 })];
    renderSessionsView({ summaryEl: document.getElementById("summary")!, listEl, sessions });
    expect(listEl.textContent).toContain("90m");
  });

  test("소수점 분은 반올림해서 표시한다", () => {
    const listEl = document.getElementById("list")!;
    const sessions = [makeSession({ startedAt: todayAt(10), durationMinutes: 0.8333333333 })];
    renderSessionsView({ summaryEl: document.getElementById("summary")!, listEl, sessions });
    expect(listEl.textContent).toContain("1m");
    expect(listEl.textContent).not.toContain("0.8");
  });

  test("reflection 텍스트가 표시된다", () => {
    const listEl = document.getElementById("list")!;
    const sessions = [makeSession({ startedAt: todayAt(10), reflection: "집중하려고 했다" })];
    renderSessionsView({ summaryEl: document.getElementById("summary")!, listEl, sessions });
    expect(listEl.textContent).toContain("집중하려고 했다");
  });

  test("reflection이 null이면 '(반성 없음)'을 표시한다", () => {
    const listEl = document.getElementById("list")!;
    const sessions = [makeSession({ startedAt: todayAt(10), reflection: null })];
    renderSessionsView({ summaryEl: document.getElementById("summary")!, listEl, sessions });
    expect(listEl.textContent).toContain("(반성 없음)");
  });

  test("최신 세션이 위에 오도록 역순 렌더링한다", () => {
    const listEl = document.getElementById("list")!;
    const sessions = [
      makeSession({ startedAt: todayAt(9), reflection: "첫번째" }),
      makeSession({ startedAt: todayAt(14), reflection: "두번째" }),
    ];
    renderSessionsView({ summaryEl: document.getElementById("summary")!, listEl, sessions });
    const items = listEl.querySelectorAll(".session-item");
    expect(items[0].textContent).toContain("두번째");
    expect(items[1].textContent).toContain("첫번째");
  });
});
