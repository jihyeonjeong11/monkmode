# TODO — Monk Mode Extension

브랜치 단위로 작업을 진행합니다. 각 브랜치는 독립적으로 동작 가능한 단위가 되어야 합니다.

---

## Branch 1: `feat/shared-foundation`

**목표:** 모든 컨텍스트(background, popup, content)가 공유하는 타입·메시지·상수 정의

### `src/shared/types.ts`
- [ ] `TimerPhase` enum: `FOCUS | SHORT_BREAK | LONG_BREAK`
- [ ] `TimerState` 타입: `phase`, `remainingSeconds`, `isRunning`, `completedPomodoros`
- [ ] `SessionEntry` 타입: `id`, `startedAt` (timestamp), `durationMinutes`, `reflection` (string | null)
- [ ] `AppState` 타입: `timer: TimerState`, `blockedSites: string[]`, `isActive: boolean`, `sessions: SessionEntry[]`

### `src/shared/errors.ts`
- [ ] `MonkModeError` base class (extends `Error`): `code`, `message`
- [ ] `StorageError` — `chrome.storage` 읽기/쓰기 실패
- [ ] `AlarmError` — `chrome.alarms` 등록/해제 실패
- [ ] `DnrError` — `declarativeNetRequest` 규칙 동기화 실패
- [ ] `MessageError` — 메시지 송수신 실패 (unknown sender 등)

### `src/shared/logger.ts`
- [ ] 컨텍스트 prefix 상수: `[background]`, `[popup]`, `[content]`, `[block-page]`
- [ ] `createLogger(context)` → `{ log, warn, error }` 반환
  - 출력 형식: `[context] message` + 에러면 `MonkModeError.code` 포함
- [ ] 각 컨텍스트 진입점에서 `const logger = createLogger("background")` 식으로 초기화

### `src/shared/constants.ts`
- [ ] `ALARM_NAME = "pomodoro-tick"`
- [ ] `DEFAULT_FOCUS_MINUTES = 25`
- [ ] `DEFAULT_SHORT_BREAK_MINUTES = 5`
- [ ] `DEFAULT_LONG_BREAK_MINUTES = 15`
- [ ] `POMODOROS_UNTIL_LONG_BREAK = 4`

### `src/shared/messages.ts`
- [ ] Message union 타입 정의:
  - `START_TIMER` / `PAUSE_TIMER` / `RESET_TIMER` / `SKIP_PHASE`
  - `GET_STATE` → 응답: `AppState`
  - `ADD_SITE` / `REMOVE_SITE` (payload: `site: string`)
  - `TOGGLE_BLOCKER` (payload: `isActive: boolean`)
  - `SAVE_REFLECTION` (payload: `SessionEntry`)
- [ ] `sendMessage<T>(msg)` 헬퍼 함수

---

## Branch 2: `feat/timer-core`

**목표:** Background 서비스 워커에서 Pomodoro 타이머 동작 구현

**의존:** `feat/shared-foundation`

### `src/background/index.ts`
- [ ] `chrome.storage.local`에서 `AppState` 로드 (`initState`)
- [ ] `chrome.alarms.create(ALARM_NAME, { periodInMinutes: 1/60 })` — 매 초 tick
- [ ] `chrome.alarms.onAlarm` 리스너:
  - `remainingSeconds` 1씩 감소
  - 0이 되면 페이즈 전환 (`FOCUS → SHORT_BREAK → ...`)
  - `completedPomodoros` 4 도달 시 `LONG_BREAK`
  - 페이즈 완료 시 `SessionEntry` 저장 (focus 페이즈만)
  - 상태를 `chrome.storage.local.set`으로 저장
- [ ] `chrome.runtime.onMessage` 리스너:
  - `START_TIMER`: 알람 생성 + `isRunning = true`
  - `PAUSE_TIMER`: 알람 제거 + `isRunning = false`
  - `RESET_TIMER`: 알람 제거 + 현재 페이즈 시간 초기화
  - `SKIP_PHASE`: 다음 페이즈로 전환
  - `GET_STATE`: 현재 AppState 반환

---

## Branch 3: `feat/popup-timer-ui`

**목표:** Popup의 Timer 탭 UI 구현

**의존:** `feat/shared-foundation`

### `src/popup/popup.html`
- [ ] 기본 레이아웃: 헤더(`🧘 Monk Mode` + `[⚙]`), 콘텐츠 영역, 하단 탭 3개
- [ ] Timer 탭 구조 마크업

