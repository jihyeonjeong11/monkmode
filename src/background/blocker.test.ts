import { describe, test, expect, beforeEach, mock } from "bun:test";
import { resetMockStorage } from "../__mocks__/chrome";
import { syncDnrRules } from "./blocker";

// updateDynamicRules 호출 기록을 추적하기 위한 스파이
let lastUpdateCall: { removeRuleIds: number[]; addRules: chrome.declarativeNetRequest.Rule[] } | null = null;

beforeEach(() => {
  resetMockStorage();
  lastUpdateCall = null;

  (globalThis as any).chrome.declarativeNetRequest.updateDynamicRules = async (
    opts: { removeRuleIds: number[]; addRules: chrome.declarativeNetRequest.Rule[] }
  ) => {
    lastUpdateCall = opts;
  };
  (globalThis as any).chrome.declarativeNetRequest.getDynamicRules = async () => [
    { id: 1 }, { id: 2 },
  ];
});

describe("syncDnrRules — isActive: false", () => {
  test("기존 규칙을 모두 제거한다", async () => {
    await syncDnrRules(false, ["example.com"]);
    expect(lastUpdateCall).not.toBeNull();
    expect(lastUpdateCall!.removeRuleIds).toContain(1);
    expect(lastUpdateCall!.removeRuleIds).toContain(2);
  });

  test("새 규칙을 추가하지 않는다", async () => {
    await syncDnrRules(false, ["example.com"]);
    expect(lastUpdateCall!.addRules).toHaveLength(0);
  });
});

describe("syncDnrRules — isActive: true", () => {
  test("각 사이트에 대해 DNR 규칙을 생성한다", async () => {
    await syncDnrRules(true, ["example.com", "youtube.com"]);
    expect(lastUpdateCall!.addRules).toHaveLength(2);
  });

  test("urlFilter는 ||{site} 형식이다", async () => {
    await syncDnrRules(true, ["example.com"]);
    const rule = lastUpdateCall!.addRules[0];
    expect(rule.condition.urlFilter).toBe("||example.com");
  });

  test("action은 block-page.html로 redirect한다", async () => {
    await syncDnrRules(true, ["example.com"]);
    const rule = lastUpdateCall!.addRules[0];
    expect(rule.action.type).toBe("redirect");
    expect((rule.action as any).redirect.extensionPath).toContain("block-page");
  });

  test("resourceTypes에 main_frame이 포함된다", async () => {
    await syncDnrRules(true, ["example.com"]);
    const rule = lastUpdateCall!.addRules[0];
    expect(rule.condition.resourceTypes).toContain("main_frame");
  });

  test("사이트가 없으면 기존 규칙만 제거한다", async () => {
    await syncDnrRules(true, []);
    expect(lastUpdateCall!.addRules).toHaveLength(0);
  });
});
