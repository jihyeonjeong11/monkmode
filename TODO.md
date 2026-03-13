# TODO — Monk Mode Extension

브랜치 단위로 작업을 진행합니다. 각 브랜치는 독립적으로 동작 가능한 단위가 되어야 합니다.

---

## Branch 1: `feat/shared-foundation`

**목표:** 모든 컨텍스트(background, popup, content)가 공유하는 타입·메시지·상수 정의

### `src/shared/types.ts`
- [x] `TimerPhase` enum: `FOCUS | SHORT_BREAK | LONG_BREAK`
- [x] `TimerState` 타입: `phase`, `endTime` (절대 timestamp), `isRunning`, `completedPomodoros`
- [x] `SessionEntry` 타입: `id`, `startedAt` (timestamp), `durationMinutes`, `reflection` (string | null)
- [x] `AppState` 타입: `timer: TimerState`, `blockedSites: string[]`, `isActive: boolean`, `sessions: SessionEntry[]`

### `src/shared/errors.ts`
- [x] `MonkModeError` base class (extends `Error`): `code`, `message`
- [x] `StorageError` — `chrome.storage` 읽기/쓰기 실패
- [x] `AlarmError` — `chrome.alarms` 등록/해제 실패
- [x] `DnrError` — `declarativeNetRequest` 규칙 동기화 실패
- [x] `MessageError` — 메시지 송수신 실패 (unknown sender 등)

### `src/shared/logger.ts`
- [x] 컨텍스트 prefix 상수: `[background]`, `[popup]`, `[content]`, `[block-page]`
- [x] `createLogger(context)` → `{ log, warn, error }` 반환
- [x] 각 컨텍스트 진입점에서 `const logger = createLogger("background")` 식으로 초기화

### `src/shared/constants.ts`
- [x] `ALARM_NAME = "monk-mode-phase-end"`
- [x] `DEFAULT_FOCUS_MINUTES = 240` (4시간), `MIN/MAX_FOCUS_MINUTES = 60/240`
- [x] `DEFAULT_SHORT_BREAK_MINUTES = 30`, `DEFAULT_LONG_BREAK_MINUTES = 60`
- [x] `POMODOROS_UNTIL_LONG_BREAK = 4`

### `src/shared/messages.ts`
- [x] Message union 타입 정의: `START_TIMER` / `PAUSE_TIMER` / `RESET_TIMER` / `SKIP_PHASE` / `GET_STATE` / `ADD_SITE` / `REMOVE_SITE` / `TOGGLE_BLOCKER` / `SAVE_REFLECTION`
- [x] `sendMessage<T>(msg)` 헬퍼 함수

---

## Branch 2: `feat/timer-core`

**목표:** Background 서비스 워커에서 Monk mode 타이머 동작 구현

> ⚠️ 브레이크 타임(SHORT_BREAK, LONG_BREAK)은 현재 구현하지 않음. 타입·상수는 보존.

**의존:** `feat/shared-foundation`

### `src/background/storage.ts`
- [x] `loadState()` — `chrome.storage.local`에서 `AppState` 로드 (기본값 포함)
- [x] `saveState(state)` — `chrome.storage.local.set`으로 저장

### `src/background/timer.ts`
- [x] `IS_TEST` 플래그 — true 시 10초 타이머로 동작
- [x] `startTimer()` — `endTime = Date.now() + duration`, 단일 알람 등록
- [x] `pauseTimer()` — 알람 제거, `isRunning = false`, `endTime = null`
- [x] `resetTimer()` — 알람 제거, `isRunning = false`, `endTime = null`
- [x] `handleAlarm()` — FOCUS 완료 시 `SessionEntry` 저장, 다음 페이즈 알람 등록
- [x] `playSound()` — offscreen document 생성 후 `assets/sounds/alarm.wav` 재생 (5초 후 종료)

### `src/background/index.ts`
- [x] `chrome.runtime.onMessage` 리스너: `START_TIMER`, `PAUSE_TIMER`, `RESET_TIMER`, `GET_STATE`, `OFFSCREEN_DONE`

### `src/background/timer.test.ts`
- [x] `startTimer`, `pauseTimer`, `resetTimer`, `handleAlarm` 테스트 작성 (스텁 기반)

---

## Branch 3: `feat/popup-timer-ui`

**목표:** Popup의 Timer 탭 UI 구현

**의존:** `feat/shared-foundation`

