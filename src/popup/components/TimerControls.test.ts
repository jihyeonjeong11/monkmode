import { describe, test, expect, beforeEach } from "bun:test";
import { JSDOM } from "jsdom";

let dom: JSDOM;

beforeEach(() => {
  dom = new JSDOM(`
    <button id="start-btn"></button>
    <button id="stop-btn"></button>
    <div id="stop-confirm" style="display:none">
      <input id="stop-input" type="text" />
    </div>
  `);
  globalThis.document = dom.window.document as unknown as Document;
});

import { renderTimerControls } from "./TimerControls";

describe("TimerControls", () => {
  test("정지 중엔 start 버튼만 보인다", () => {
    renderTimerControls({
      startEl: document.getElementById("start-btn")!,
      stopEl: document.getElementById("stop-btn")!,
      isRunning: false,
    });
    expect((document.getElementById("start-btn") as HTMLElement).style.display).not.toBe("none");
    expect((document.getElementById("stop-btn") as HTMLElement).style.display).toBe("none");
  });

  test("실행 중엔 stop 버튼만 보인다", () => {
    renderTimerControls({
      startEl: document.getElementById("start-btn")!,
      stopEl: document.getElementById("stop-btn")!,
      isRunning: true,
    });
    expect((document.getElementById("start-btn") as HTMLElement).style.display).toBe("none");
    expect((document.getElementById("stop-btn") as HTMLElement).style.display).not.toBe("none");
  });
});
