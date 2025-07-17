const canvas = document.getElementById('canvasDoodle');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const doodleControls = document.getElementById('doodleControls');

let drawing = false;

canvas.addEventListener('mousedown', e => {
  drawing = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
});

canvas.addEventListener('mousemove', e => {
  if (!drawing) return;
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.strokeStyle = colorPicker.value;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.stroke();
});

canvas.addEventListener('mouseup', () => {
  drawing = false;
});

canvas.addEventListener('mouseleave', () => {
  drawing = false;
});

function limpiarCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
