// mural-doodle.js

const canvas = document.getElementById('canvasDoodle');
const ctx = canvas?.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const tipoSelect = document.getElementById('tipo');
const doodleControls = document.getElementById('doodleControls');

let drawing = false;

// Ajustar tamaño del canvas
canvas.width = 600;
canvas.height = 400;

// Cambiar color del trazo
colorPicker?.addEventListener('input', () => {
  ctx.strokeStyle = colorPicker.value;
});

// Mostrar controles solo si se elige "doodle"
tipoSelect?.addEventListener('change', () => {
  if (tipoSelect.value === 'doodle') {
    doodleControls.classList.remove('hidden');
  } else {
    doodleControls.classList.add('hidden');
  }
});

// Iniciar dibujo
canvas?.addEventListener('mousedown', (e) => {
  drawing = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
});

// Dibujar mientras se mueve el mouse
canvas?.addEventListener('mousemove', (e) => {
  if (!drawing) return;
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
});

// Finalizar dibujo
canvas?.addEventListener('mouseup', () => {
  drawing = false;
});

canvas?.addEventListener('mouseleave', () => {
  drawing = false;
});
