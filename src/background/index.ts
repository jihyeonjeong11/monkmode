import type { Message } from "../shared/messages";
import { handleMessage } from "./messageHandler";
import "./timer"; // registers chrome.alarms.onAlarm listener

chrome.runtime.onMessage.addListener(
  (msg: Message, _sender, sendResponse) => {
    handleMessage(msg).then(sendResponse);
    return true; // keep channel open for async response
  }
);
