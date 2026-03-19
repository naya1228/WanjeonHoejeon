# findings.md — 개발 기록

## 기술 결정

### iframe 채택 (vs 브라우저 자체 구현)
- JS `fetch()`는 CORS 정책으로 외부 사이트 직접 접근 불가
- 서버사이드 프록시는 GitHub Pages에서 불가
- WASM 브라우저 엔진은 개인 구현 불가 수준의 복잡도
- **결론**: iframe 사용. X-Frame-Options로 막힌 사이트는 "이 사이트는 회전을 거부했다" 메시지로 처리 (컨셉과 맞음)
- Electron `<webview>` 는 데스크탑 앱으로 전환 시 고려 가능

---

## Electron 전환 결정
- GitHub Pages iframe 한계 → Electron `<webview disablewebsecurity>` 로 전환
- webview는 X-Frame-Options / CSP frame-ancestors 완전 우회
- 차단 감지: `iframe.onload` 휴리스틱 → `did-fail-load` 이벤트 (정확)
- 드래그/던지기/회전 로직 전부 재사용

## 미결 사항

- [x] CSS rotate + JS translate 충돌 해결 → CSS Individual Transform Properties
- [x] 드래그/던지기 구현 → velocity + rAF 감쇠
- [x] 회전 멈추기 → animation-play-state 토글 (버튼 + 스페이스바)
- [x] pointer-events: 드래그 중 none, 정지 후 auto
- [x] X-Frame-Options 차단 시 "このサイトは回転を拒否した" 메시지

---

## WARN.md 기반 버그 수정
- **pointer-events 버그**: 로드 직후 드래그 없이 클릭 불가 → `loadSite()`에서 `frame.classList.add('interactive')` 추가
- **중복 핸들러**: `did-start-loading`/`did-finish-load` 동일 코드 → `did-finish-load` 제거, `did-start-loading`만 유지
- **fling 경계 이탈**: 더블클릭으로 중앙 복귀 추가 (`setTranslate(0, 0)`)
- **슬라이더 범위**: `21-value`(1~20s) → `0.5 + (20-value)*0.5`(0.5~10s) — UI.md 명세에 맞게 수정
- **변수명**: `ox/oy/tx/ty/vx/vy` → `originX/Y, translateX/Y, velocityX/Y`
- **CLAUDE.md**: Electron 전환 이후 구조 반영 안 됐던 거 현행화

## 발견 사항

### CSS rotate + JS translate 동시 제어 (다기 확인)
- CSS animation이 `transform` 전체를 덮어써서 충돌 발생
- **해결**: CSS Individual Transform Properties (`rotate`, `translate` 독립 속성) 사용
  - `rotate` → CSS animation 담당
  - `translate` → JS drag 담당
  - 서로 덮어쓰지 않음, compositor 최적화 유지
  - Chrome 104+, 최신 Firefox/Safari 지원 (장난용 사이트이므로 호환성 문제 없음)
- Wrapper 이중 구조 불필요

### 드래그/던지기 구현 방향
- mousedown/touchstart: 드래그 시작, iframe pointer-events 끄기
- mousemove/touchmove: translate 업데이트, 속도(velocity) 계산
- mouseup/touchend: 속도 기반 관성 적용 (rAF + 감쇠), iframe pointer-events 복원

### 회전 제어
- 원할 때 회전 멈추기 가능: `animation-play-state: paused/running` 토글
- 버튼 또는 스페이스바로 제어

