/* mural.js - Simplificado solo para aportes de texto con popovers para formulario y mis aportes */

const API_BASE_URL = 'https://momento-backend-production.up.railway.app'; // Ajusta según tu entorno
let usuario;
const aportesMostrados = new Set();

// ===== Helpers =====
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

// ===== Zoom & Pan =====
const mural = document.getElementById('mural');
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

['mousedown', 'mousemove', 'mouseup', 'mouseleave'].forEach(evt => {
  muralContainer?.addEventListener(evt, e => {
    if (evt === 'mousedown') {
      isDragging = true;
      startX = e.clientX - posX;
      startY = e.clientY - posY;
      muralContainer.style.cursor = 'grabbing';
    } else if (evt === 'mousemove' && isDragging) {
      posX = e.clientX - startX;
      posY = e.clientY - startY;
      updateTransform();
    } else if (evt === 'mouseup' || evt === 'mouseleave') {
      isDragging = false;
      muralContainer.style.cursor = 'grab';
    }
  });
});

// ===== Aportes =====
async function agregarAlMural() {
  if (!verificarToken()) return;
  const contenidoElem = document.getElementById('contenido');
  const contenido = contenidoElem.value.trim();
  if (!contenido) { alert('Por favor escribe algo antes de compartir.'); return; }
  try {
    const res = await fetch(`${API_BASE_URL}/api/mural`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ contenido })
    });
    if (res.ok) {
      contenidoElem.value = '';
      cargarAportes();
    } else {
      const err = await res.json();
      alert(err.message || 'Error al subir el aporte.');
    }
  } catch (err) {
    console.error('Error al subir el aporte:', err);
    alert('Error al subir el aporte.');
  }
}
window.agregarAlMural = agregarAlMural;

function mostrarAporte({ _id, contenido, usuario: autor }) {
  if (aportesMostrados.has(_id)) return;
  aportesMostrados.add(_id);
  const card = document.createElement('div');
  card.className = 'mural-item';
  card.id = `aporte-${_id}`;
  card.title = `Aporte de: ${autor}`;
  const { offsetWidth: w, offsetHeight: h } = mural;
  card.style.left = `${Math.random() * (w - 200)}px`;
  card.style.top = `${Math.random() * (h - 200)}px`;
  card.style.setProperty('--rot', `${Math.random() * 10 - 5}deg`);
  card.style.setProperty('--scale', `${0.95 + Math.random() * 0.1}`);
  const p = document.createElement('p');
  p.textContent = contenido;
  card.appendChild(p);
  mural.appendChild(card);
}

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

// ===== Modal =====
function cerrarMensaje() {
  const noMostrar = document.getElementById('noMostrarCheckbox')?.checked;
  if (noMostrar) localStorage.setItem('noMostrarModal', 'true');
  document.getElementById('modalOverlay').style.display = 'none';
}
window.cerrarMensaje = cerrarMensaje;

// ===== Popovers =====
function togglePopovers() {
  const btnFormulario = document.getElementById('btnFormulario');
  const formPanel = document.querySelector('.formulario');
  const btnMisAportes = document.getElementById('btnMisAportes');
  const misPanel = document.getElementById('misAportes');

  btnFormulario?.addEventListener('click', e => {
    e.stopPropagation();
    formPanel.classList.toggle('mostrar');
    misPanel.classList.remove('mostrar');
  });

  btnMisAportes?.addEventListener('click', e => {
    e.stopPropagation();
    misPanel.classList.toggle('mostrar');
    formPanel.classList.remove('mostrar');
  });

  // Click fuera cierra ambos
  document.addEventListener('click', e => {
    if (!e.target.closest('.formulario') && !e.target.closest('#btnFormulario')) {
      formPanel.classList.remove('mostrar');
    }
    if (!e.target.closest('#misAportes') && !e.target.closest('#btnMisAportes')) {
      misPanel.classList.remove('mostrar');
    }
  });
}

// ===== Init =====
window.addEventListener('DOMContentLoaded', () => {
  if (!verificarToken()) return;
  usuario = obtenerUsuarioDesdeToken();
  if (localStorage.getItem('noMostrarModal') === 'true') {
    document.getElementById('modalOverlay').style.display = 'none';
  }
  cargarAportes();
  togglePopovers();
});
