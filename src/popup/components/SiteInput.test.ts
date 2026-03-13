import { describe, test, expect, beforeEach } from "bun:test";
import { JSDOM } from "jsdom";
import { initSiteInput, normalizeSiteUrl, isValidSiteUrl } from "./SiteInput";

let dom: JSDOM;

beforeEach(() => {
  dom = new JSDOM(`
    <input id="site-input" type="text" />
    <button id="add-btn">추가</button>
  `);
  globalThis.document = dom.window.document as unknown as Document;
});

describe("normalizeSiteUrl", () => {
  test("https:// 프리픽스를 제거한다", () => {
    expect(normalizeSiteUrl("https://example.com")).toBe("example.com");
  });

  test("http:// 프리픽스를 제거한다", () => {
    expect(normalizeSiteUrl("http://example.com")).toBe("example.com");
  });

  test("후행 슬래시를 제거한다", () => {
    expect(normalizeSiteUrl("example.com/")).toBe("example.com");
  });

  test("https:// + 후행 슬래시를 모두 처리한다", () => {
    expect(normalizeSiteUrl("https://example.com/")).toBe("example.com");
  });

  test("이미 정규화된 값은 그대로 반환한다", () => {
    expect(normalizeSiteUrl("example.com")).toBe("example.com");
  });

  test("경로를 제거한다", () => {
    expect(normalizeSiteUrl("example.com/path/to/page")).toBe("example.com");
  });

  test("쿼리스트링을 제거한다", () => {
    expect(normalizeSiteUrl("www.youtube.com/watch?v=S1SLT3IexXM")).toBe("www.youtube.com");
  });

  test("https:// + 경로 + 쿼리스트링을 모두 처리한다", () => {
    expect(normalizeSiteUrl("https://www.youtube.com/watch?v=abc")).toBe("www.youtube.com");
  });
});

describe("isValidSiteUrl", () => {
  test("유효한 도메인을 허용한다", () => {
    expect(isValidSiteUrl("example.com")).toBe(true);
  });

  test("서브도메인을 허용한다", () => {
    expect(isValidSiteUrl("www.youtube.com")).toBe(true);
  });

  test("점이 없으면 거부한다", () => {
    expect(isValidSiteUrl("notaurl")).toBe(false);
  });

  test("공백이 있으면 거부한다", () => {
    expect(isValidSiteUrl("example .com")).toBe(false);
  });

  test("빈 문자열을 거부한다", () => {
    expect(isValidSiteUrl("")).toBe(false);
  });
});

describe("initSiteInput", () => {
  test("추가 버튼 클릭 시 onAdd가 호출된다", () => {
    const calls: string[] = [];
    const inputEl = document.getElementById("site-input") as HTMLInputElement;
    const addBtnEl = document.getElementById("add-btn")!;

    inputEl.value = "example.com";
    initSiteInput({ inputEl, addBtnEl, onAdd: (s) => calls.push(s) });

    addBtnEl.click();
    expect(calls).toHaveLength(1);
    expect(calls[0]).toBe("example.com");
  });

  test("onAdd 호출 후 입력창이 비워진다", () => {
    const inputEl = document.getElementById("site-input") as HTMLInputElement;
    const addBtnEl = document.getElementById("add-btn")!;

    inputEl.value = "example.com";
    initSiteInput({ inputEl, addBtnEl, onAdd: () => {} });

    addBtnEl.click();
    expect(inputEl.value).toBe("");
  });

  test("빈 값으로는 onAdd가 호출되지 않는다", () => {
    const calls: string[] = [];
    const inputEl = document.getElementById("site-input") as HTMLInputElement;
    const addBtnEl = document.getElementById("add-btn")!;

    inputEl.value = "   ";
    initSiteInput({ inputEl, addBtnEl, onAdd: (s) => calls.push(s) });

    addBtnEl.click();
    expect(calls).toHaveLength(0);
  });

  test("유효하지 않은 URL이면 onAdd가 호출되지 않는다", () => {
    const calls: string[] = [];
    const inputEl = document.getElementById("site-input") as HTMLInputElement;
    const addBtnEl = document.getElementById("add-btn")!;

    inputEl.value = "notaurl";
    initSiteInput({ inputEl, addBtnEl, onAdd: (s) => calls.push(s) });

    addBtnEl.click();
    expect(calls).toHaveLength(0);
  });

  test("유효하지 않은 URL이면 입력창을 비운다", () => {
    const inputEl = document.getElementById("site-input") as HTMLInputElement;
    const addBtnEl = document.getElementById("add-btn")!;

    inputEl.value = "notaurl";
    initSiteInput({ inputEl, addBtnEl, onAdd: () => {} });

    addBtnEl.click();
    expect(inputEl.value).toBe("");
  });

  test("Enter 키로도 onAdd가 호출된다", () => {
    const calls: string[] = [];
    const inputEl = document.getElementById("site-input") as HTMLInputElement;
    const addBtnEl = document.getElementById("add-btn")!;

    inputEl.value = "youtube.com";
    initSiteInput({ inputEl, addBtnEl, onAdd: (s) => calls.push(s) });

    inputEl.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(calls).toHaveLength(1);
    expect(calls[0]).toBe("youtube.com");
  });

  test("추가 시 URL이 정규화된다", () => {
    const calls: string[] = [];
    const inputEl = document.getElementById("site-input") as HTMLInputElement;
    const addBtnEl = document.getElementById("add-btn")!;

    inputEl.value = "https://example.com/";
    initSiteInput({ inputEl, addBtnEl, onAdd: (s) => calls.push(s) });

    addBtnEl.click();
    expect(calls[0]).toBe("example.com");
  });
});
