# WARN.md — 프로젝트 비판 분석 (패링이)

> 패링이(페어 프로그래밍 파트너)가 코드베이스 전체를 분석하고 작성한 비판 문서.

---

## 0. 전반적 평가

장난용 프로젝트치고 코드 품질은 솔직히 나쁘지 않아. 근데 몇 군데 구멍이 있고, 설계 결정에서 "정말 생각한 건지?" 싶은 것들이 있음.

---

## 1. 보안 — 가장 심각한 문제

### `disablewebsecurity` 무방비 노출

```html
<webview id="frame" src="about:blank" allowpopups disablewebsecurity></webview>
```

`disablewebsecurity`는 Same-Origin Policy를 비활성화해. webview 안에서 돌아가는 사이트가 부모 window로 접근을 시도하거나, 악성 사이트를 로드했을 때 CSRF 쿠키 탈취, 내부 네트워크 스캔 같은 공격 표면이 열려.

**질문**: 장난용 앱이라는 게 "보안 안 신경 써도 된다"는 의미야? 아니면 그냥 귀찮아서 켜놓은 거야?

`nodeIntegration: false`, `contextIsolation: true`로 main process는 잘 격리해놨으면서, webview에서 `disablewebsecurity` 켜놓는 건 앞문 잠그고 뒷문 활짝 열어둔 거야.

---

## 2. 아키텍처 — CLAUDE.md와 실제 코드의 불일치

CLAUDE.md에는 이렇게 써 있어:

> "index.html 단일 파일 프로젝트. 빌드/컴파일/번들러 없음."

근데 실제로는 Electron 앱으로 전환되어서 `main.js`, `preload.js`, `renderer/` 구조야. CLAUDE.md는 **지금 코드베이스를 전혀 반영 안 하는** 거짓 문서가 됐어.

**질문**: CLAUDE.md 마지막으로 업데이트한 게 언제야? findings.md에 Electron 전환 결정 기록은 있는데 왜 CLAUDE.md는 안 고쳤어?

---

## 3. 코드 품질 — JS

### 변수명

```js
let ox = 0, oy = 0;
let tx = 0, ty = 0;
let vx = 0, vy = 0;
```

`ox`, `oy`가 offset인지 origin인지 뭔지, 코드 안 읽으면 몰라. `offsetX`, `velocityX`, `translateX`로 썼으면 5줄 더 쓰는 게 아니잖아. 3일 뒤에 본인이 읽어도 한 번 더 생각해야 하는 이름이야.

### `loadSite` 함수 — 상태 관리가 흩어져 있음

```js
function loadSite() {
  ...
  toggleBtn.style.display = '';
  spinTarget.classList.remove('paused');
  toggleBtn.textContent = '回転停止';
  toggleBtn.classList.remove('active');
}
```

버튼 상태를 `loadSite`에서 직접 건드리고 있어. `toggleSpin`에서도 버튼 상태를 건드림. UI 상태 업데이트 로직이 두 군데에 분산되어 있어서 나중에 상태가 꼬이면 어디서 꼬였는지 추적하기 귀찮아.

**질문**: UI 상태를 단일 함수로 모아서 관리하는 방식을 고려해봤어?

### `did-start-loading`과 `did-finish-load` 둘 다 같은 동작

```js
frame.addEventListener('did-start-loading', () => {
  if (frame.src !== 'about:blank') blockedMsg.classList.remove('show');
});
frame.addEventListener('did-finish-load', () => {
  if (frame.src !== 'about:blank') blockedMsg.classList.remove('show');
});
```

두 핸들러가 완전히 동일한 코드야. 왜 두 개야? start-loading 시점에 blocked-msg 숨기는 게 의도적 UX라면 주석이라도 달아야지, 이건 그냥 복붙처럼 보여.

---

## 4. ~~UX — 드래그 던지기 후 경계 없음~~ ✅ 해결됨

