# 完全なる黄金の回転エネルギー
> *The Perfect Golden Rotation Energy* — Steel Ball Run 모티브 장난용 웹사이트

## 개요
URL을 입력하면 해당 사이트를 화면 안에 띄우고, 띄워진 사이트가 끊임없이 **회전**한다.
완전한 회전(완전회전, Wanjeon Hoejeon)을 구현하는 것이 목표.

## 기술 스택
| 분류 | 선택 |
|------|------|
| 런타임 | Electron |
| 언어 | HTML5 + CSS3 + Vanilla JS |
| 회전 | CSS `@keyframes` + Individual Transform Properties |
| 임베딩 | `<webview disablewebsecurity>` |
| 폰트 | Google Fonts (CDN) |

## 실행 방법

### 사전 요구사항
- [Node.js](https://nodejs.org/) 18 이상
- npm

### 설치 및 실행

```bash
# 1. 저장소 클론
git clone https://github.com/naya1228/WanjeonHoejeon.git
cd WanjeonHoejeon

# 2. 의존성 설치
npm install

# 3. 앱 실행
npm start
```

### 배포 빌드 (선택)

```bash
npm run build
# 빌드 결과물은 dist/ 폴더에 생성됨
```

## 사용법
- URL 입력창에 사이트 주소를 입력하면 해당 사이트가 회전하며 표시됨
- **스페이스바**: 회전 일시정지 / 재개
- **드래그**: 화면 안에서 자유롭게 이동
- **더블클릭**: 중앙으로 복귀

## 주의사항
- X-Frame-Options/CSP로 임베딩을 차단하는 사이트(Google, YouTube 등)는 표시되지 않을 수 있음
- Wikipedia, 일부 개인 블로그 등 제한 없는 사이트에서 정상 동작 확인 가능
