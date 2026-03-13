import type { AppState, SessionEntry } from "./types";
import { MessageError } from "./errors";

export type Message =
  | { type: "START_TIMER" }
  | { type: "PAUSE_TIMER" }
  | { type: "RESET_TIMER" }
  | { type: "SKIP_PHASE" }
  | { type: "GET_STATE" }
  | { type: "ADD_SITE"; site: string }
  | { type: "REMOVE_SITE"; site: string }
  | { type: "TOGGLE_BLOCKER"; isActive: boolean }
  | { type: "SAVE_REFLECTION"; entry: SessionEntry };

export type MessageResponse<T extends Message["type"]> =
  T extends "GET_STATE" ? AppState : void;

export async function sendMessage<T extends Message>(
  msg: T
): Promise<MessageResponse<T["type"]>> {
  try {
    return await chrome.runtime.sendMessage(msg);
  } catch (cause) {
    throw new MessageError("sendMessage 실패", cause);
  }
}
