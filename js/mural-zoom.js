// mural-zoom.js

// Referencias a elementos del DOM
const mural = document.getElementById('mural');
const muralContainer = document.getElementById('muralContainer');
const zoomInBtn = document.getElementById('zoomIn');
const zoomOutBtn = document.getElementById('zoomOut');

// Variables de transformación
let scale = 1;
let posX = 0;
let posY = 0;
let isDragging = false;
let startX = 0;
let startY = 0;

// Función para aplicar transformación al mural
function updateTransform() {
  mural.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
}

// Eventos de zoom
zoomInBtn?.addEventListener('click', () => {
  scale = Math.min(2, scale + 0.1);
  updateTransform();
});

zoomOutBtn?.addEventListener('click', () => {
  scale = Math.max(0.4, scale - 0.1);
  updateTransform();
});

// Eventos de arrastre
muralContainer?.addEventListener('mousedown', e => {
  isDragging = true;
  startX = e.clientX - posX;
  startY = e.clientY - posY;
  muralContainer.style.cursor = 'grabbing';
});

muralContainer?.addEventListener('mousemove', e => {
  if (!isDragging) return;
  posX = e.clientX - startX;
  posY = e.clientY - startY;
  updateTransform();
});

muralContainer?.addEventListener('mouseup', () => {
  isDragging = false;
  muralContainer.style.cursor = 'grab';
});

muralContainer?.addEventListener('mouseleave', () => {
  isDragging = false;
  muralContainer.style.cursor = 'grab';
});
