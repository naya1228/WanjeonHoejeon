# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요
Steel Ball Run '완전회전(完全なる回転)' 모티브의 장난용 **Electron 데스크탑 앱**.
URL을 입력받아 `<webview>`로 해당 사이트를 임베드하고, CSS 애니메이션으로 회전한다.
드래그로 던지기 가능, 더블클릭으로 중앙 복귀, 스페이스바로 회전 토글.

## 기술 스택 및 빌드
- **Electron** (Node.js + Chromium 내장)
- HTML5 + CSS3 + Vanilla JS. Google Fonts CDN 사용.
- 실행: `npm start`
- 배포 빌드: `npm run build` (electron-builder, `dist/` 출력)

## 아키텍처
```
main.js          ← Electron 메인 프로세스. BrowserWindow 생성 (webviewTag: true)
preload.js       ← contextBridge (platform 노출)
renderer/
  index.html     ← UI 구조. <webview disablewebsecurity> 사용
  style.css      ← CSS 변수, 레이아웃, @keyframes kaiten
  renderer.js    ← 모든 JS 로직
assets/icons/    ← 아이콘 플레이스홀더 (교체 가능)
```

**회전**: `#spin-target`에 `@keyframes kaiten` (CSS `rotate` 속성, `animation-play-state` 토글)
**드래그**: JS가 `dragWrapper.style.translate` 제어 — CSS `rotate`와 충돌 없음 (Individual Transform Properties)
**webview 이벤트**: `did-start-loading` (차단 메시지 초기화) / `did-fail-load` (차단 감지)

## 디자인 기준
UI.md에 레이아웃, 색상 팔레트, 인터랙션 흐름이 정의되어 있음. 변경 시 UI.md도 함께 갱신.

## 알려진 제약
- `<webview disablewebsecurity>`: X-Frame-Options/CSP 우회 목적. 장난용 앱이므로 의도된 설정.
- 아이콘: `assets/icons/icon.png` (512×512), `icon.ico`, `icon.icns` 교체 가능.

## 개발 중 협업 에이전트

제작 과정에서 아래 두 에이전트와 **반드시 지속적으로 상호작용**할 것:

- **다기**: 기술적 사실 확인이 필요할 때 호출. (CSS 스펙, 브라우저 동작, Web API 지원 여부 등 불확실한 정보 검증)
- **패링이**: 설계 결정, 코드 구조, UX 방향을 고민할 때 호출. 답을 주는 게 아니라 질문으로 사고를 유도함.

## 개발 기록
- 제작 중 발견한 사항, 결정 이유, 막힌 문제와 해결책은 `findings.md`에 계속 추적하여 기록.

## 비판 분석
- 패링이가 코드베이스 전체를 분석한 비판 문서는 `WARN.md`에 저장되어 있음. 보안, 아키텍처 불일치, JS 품질, UX 문제 등을 다룸.
