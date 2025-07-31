// muralCanvas.js

let container, lienzo;
let isDragging = false;
let startX, startY;
let offsetX = 0;
let offsetY = 0;

let zoomLevel = 1;
let targetZoomLevel = 1;
const zoomStep = 0.1;
const zoomMin = 0.3;
const zoomMax = 3;

export function setupLienzo() {
  lienzo = document.getElementById('lienzo');
  container = document.getElementById('aportesContainer');

  // Movimiento con mouse
  lienzo.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    lienzo.style.cursor = 'grabbing';
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    lienzo.style.cursor = 'grab';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    offsetX += dx;
    offsetY += dy;
    startX = e.clientX;
    startY = e.clientY;

    applyTransform();
  });

  // Zoom con rueda del mouse
  lienzo.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -zoomStep : zoomStep;
    zoomAtCursor(e, delta);
  }, { passive: false });

  // Touch: arrastrar con el dedo
  lienzo.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    isDragging = true;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  });

  lienzo.addEventListener('touchmove', (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;

    offsetX += dx;
    offsetY += dy;
    startX = touch.clientX;
    startY = touch.clientY;

    applyTransform();
  }, { passive: false });

  lienzo.addEventListener('touchend', () => {
    isDragging = false;
  });

  // Exponer botones globalmente
  window.zoomIn = () => {
    const center = {
      clientX: lienzo.clientWidth / 2,
      clientY: lienzo.clientHeight / 2
    };
    zoomAtCursor(center, zoomStep);
  };

  window.zoomOut = () => {
    const center = {
      clientX: lienzo.clientWidth / 2,
      clientY: lienzo.clientHeight / 2
    };
    zoomAtCursor(center, -zoomStep);
  };
}

function applyTransform() {
  container.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${zoomLevel})`;
  container.style.transformOrigin = 'top left';
}

function animateZoom() {
  if (Math.abs(zoomLevel - targetZoomLevel) < 0.001) {
    zoomLevel = targetZoomLevel;
    applyTransform();
    return;
  }

  zoomLevel += (targetZoomLevel - zoomLevel) * 0.1;
  applyTransform();
  requestAnimationFrame(animateZoom);
}

function applyZoomSmooth() {
  requestAnimationFrame(animateZoom);
}

function zoomAtCursor(e, delta) {
  const rect = lienzo.getBoundingClientRect();
  const cursorX = e.clientX - rect.left;
  const cursorY = e.clientY - rect.top;

  const prevZoom = targetZoomLevel;
  targetZoomLevel = Math.min(Math.max(targetZoomLevel + delta, zoomMin), zoomMax);

  const zoomFactor = targetZoomLevel / prevZoom;

  offsetX = cursorX - (cursorX - offsetX) * zoomFactor;
  offsetY = cursorY - (cursorY - offsetY) * zoomFactor;

  applyZoomSmooth();
}
