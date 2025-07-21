/* mural.js - Simplificado solo para aportes de texto, usando API_BASE_URL */

const API_BASE_URL = 'https://momento-backend-production.up.railway.app'; // Cambia según tu entorno
let usuario;
const aportesMostrados = new Set();

function obtenerUsuarioDesdeToken() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payloadBase64 = token.split('.')[1];
    const payloadDecoded = atob(payloadBase64);
    const payload = JSON.parse(payloadDecoded);
    return payload.username;
  } catch (err) {
    console.error('Error decodificando token:', err);
    return null;
  }
}

function verificarToken() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Debes iniciar sesión para usar el mural.');
    window.location.href = '/index.html';
    return false;
  }
  return true;
}

// Zoom y pan\const mural = document.getElementById('mural');
const muralContainer = document.getElementById('muralContainer');
const zoomInBtn = document.getElementById('zoomIn');
const zoomOutBtn = document.getElementById('zoomOut');
let scale = 1, posX = 0, posY = 0;
let isDragging = false, startX, startY;

function updateTransform() {
  mural.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
}

zoomInBtn?.addEventListener('click', () => {
  scale = Math.min(2, scale + 0.1);
  updateTransform();
});
zoomOutBtn?.addEventListener('click', () => {
  scale = Math.max(0.4, scale - 0.1);
  updateTransform();
});

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
['mouseup', 'mouseleave'].forEach(evt =>
  muralContainer?.addEventListener(evt, () => {
    isDragging = false;
    muralContainer.style.cursor = 'grab';
  })
);

// Agregar nuevo aporte
async function agregarAlMural() {
  if (!verificarToken()) return;

  const contenidoElemento = document.getElementById('contenido');
  const contenido = contenidoElemento.value.trim();
  if (!contenido) {
    alert('Por favor escribe algo antes de compartir.');
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/mural`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ contenido })
    });

    if (response.ok) {
      contenidoElemento.value = '';
      cargarAportes();
    } else {
      const err = await response.json();
      alert(err.message || 'Error al subir el aporte.');
    }
  } catch (error) {
    console.error('Error al subir el aporte:', error);
    alert('Error al subir el aporte.');
  }
}

// Mostrar un aporte
function mostrarAporte({ _id, contenido, usuario: autor }) {
  if (aportesMostrados.has(_id)) return;
  aportesMostrados.add(_id);

  const card = document.createElement('div');
  card.classList.add('mural-item');
  card.id = `aporte-${_id}`;
  card.title = `Aporte de: ${autor}`;

  const { offsetWidth: w, offsetHeight: h } = mural;
  const x = Math.random() * (w - 200);
  const y = Math.random() * (h - 200);
  card.style.left = `${x}px`;
  card.style.top = `${y}px`;
  card.style.setProperty('--rot', `${Math.random() * 10 - 5}deg`);
  card.style.setProperty('--scale', `${0.95 + Math.random() * 0.1}`);

  const p = document.createElement('p');
  p.textContent = contenido;
  card.appendChild(p);

  mural.appendChild(card);
}

// Cargar aportes del día
async function cargarAportes() {
  try {
    mural.innerHTML = '';
    aportesMostrados.clear();

    const res = await fetch(`${API_BASE_URL}/api/mural/today`);
    if (!res.ok) throw new Error(`Error ${res.status}`);

    const datos = await res.json();
    datos.forEach(mostrarAporte);
    mostrarMisAportes(datos);
  } catch (err) {
    console.error('Error al cargar el mural:', err);
  }
}

// Mostrar aportes del usuario
function mostrarMisAportes(datos) {
  const cont = document.getElementById('listaMisAportes');
  if (!cont) return;

  cont.innerHTML = '';
  datos.filter(a => a.usuario === usuario).forEach(a => {
    const div = document.createElement('div');
    div.className = 'aporte-propio';
    div.textContent = a.contenido;
    cont.appendChild(div);
  });
}

// Modal: cerrar y recordar
function cerrarMensaje() {
  const noMostrar = document.getElementById('noMostrarCheckbox').checked;
  if (noMostrar) {
    localStorage.setItem('noMostrarModal', 'true');
  }
  document.getElementById('modalOverlay').style.display = 'none';
}

// Inicialización
window.addEventListener('DOMContentLoaded', () => {
  if (!verificarToken()) return;
  usuario = obtenerUsuarioDesdeToken();
  if (localStorage.getItem('noMostrarModal') === 'true') {
    document.getElementById('modalOverlay').style.display = 'none';
  }
  cargarAportes();
});

// Exponer funciones globales
window.agregarAlMural = agregarAlMural;
window.cerrarMensaje = cerrarMensaje;
