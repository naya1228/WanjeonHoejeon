const urlInput   = document.getElementById('url-input');
const loadBtn    = document.getElementById('load-btn');
const dragWrapper= document.getElementById('drag-wrapper');
const spinX      = document.getElementById('spin-x');
const spinY      = document.getElementById('spin-y');
const spinTarget = document.getElementById('spin-target');
const frame      = document.getElementById('frame');
const blockedMsg = document.getElementById('blocked-msg');
const stage      = document.getElementById('stage');

let loadedUrl = ''; // 현재 로드된 URL 추적
let isPaused = false;

// ── webview 이벤트 ──
// did-start-loading에서 차단 메시지를 즉시 숨겨 로드 중 깜빡임 방지
frame.addEventListener('did-start-loading', () => {
  if (frame.src !== 'about:blank') blockedMsg.classList.remove('show');
});

frame.addEventListener('did-fail-load', ({ errorCode, validatedURL }) => {
  // -3: ABORTED (리다이렉트 중간 단계), about:blank는 무시
  if (errorCode === -3 || validatedURL === 'about:blank') return;
  blockedMsg.classList.add('show');
});

// ── 버튼 & Enter: URL이 바뀌면 로드, 같으면 토글 ──
loadBtn.addEventListener('click', handleBtn);
urlInput.addEventListener('keydown', e => { if (e.key === 'Enter') handleBtn(); });
document.addEventListener('keydown', e => {
  if (e.code === 'Space' && e.target === document.body) { e.preventDefault(); if (loadedUrl) toggleSpin(); }
});

function handleBtn() {
  let url = urlInput.value.trim();
  if (!url) return;
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

  if (url !== loadedUrl) {
    // 새 URL 로드
    loadedUrl = url;
    frame.src = url;
    frame.classList.add('interactive');
    isPaused = false;
    spinX.classList.remove('paused');
    spinY.classList.remove('paused');
    spinTarget.classList.remove('paused');
    dragWrapper.classList.add('square');
    loadBtn.textContent = '회전 정지';
    loadBtn.classList.remove('active');
  } else {
    toggleSpin();
  }
}

function toggleSpin() {
  isPaused = !isPaused;

  if (isPaused) {
    // 현재 위치에서 freeze → 다음 프레임에 animation 제거 + 0으로 트랜지션
    [spinX, spinY, spinTarget].forEach(el => el.style.animationPlayState = 'paused');
    requestAnimationFrame(() => {
      [spinX, spinY, spinTarget].forEach(el => {
        el.style.animationPlayState = '';
        el.classList.add('paused');
      });
      dragWrapper.classList.remove('square');
    });
  } else {
    [spinX, spinY, spinTarget].forEach(el => el.classList.remove('paused'));
    dragWrapper.classList.add('square');
  }

  loadBtn.textContent = isPaused ? '회전 재개' : '회전 정지';
  loadBtn.classList.toggle('active', isPaused);
}

// ── 드래그 & 던지기 ──
let dragging = false;
let originX = 0, originY = 0;   // 드래그 시작 시 기준점
let translateX = 0, translateY = 0; // 현재 위치 오프셋
let velocityX = 0, velocityY = 0;
let moveHistory = [];            // 최근 이동 기록 (timestamp 기반 velocity 계산용)
let rafId = null;
let returnTimeoutId = null;

function setTranslate(x, y) {
  translateX = x; translateY = y;
  dragWrapper.style.translate = `calc(-50% + ${x}px) calc(-50% + ${y}px)`;
}

function onReturningEnd() { dragWrapper.classList.remove('returning'); }

function returnToCenter() {
  cancelAnimationFrame(rafId);
  velocityX = velocityY = 0;
  dragWrapper.removeEventListener('transitionend', onReturningEnd);
  dragWrapper.classList.add('returning');
  setTranslate(0, 0);
  frame.classList.add('interactive');
  dragWrapper.addEventListener('transitionend', onReturningEnd, { once: true });
}

function checkOutOfBounds() {
  const halfW = stage.clientWidth / 2;
  const halfH = stage.clientHeight / 2;
  if (Math.abs(translateX) > halfW || Math.abs(translateY) > halfH) {
    returnTimeoutId = setTimeout(returnToCenter, 5000);
  }
}

// 더블클릭으로 즉시 중앙 복귀
dragWrapper.addEventListener('dblclick', () => {
  clearTimeout(returnTimeoutId);
  returnToCenter();
});

function pointerDown(e) {
  if (e.button !== undefined && e.button !== 0) return;
  clearTimeout(returnTimeoutId);
  dragging = true;
  cancelAnimationFrame(rafId);
  velocityX = velocityY = 0;
  moveHistory = [];

  const p = e.touches ? e.touches[0] : e;
  originX = p.clientX - translateX;
  originY = p.clientY - translateY;

  frame.classList.remove('interactive');
  e.preventDefault();
}

function pointerMove(e) {
  if (!dragging) return;
  const p = e.touches ? e.touches[0] : e;
  const now = performance.now();
  moveHistory.push({ x: p.clientX, y: p.clientY, t: now });
  // 100ms 이상 된 기록 제거
  while (moveHistory.length > 1 && now - moveHistory[0].t > 100) moveHistory.shift();
  setTranslate(p.clientX - originX, p.clientY - originY);
}

function pointerUp() {
  if (!dragging) return;
  dragging = false;
  // 최근 이동 기록으로 velocity 계산 (16ms 기준 정규화)
  if (moveHistory.length >= 2) {
    const newest = moveHistory[moveHistory.length - 1];
    const oldest = moveHistory[0];
    const dt = newest.t - oldest.t;
    if (dt > 0) {
      velocityX = (newest.x - oldest.x) / dt * 16;
      velocityY = (newest.y - oldest.y) / dt * 16;
    }
  }
  fling();
}

function fling() {
  const friction = 0.92;
  const minVelocity = 0.3;

  function step() {
    if (Math.abs(velocityX) < minVelocity && Math.abs(velocityY) < minVelocity) {
      frame.classList.add('interactive');
      checkOutOfBounds();
      return;
    }
    velocityX *= friction;
    velocityY *= friction;
    setTranslate(translateX + velocityX, translateY + velocityY);
    rafId = requestAnimationFrame(step);
  }
  rafId = requestAnimationFrame(step);
}

dragWrapper.addEventListener('mousedown',  pointerDown);
window.addEventListener('mousemove',  pointerMove);
window.addEventListener('mouseup',    pointerUp);
dragWrapper.addEventListener('touchstart', pointerDown, { passive: false });
window.addEventListener('touchmove',  pointerMove, { passive: false });
window.addEventListener('touchend',   pointerUp);
