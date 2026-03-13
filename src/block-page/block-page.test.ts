import { describe, test, expect, beforeEach } from "bun:test";
import { JSDOM } from "jsdom";
import { resetMockStorage } from "../__mocks__/chrome";
import { initBlockPage } from "./block-page";

let dom: JSDOM;
let closedTabId: number | null = null;

beforeEach(() => {
  resetMockStorage();
  closedTabId = null;
  dom = new JSDOM(`
    <div id="container">
      <textarea id="reflection-input"></textarea>
      <button id="submit-btn">기록하고 돌아가기</button>
    </div>
  `);
  globalThis.document = dom.window.document as unknown as Document;
  globalThis.history = dom.window.history as unknown as History;
  (globalThis as any).chrome.tabs = {
    getCurrent: (cb: (tab: { id: number }) => void) => cb({ id: 42 }),
    remove: (id: number) => { closedTabId = id; },
  };
});

describe("initBlockPage", () => {
  test("제출 시 SessionEntry가 storage에 저장된다", async () => {
    const container = document.getElementById("container")!;
    initBlockPage(container);

    (document.getElementById("reflection-input") as HTMLTextAreaElement).value = "그냥 궁금해서";
    document.getElementById("submit-btn")!.click();

    // storage 반영 대기
    await new Promise((r) => setTimeout(r, 0));

    const data = await chrome.storage.local.get(null) as any;
    expect(data.sessions).toBeDefined();
    expect(data.sessions.length).toBe(1);
  });

  test("저장된 SessionEntry에 reflection 텍스트가 포함된다", async () => {
    const container = document.getElementById("container")!;
    initBlockPage(container);

    (document.getElementById("reflection-input") as HTMLTextAreaElement).value = "유튜브가 땡겼음";
    document.getElementById("submit-btn")!.click();

    await new Promise((r) => setTimeout(r, 0));

    const data = await chrome.storage.local.get(null) as any;
    expect(data.sessions[0].reflection).toBe("유튜브가 땡겼음");
  });

  test("reflection이 비어있으면 null로 저장된다", async () => {
    const container = document.getElementById("container")!;
    initBlockPage(container);

    (document.getElementById("reflection-input") as HTMLTextAreaElement).value = "";
    document.getElementById("submit-btn")!.click();

    await new Promise((r) => setTimeout(r, 0));

    const data = await chrome.storage.local.get(null) as any;
    expect(data.sessions[0].reflection).toBeNull();
  });

  test("저장된 SessionEntry에 id, startedAt, durationMinutes 필드가 있다", async () => {
    const container = document.getElementById("container")!;
    initBlockPage(container);

    document.getElementById("submit-btn")!.click();

    await new Promise((r) => setTimeout(r, 0));

    const data = await chrome.storage.local.get(null) as any;
    const entry = data.sessions[0];
    expect(typeof entry.id).toBe("string");
    expect(typeof entry.startedAt).toBe("number");
    expect(typeof entry.durationMinutes).toBe("number");
  });

  test("기존 sessions에 append된다", async () => {
    await chrome.storage.local.set({ sessions: [{ id: "existing", startedAt: 0, durationMinutes: 5, reflection: null }] });

    const container = document.getElementById("container")!;
    initBlockPage(container);

    document.getElementById("submit-btn")!.click();

    await new Promise((r) => setTimeout(r, 0));

    const data = await chrome.storage.local.get(null) as any;
    expect(data.sessions.length).toBe(2);
  });

  test("제출 시 현재 탭을 닫는다", async () => {
    const container = document.getElementById("container")!;
    initBlockPage(container);

    document.getElementById("submit-btn")!.click();

    await new Promise((r) => setTimeout(r, 0));

    expect(closedTabId).toBe(42);
  });
});
