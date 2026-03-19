# 完全なる黄金の回転エネルギー
> *The Perfect Golden Rotation Energy* — Steel Ball Run 모티브 장난용 웹사이트

## 개요
URL을 입력하면 해당 사이트를 화면 안에 띄우고, 띄워진 사이트가 끊임없이 **회전**한다.
완전한 회전(완전회전, Wanjeon Hoejeon)을 구현하는 것이 목표.

## 기술 스택
| 분류 | 선택 | 이유 |
|------|------|------|
| 언어 | HTML5 + CSS3 + Vanilla JS | 빌드 없이 GitHub Pages 직배포 가능 |
| 회전 | CSS `animation` + `transform: rotate()` | 서버 없이 브라우저에서 처리 |
| 임베딩 | `<iframe>` | 외부 사이트 인라인 렌더링 |
| 폰트 | Google Fonts (CDN) | 별도 설치 없음 |
| 호스팅 | GitHub Pages | 정적 파일 무료 호스팅 |

## 주의사항
- **X-Frame-Options** : 많은 사이트(Google, YouTube 등)는 iframe 임베딩을 차단한다.
  Wikipedia, 일부 개인 블로그 등 제한 없는 사이트에서 동작 확인 가능.
- 회전 중에도 iframe 내부 스크롤/클릭 인터랙션은 유지된다.

## 배포
`index.html` 한 파일로 구성. GitHub Pages의 `main` 브랜치 루트를 소스로 설정하면 즉시 배포된다.
