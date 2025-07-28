const username = localStorage.getItem('username');
const token = localStorage.getItem('userToken');

if (!token || !username) {
  window.location.href = 'index.html';
}

document.getElementById('username').textContent = username;

// Manejar envío del formulario
document.getElementById('aporteForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const texto = document.getElementById('textoAporte').value;

  const res = await fetch('https://themural-backend-production.up.railway.app/api/aportes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ texto })
  });

  if (res.ok) {
    document.getElementById('textoAporte').value = '';
    cargarAportes();
  } else {
    alert('Error publicando el aporte.');
  }
});


// Cargar aportes
async function cargarAportes() {
  const res = await fetch('https://themural-backend-production.up.railway.app/api/aportes');
  const data = await res.json();

  const container = document.getElementById('aportesContainer');
  container.innerHTML = '';

  data.forEach(aporte => {
  const div = document.createElement('div');
  div.className = 'aporte';

  const fecha = new Date(aporte.createdAt).toLocaleString('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  div.innerHTML = `
    <div class="autor">${aporte.username}</div>
    <div class="fecha">${fecha}</div>
    <div class="contenido">${aporte.texto}</div>
  `;

  // Posición aleatoria dentro del lienzo
  const x = Math.floor(Math.random() * 2000);
  const y = Math.floor(Math.random() * 2000);
  div.style.left = `${x}px`;
  div.style.top = `${y}px`;

  container.appendChild(div);
});

}

cargarAportes();

// Logout
async function logout() {
  await fetch('https://themural-backend-production.up.railway.app/api/auth/logout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  localStorage.clear();
  window.location.href = 'index.html';
}


const lienzo = document.getElementById('lienzo');
const container = document.getElementById('aportesContainer');

let isDragging = false;
let startX, startY;

// Posición inicial
let offsetX = 0;
let offsetY = 0;

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

  container.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${zoomLevel})`;
  startX = e.clientX;
  startY = e.clientY;
});

let zoomLevel = 1;
const zoomStep = 0.1;

lienzo.addEventListener('wheel', (e) => {
  e.preventDefault(); // Bloquea el scroll del body

  if (e.deltaY > 0) {
    zoomLevel = Math.max(zoomLevel - zoomStep, 0.3);
  } else {
    zoomLevel = Math.min(zoomLevel + zoomStep, 3);
  }

  applyZoom();
}, { passive: false });

function applyZoom() {
  container.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${zoomLevel})`;
  container.style.transformOrigin = 'top left';
}

// Botones de zoom
function zoomIn() {
  zoomLevel = Math.min(zoomLevel + zoomStep, 3);
  applyZoom();
}

function zoomOut() {
  zoomLevel = Math.max(zoomLevel - zoomStep, 0.3);
  applyZoom();
}
