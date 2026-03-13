## 주로 Hallucination이나 잘못 지시된 부분을 겪은 경우 수정하고 기록하는 문서

DRY할 시 룰 수정 필요함!!!


1. 코드 구현상
ref: https://stackoverflow.com/questions/67437180/play-audio-from-background-script-in-chrome-extention-manifest-v3
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

2. CLAUDE.md에 자꾸 같은 내용을 추가하려고 함 - 룰 수정함

3. 테스트만 작성했지만, todo.md에 완료로 표기하였음

### `src/popup/components/PhaseIndicator.ts`
-- [x] `FOCUS` 텍스트 표시 (브레이크 없음)    

4. 워크플로우 전체 무시

https://aisparkup.com/posts/7112

https://www.reddit.com/r/ClaudeAI/comments/1ldugmg/this_is_why_claude_code_sometimes_ignore_your/

원인 1: Claude의 "효율성 편향"                                                                                                                                  
  Claude는 관련된 것들을 묶어서 처리하려는 경향이 있습니다. TODO.md에 체크리스트가 한눈에 보이면, 연관된 태스크들을 자연스럽게 함께 구현합니다. CLAUDE.md      
  규칙이 있어도 "이 3개는 같은 파일이니 한 번에 하는 게 낫다"는 판단이 우선합니다.

  원인 2: TDD가 "선언적 규칙"이라 강제력이 없음

  CLAUDE.md에 적혀 있어도 Claude가 스스로 판단해서 따릅니다. "구현이 간단하니 테스트 먼저 안 써도 되겠다"는 판단이 개입됩니다.

  ---