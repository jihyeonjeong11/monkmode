import { describe, test, expect, beforeEach } from "bun:test";
import { resetMockStorage } from "../__mocks__/chrome";
import { loadState, saveState } from "./storage";
import { handleMessage } from "./messageHandler";

beforeEach(() => {
  resetMockStorage();
});

describe("TOGGLE_BLOCKER", () => {
  test("isActive를 true로 설정한다", async () => {
    await handleMessage({ type: "TOGGLE_BLOCKER", isActive: true });
    const state = await loadState();
    expect(state.isActive).toBe(true);
  });

  test("isActive를 false로 설정한다", async () => {
    const state = await loadState();
    await saveState({ ...state, isActive: true });
    await handleMessage({ type: "TOGGLE_BLOCKER", isActive: false });
    const updated = await loadState();
    expect(updated.isActive).toBe(false);
  });
});

describe("ADD_SITE", () => {
  test("blockedSites에 사이트를 추가한다", async () => {
    await handleMessage({ type: "ADD_SITE", site: "example.com" });
    const state = await loadState();
    expect(state.blockedSites).toContain("example.com");
  });

  test("중복 사이트는 추가하지 않는다", async () => {
    await handleMessage({ type: "ADD_SITE", site: "example.com" });
    await handleMessage({ type: "ADD_SITE", site: "example.com" });
    const state = await loadState();
    expect(state.blockedSites.filter((s) => s === "example.com")).toHaveLength(1);
  });
});

describe("REMOVE_SITE", () => {
  test("blockedSites에서 사이트를 제거한다", async () => {
    const state = await loadState();
    await saveState({ ...state, blockedSites: ["example.com", "youtube.com"] });
    await handleMessage({ type: "REMOVE_SITE", site: "example.com" });
    const updated = await loadState();
    expect(updated.blockedSites).not.toContain("example.com");
    expect(updated.blockedSites).toContain("youtube.com");
  });
});
