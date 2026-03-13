import { describe, test, expect, beforeEach } from "bun:test";
import { JSDOM } from "jsdom";
import { TimerPhase } from "../../shared/types";

let dom: JSDOM;

beforeEach(() => {
  dom = new JSDOM(`<div id="phase-label"></div>`);
  globalThis.document = dom.window.document as unknown as Document;
});

import { renderPhaseIndicator } from "./PhaseIndicator";

describe("PhaseIndicator", () => {
  test("FOCUS 페이즈를 렌더링한다", () => {
    const el = document.getElementById("phase-label")!;
    renderPhaseIndicator(el, TimerPhase.FOCUS);
    expect(el.textContent).toBe("FOCUS");
  });

  test("SHORT_BREAK 페이즈를 렌더링한다", () => {
    const el = document.getElementById("phase-label")!;
    renderPhaseIndicator(el, TimerPhase.SHORT_BREAK);
    expect(el.textContent).toBe("SHORT BREAK");
  });

  test("LONG_BREAK 페이즈를 렌더링한다", () => {
    const el = document.getElementById("phase-label")!;
    renderPhaseIndicator(el, TimerPhase.LONG_BREAK);
    expect(el.textContent).toBe("LONG BREAK");
  });
});