### `src/popup/popup.html`
- [x] 기본 레이아웃: 헤더(`🧘 Monk Mode`), 콘텐츠 영역, 하단 탭 3개
- [x] Timer 탭 구조 마크업

### `src/popup/components/TimerDisplay.ts`
- [x] `seconds | null` → `MM:SS` or `--:--` 렌더링 (함수 구현됨, popup 연결 필요)

### `src/popup/components/PhaseIndicator.ts`
- [x] `FOCUS` 텍스트 표시 (함수 구현됨, popup 연결 필요)

### `src/popup/components/DurationPicker.ts`
- [x] 1h / 2h / 3h / 4h 선택 UI
- [x] 타이머 실행 중엔 비활성화
- [x] 선택값을 `chrome.storage.local`에 저장

### `src/popup/components/TimerControls.ts`
- [x] Start 버튼 / Stop 버튼 전환 (함수 구현됨, popup 연결 필요)
- [x] Stop 클릭 시 확인 문구 입력 UI 표시
- [x] 확인 문구 일치 시에만 `RESET_TIMER` 메시지 전송 (문구: "나는 지금 집중해야 한다")

### CSS
- [x] `--bg`, `--fg`, `--border` CSS 변수 적용 (라이트/다크 모노톤)
- [x] `prefers-color-scheme: dark` 미디어 쿼리

### `src/popup/popup.ts`
- [x] 기존 코드 교체 — 컴포넌트 기반으로 재작성
- [x] `chrome.storage.local.get` 으로 초기 상태 로드
- [x] `chrome.storage.onChanged` 리스너로 실시간 UI 갱신
- [x] 탭 전환 로직 (Timer | Blocklist | Sessions)

---

## Branch 4: `feat/web-blocker`

**목표:** DNR 규칙 기반 사이트 차단 + Blocklist 탭 UI

**의존:** `feat/shared-foundation`, `feat/timer-core`

### `src/background/index.ts` (추가)
- [x] `syncDnrRules(isActive: boolean, blockedSites: string[])` 함수:
  - `isActive === false`: `chrome.declarativeNetRequest.updateDynamicRules`로 기존 규칙 전체 제거
  - `isActive === true`: `blockedSites` 각 항목을 DNR 규칙으로 변환
    - `urlFilter: "||{site}"`, `resourceTypes: ["main_frame"]`
    - `action: { type: "redirect", redirect: { extensionPath: "/block-page.html" } }`
- [x] `TOGGLE_BLOCKER` / `ADD_SITE` / `REMOVE_SITE` 메시지 처리 후 `syncDnrRules` 호출

### `src/popup/components/SiteInput.ts`
- [x] URL 입력 필드 + 추가 버튼
- [x] `https://`, 후행 `/` 제거 정규화
- [x] Enter 키 지원
- [x] `onAdd(site: string)` 콜백

### `src/popup/components/SiteList.ts`
- [x] 차단 목록 렌더링
- [x] 각 항목에 `[✕]` 제거 버튼
- [x] 빈 목록 안내 메시지

---

## Branch 5: `feat/block-page`

**목표:** 차단 시 보여주는 반성 페이지 구현

**의존:** `feat/shared-foundation`

### `src/block-page/index.html`
- [x] UI 스펙대로 레이아웃:
  - `🧘` 아이콘
  - "집중 모드 활성 중" 제목
  - 명상 안내 문구 ("잠깐 멈추고 호흡을 가다듬으세요...")
  - 텍스트 입력 ("왜 이 사이트에 왔나요?")
  - "기록하고 돌아가기" 버튼
- [x] 제출 시:
  - `SessionEntry` 생성 후 `chrome.storage.local`에 append
  - 탭 닫기 (`chrome.tabs.remove`)
- [x] 인라인 `<script>` 또는 별도 `block-page.ts` 빌드 엔트리

---

## Branch 6: `feat/sessions-view`

**목표:** 오늘의 세션 기록 보기

**의존:** `feat/shared-foundation`, `feat/block-page`

### `src/popup/popup.ts` (Sessions 탭 추가)
- [x] `AppState.sessions`에서 오늘 날짜 기준 필터링
- [x] 상단 요약: "오늘 N sessions / Xh Ym"
- [x] 세션 목록 렌더링:
  - 시작 시간 (HH:MM)
  - 지속 시간 (Nm, 소수점 반올림)
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
- [x] `build.ts`에 `src/assets` → `dist/assets` 복사 추가
- [ ] 각 브랜치 완료 후 `pnpm run dev`로 로컬 동작 확인
