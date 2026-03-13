import { describe, test, expect, beforeEach } from "bun:test";
import { JSDOM } from "jsdom";

let dom: JSDOM;

beforeEach(() => {
  dom = new JSDOM(`<div id="timer-display"></div>`);
  globalThis.document = dom.window.document as unknown as Document;
});

import { renderTimerDisplay } from "./TimerDisplay";

describe("TimerDisplay", () => {
  test("초를 MM:SS 형식으로 렌더링한다", () => {
    const el = document.getElementById("timer-display")!;
    renderTimerDisplay(el, 90);
    expect(el.textContent).toBe("01:30");
  });

  test("0초는 00:00으로 렌더링한다", () => {
    const el = document.getElementById("timer-display")!;
    renderTimerDisplay(el, 0);
    expect(el.textContent).toBe("00:00");
  });

  test("3600초(1시간)는 01:00:00으로 렌더링한다", () => {
    const el = document.getElementById("timer-display")!;
    renderTimerDisplay(el, 3600);
    expect(el.textContent).toBe("01:00:00");
  });

  test("14400초(4시간)는 04:00:00으로 렌더링한다", () => {
    const el = document.getElementById("timer-display")!;
    renderTimerDisplay(el, 14400);
    expect(el.textContent).toBe("04:00:00");
  });

  test("3661초는 01:01:01으로 렌더링한다", () => {
    const el = document.getElementById("timer-display")!;
    renderTimerDisplay(el, 3661);
    expect(el.textContent).toBe("01:01:01");
  });

  test("endTime이 null이면 --:--를 렌더링한다", () => {
    const el = document.getElementById("timer-display")!;
    renderTimerDisplay(el, null);
    expect(el.textContent).toBe("--:--");
  });
});
