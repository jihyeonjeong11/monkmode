## Hallucinations - 나중에 원인 찾거나 그냥 버리거나

```
  // chrome.offscreen.getContexts may not be typed in older @types/chrome
  // const offscreen = chrome.offscreen as typeof chrome.offscreen & {
  //   getContexts: (filter: object) => Promise<unknown[]>;
  // };
  // const contexts = await offscreen.getContexts({});
  // if (contexts.length === 0) {
  //   await chrome.offscreen.createDocument({
  //     url: chrome.runtime.getURL("offscreen.html"),
  //     reasons: [chrome.offscreen.Reason.AUDIO_PLAYBACK],
  //     justification: "타이머 종료 알림음 재생",
  //   });
  // }
```