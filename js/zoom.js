let scale = 1, posX = 0, posY = 0, isDragging = false, startX = 0, startY = 0;
let isPinching = false, initialDistance = null, initialScale = scale;

export function setupZoom() {
  const mural = document.getElementById('mural');
  const muralContainer = document.getElementById('muralContainer');
  const zoomInBtn = document.getElementById('zoomIn');
  const zoomOutBtn = document.getElementById('zoomOut');

  function updateTransform() {
    mural.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
  }

  zoomInBtn.addEventListener('click', () => {
    scale = Math.min(2, scale + 0.1);
    updateTransform();
  });

  zoomOutBtn.addEventListener('click', () => {
    scale = Math.max(0.4, scale - 0.1);
    updateTransform();
  });

  muralContainer.addEventListener('mousedown', e => {
    isDragging = true;
    startX = e.clientX - posX;
    startY = e.clientY - posY;
    muralContainer.style.cursor = 'grabbing';
  });

  muralContainer.addEventListener('mousemove', e => {
    if (!isDragging) return;
    posX = e.clientX - startX;
    posY = e.clientY - startY;
    updateTransform();
  });

  muralContainer.addEventListener('mouseup', () => {
    isDragging = false;
    muralContainer.style.cursor = 'grab';
  });

  muralContainer.addEventListener('mouseleave', () => {
    isDragging = false;
    muralContainer.style.cursor = 'grab';
  });

  muralContainer.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
      isDragging = true;
      const touch = e.touches[0];
      startX = touch.clientX - posX;
      startY = touch.clientY - posY;
    } else if (e.touches.length === 2) {
      isDragging = false;
      isPinching = true;
      initialDistance = getDistance(e.touches[0], e.touches[1]);
      initialScale = scale;
    }
  }, { passive: false });

  muralContainer.addEventListener('touchmove', e => {
    if (isDragging && e.touches.length === 1) {
      const touch = e.touches[0];
      posX = touch.clientX - startX;
      posY = touch.clientY - startY;
      updateTransform();
    } else if (isPinching && e.touches.length === 2) {
      e.preventDefault();
      const newDistance = getDistance(e.touches[0], e.touches[1]);
      const scaleChange = newDistance / initialDistance;
      scale = Math.min(2, Math.max(0.4, initialScale * scaleChange));
      updateTransform();
    }
  }, { passive: false });

  muralContainer.addEventListener('touchend', () => {
    isDragging = false;
    isPinching = false;
  });

  function getDistance(touch1, touch2) {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
