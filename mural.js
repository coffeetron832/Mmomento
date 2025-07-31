const canvas = document.getElementById("canvas");
let isDragging = false;
let prevX = 0;
let prevY = 0;
let offsetX = 0;
let offsetY = 0;

canvas.addEventListener("mousedown", (e) => {
  isDragging = true;
  prevX = e.clientX;
  prevY = e.clientY;
  canvas.style.cursor = "grabbing";
});

window.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  const dx = e.clientX - prevX;
  const dy = e.clientY - prevY;
  offsetX += dx;
  offsetY += dy;

  canvas.style.transform = `translate(${offsetX}px, ${offsetY}px)`;

  prevX = e.clientX;
  prevY = e.clientY;
});

window.addEventListener("mouseup", () => {
  isDragging = false;
  canvas.style.cursor = "grab";
});