fling 정지 시 중심점이 stage 바깥이면 5초 후 자동 중앙 복귀 (0.6s ease-out 트랜지션).
더블클릭 즉시 복귀, 드래그 시 타이머 취소. 해결된 이슈.

---

## 5. ~~UX — 속도 슬라이더 수식~~ ✅ 해결됨

슬라이더 제거, `--speed: 0.05s` 하드코딩으로 전환.
0.05s/rev(초당 20바퀴)는 스트로보 효과로 인해 시각적으로 느려 보이는 의도된 값. 해결된 이슈.

---

## 6. CSS — webview 기본 pointer-events: none

```css
webview {
  pointer-events: none;
}
webview.interactive { pointer-events: auto; }
```

`fling()` 끝날 때만 `interactive` 클래스를 붙이는데, 드래그 없이 그냥 로드만 했을 때는 `interactive` 클래스가 안 붙잖아.

**질문**: URL 로드하고 드래그 한 번도 안 한 상태에서 webview 안쪽 클릭이 되는지 직접 테스트해봤어?

---

## 7. ~~`loadBtn`이 사라지지 않는 것~~ ✅ 해결됨

`toggleBtn` 제거, `loadBtn` 하나로 통합. URL이 바뀌면 로드, 같으면 회전 토글. 해결된 이슈.

---

---

## 2차 스캔 (패링이) — 수정 이후 발견된 이슈

### B1. dblclick + mousedown 충돌 (버그)
더블클릭 이벤트 순서: `mousedown → mouseup → mousedown → mouseup → dblclick`
`dragWrapper`에 `mousedown` 리스너가 있어서 더블클릭 시 `fling()`까지 호출된 뒤에 `returnToCenter()`가 불림. 의도한 동작인지 확인 필요.

### B2. ~~fling velocity 마지막 프레임 의존~~ ✅ 해결됨
100ms 이동 기록 버퍼 기반으로 velocity 계산. 순간 멈칫해도 최근 흐름으로 fling.

### B3. ~~transitionend 리스너 중복 가능성~~ ✅ 해결됨
named function `onReturningEnd`으로 교체 + `removeEventListener` 선행 호출로 중복 차단.

### B4. ~~preload.js `platform` 데드코드~~ ✅ 해결됨
`platform` 제거.

### B5. URL 변경 시 강제 회전 재개 (UX)
`handleBtn()`에서 URL이 바뀌면 항상 `spinTarget.classList.remove('paused')`. 정지 상태에서 URL만 바꾸고 싶어도 자동으로 회전 재개됨.

### B6. `disablewebsecurity` 목적 재확인 필요
X-Frame-Options는 서버측 응답 헤더라 클라이언트 보안 설정으로 우회 불가. `disablewebsecurity`가 실제로 필요한 이유 재검토 필요.

### B7. `--speed` 변수 제어 UI 없음
CSS custom property로 선언해놨는데 JS에서 동적으로 제어하는 UI가 없음. 의도적 결정이면 변수 대신 값을 직접 써도 됨.

---

## 총평

| 영역 | 평가 |
|------|------|
| 보안 | `disablewebsecurity` — 의식하고 켠 거면 주석이라도, 아니면 범위 검토 필요 |
| 문서 | CLAUDE.md가 현재 코드와 불일치. 거짓 문서 |
| ~~JS 품질~~ | ~~변수명 짧음~~ ✅ / ~~중복 핸들러~~ ✅ / 상태 관리 분산 (minor, 미해결) |
| ~~UX~~ | ~~경계 없는 fling~~ → 5초 후 자동 복귀 ✅ / ~~pointer-events none~~ → loadSite에서 즉시 추가 ✅ |
| ~~CSS/명세~~ | ~~슬라이더 범위 불일치~~ → 슬라이더 제거, 0.05s 하드코딩 (스트로보 효과 의도) ✅ |
| 전체 구조 | Electron 전환 이후 기반은 잘 잡혀 있음 |