### `src/popup/components/PhaseIndicator.ts`
- [ ] `FOCUS / SHORT BREAK / LONG BREAK` 텍스트 표시
- [ ] 완료된 뽀모도로 개수를 점(● ○)으로 표시

### `src/popup/components/TimerDisplay.ts`
- [ ] `remainingSeconds`를 `MM:SS` 형식으로 렌더링
- [ ] `render(seconds: number)` 함수 export

### `src/popup/components/TimerControls.ts`
- [ ] Start / Pause 버튼 (상태에 따라 전환)
- [ ] Reset 버튼
- [ ] Skip 버튼
- [ ] 각 버튼 클릭 시 `sendMessage`로 background에 전달

### `src/popup/popup.ts`
- [ ] 기존 코드 교체 — 컴포넌트 기반으로 재작성
- [ ] `GET_STATE` 메시지로 초기 상태 로드
- [ ] `chrome.storage.onChanged` 리스너로 실시간 UI 갱신
- [ ] 탭 전환 로직 (Timer | Blocklist | Sessions)

---

## Branch 4: `feat/web-blocker`

**목표:** DNR 규칙 기반 사이트 차단 + Blocklist 탭 UI

**의존:** `feat/shared-foundation`, `feat/timer-core`

### `src/background/index.ts` (추가)
- [ ] `syncDnrRules(isActive: boolean, blockedSites: string[])` 함수:
  - `isActive === false`: `chrome.declarativeNetRequest.updateDynamicRules`로 기존 규칙 전체 제거
  - `isActive === true`: `blockedSites` 각 항목을 DNR 규칙으로 변환
    - `urlFilter: "||{site}"`, `resourceTypes: ["main_frame"]`
    - `action: { type: "redirect", redirect: { extensionPath: "/block-page.html" } }`
- [ ] `TOGGLE_BLOCKER` / `ADD_SITE` / `REMOVE_SITE` 메시지 처리 후 `syncDnrRules` 호출

### `src/popup/components/SiteInput.ts`
- [ ] URL 입력 필드 + 추가 버튼
- [ ] `https://`, 후행 `/` 제거 정규화
- [ ] Enter 키 지원
- [ ] `onAdd(site: string)` 콜백

### `src/popup/components/SiteList.ts`
- [ ] 차단 목록 렌더링
- [ ] 각 항목에 `[✕]` 제거 버튼
- [ ] 빈 목록 안내 메시지

---

## Branch 5: `feat/block-page`

**목표:** 차단 시 보여주는 반성 페이지 구현

**의존:** `feat/shared-foundation`

### `src/block-page/index.html`
- [ ] UI 스펙대로 레이아웃:
  - `🧘` 아이콘
  - "집중 모드 활성 중" 제목
  - 명상 안내 문구 ("잠깐 멈추고 호흡을 가다듬으세요...")
  - 텍스트 입력 ("왜 이 사이트에 왔나요?")
  - "기록하고 돌아가기" 버튼
- [ ] 제출 시:
  - `SessionEntry` 생성 후 `chrome.storage.local`에 append
  - `history.back()` 또는 `chrome.tabs.goBack()`으로 이전 페이지 복귀
- [ ] 인라인 `<script>` 또는 별도 `block-page.ts` 빌드 엔트리

---

## Branch 6: `feat/sessions-view`

**목표:** 오늘의 세션 기록 보기

**의존:** `feat/shared-foundation`, `feat/block-page`

### `src/popup/popup.ts` (Sessions 탭 추가)
- [ ] `AppState.sessions`에서 오늘 날짜 기준 필터링
- [ ] 상단 요약: "오늘 N sessions / Xh Ym"
- [ ] 세션 목록 렌더링:
  - 시작 시간 (HH:MM)
  - 지속 시간 (Nm)
  - 반성 텍스트 or "(반성 없음)"

---

## Branch 7: `feat/content-script` _(선택)_

**목표:** content script 역할 확정 후 구현

현재 차단은 DNR redirect로 처리되므로 content script 필요 여부 재검토 필요.
- [ ] 필요 시: 차단 페이지 오버레이 인젝션 방식으로 전환
- [ ] 불필요 시: `manifest.json`에서 `content_scripts` 항목 제거

---

## 공통 작업

- [ ] `manifest.json`에 `declarativeNetRequest` 권한 확인
- [ ] `manifest.json`에 `storage`, `alarms` 권한 확인
- [ ] `build.ts` (또는 `package.json` scripts)에 `block-page` 엔트리 추가 여부 확인
- [ ] 각 브랜치 완료 후 `pnpm run dev`로 로컬 동작 확인
