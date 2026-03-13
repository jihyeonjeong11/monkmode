import { describe, test, expect, beforeEach } from "bun:test";
import { JSDOM } from "jsdom";
import { renderSiteList } from "./SiteList";

let dom: JSDOM;

beforeEach(() => {
  dom = new JSDOM(`<div id="site-list"></div>`);
  globalThis.document = dom.window.document as unknown as Document;
});

describe("renderSiteList", () => {
  test("사이트 목록을 렌더링한다", () => {
    const containerEl = document.getElementById("site-list")!;
    renderSiteList({ containerEl, sites: ["example.com", "youtube.com"], onRemove: () => {} });

    const items = containerEl.querySelectorAll("[data-site]");
    expect(items).toHaveLength(2);
  });

  test("각 항목에 사이트 이름이 표시된다", () => {
    const containerEl = document.getElementById("site-list")!;
    renderSiteList({ containerEl, sites: ["example.com"], onRemove: () => {} });

    expect(containerEl.textContent).toContain("example.com");
  });

  test("각 항목에 제거 버튼이 있다", () => {
    const containerEl = document.getElementById("site-list")!;
    renderSiteList({ containerEl, sites: ["example.com"], onRemove: () => {} });

    const removeBtn = containerEl.querySelector("[data-remove]");
    expect(removeBtn).not.toBeNull();
  });

  test("제거 버튼 클릭 시 onRemove가 해당 사이트와 함께 호출된다", () => {
    const removed: string[] = [];
    const containerEl = document.getElementById("site-list")!;
    renderSiteList({
      containerEl,
      sites: ["example.com", "youtube.com"],
      onRemove: (s) => removed.push(s),
    });

    const removeBtns = containerEl.querySelectorAll("[data-remove]");
    (removeBtns[0] as HTMLElement).click();
    expect(removed).toHaveLength(1);
    expect(removed[0]).toBe("example.com");
  });

  test("빈 목록이면 안내 메시지를 표시한다", () => {
    const containerEl = document.getElementById("site-list")!;
    renderSiteList({ containerEl, sites: [], onRemove: () => {} });

    expect(containerEl.textContent).toContain("차단된 사이트가 없습니다");
  });

  test("재렌더링 시 이전 내용을 교체한다", () => {
    const containerEl = document.getElementById("site-list")!;
    renderSiteList({ containerEl, sites: ["example.com"], onRemove: () => {} });
    renderSiteList({ containerEl, sites: ["youtube.com"], onRemove: () => {} });

    const items = containerEl.querySelectorAll("[data-site]");
    expect(items).toHaveLength(1);
    expect(containerEl.textContent).toContain("youtube.com");
    expect(containerEl.textContent).not.toContain("example.com");
  });
});
