import {
  sanitize,
  formatearFecha,
  esTextoValido,
  mostrarError,
  mostrarExito
} from './utils.js';



const username = localStorage.getItem('username');
const token = localStorage.getItem('userToken');

if (!token || !username) {
  window.location.href = 'index.html';
}

const bienvenidaEl = document.getElementById('bienvenida');
if (bienvenidaEl && username) {
  bienvenidaEl.textContent = `👋 Bienvenido, ${username}`;
}


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
async function cargarMisAportes() {
  const res = await fetch('https://themural-backend-production.up.railway.app/api/aportes');
  const data = await res.json();

  const tuyos = data.filter(a => a.username === username);
  misList.innerHTML = '';

  if (tuyos.length === 0) {
    misList.innerHTML = '<li>No tienes aportes.</li>';
    return;
  }

  tuyos.forEach(a => {
    const li = document.createElement('li');
    li.style.marginBottom = '12px';
    li.style.borderBottom = '1px solid #333';
    li.style.paddingBottom = '8px';

    const fecha = new Date(a.createdAt).toLocaleString('es-CO', {
      dateStyle: 'short',
      timeStyle: 'short'
    });

    li.innerHTML = `
      <div><strong>${a.texto}</strong></div>
      <div style="font-size: 12px; color: gray;">${fecha}</div>
      <button data-id="${a._id}" title="Eliminar" style="margin-top:4px;">🗑️ Eliminar</button>
      <div class="respuestasMis" style="margin-top: 10px; padding-left: 10px;"></div>
    `;

    li.querySelector('button').addEventListener('click', async (e) => {
      const id = e.currentTarget.dataset.id;
      if (!confirm('¿Eliminar este aporte?')) return;
      const delRes = await fetch(`https://themural-backend-production.up.railway.app/api/aportes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (delRes.ok) {
        cargarMisAportes();
        cargarAportes();
      } else {
        alert('No se pudo eliminar.');
      }
    });

    const respuestasMisDiv = li.querySelector('.respuestasMis');

    if (a.respuestas && a.respuestas.length > 0) {
      a.respuestas
        .filter(r => r.username === username)
        .forEach(respuesta => {
          const r = document.createElement('div');
          r.style.marginTop = '6px';
          r.style.paddingLeft = '8px';
          r.style.borderLeft = '2px solid #555';
          r.style.fontSize = '13px';

          const rFecha = new Date(respuesta.createdAt).toLocaleString('es-CO', {
            dateStyle: 'short',
            timeStyle: 'short'
          });

          r.innerHTML = `
            <div><strong>${respuesta.username}</strong> <span style="color:#aaa;">${rFecha}</span></div>
            <div class="texto-respuesta">${respuesta.texto}</div>
            <button class="btnEditarRespuesta">✏️ Editar</button>
            <button class="btnEliminarRespuesta">🗑️ Eliminar</button>
          `;

          const btnEditar = r.querySelector('.btnEditarRespuesta');
          const btnEliminar = r.querySelector('.btnEliminarRespuesta');

          btnEditar.addEventListener('click', () => {
            const nuevoTexto = prompt('Editar respuesta:', respuesta.texto);
            if (!nuevoTexto) return;
            fetch(`https://themural-backend-production.up.railway.app/api/aportes/${a._id}/respuestas/${respuesta._id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ texto: nuevoTexto })
            }).then(r => {
              if (r.ok) {
                cargarMisAportes();
                cargarAportes();
              } else {
                alert('Error editando respuesta.');
              }
            });
          });

          btnEliminar.addEventListener('click', () => {
            if (!confirm('¿Eliminar esta respuesta?')) return;
            fetch(`https://themural-backend-production.up.railway.app/api/aportes/${a._id}/respuestas/${respuesta._id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
            }).then(r => {
              if (r.ok) {
                cargarMisAportes();
                cargarAportes();
              } else {
                alert('Error eliminando respuesta.');
              }
            });
          });

          respuestasMisDiv.appendChild(r);
        });
    }

    misList.appendChild(li);
  });
}



        // Botón para mostrar formulario de respuesta
const form = div.querySelector('.form-respuesta');
const btnResponder = document.createElement('button');
btnResponder.textContent = '💬 Responder';
btnResponder.className = 'btn-responder';
btnResponder.style.marginTop = '6px';

btnResponder.addEventListener('click', () => {
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const textarea = form.querySelector('textarea');
  const texto = textarea.value.trim();
  if (!texto) return;

  const res = await fetch(`https://themural-backend-production.up.railway.app/api/aportes/${aporte._id}/respuestas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ texto })
  });

  if (res.ok) {
    textarea.value = '';
    form.style.display = 'none';
    cargarAportes();
    cargarMisAportes(); // actualizar también el panel
  } else {
    alert('Error enviando respuesta.');
  }
});

div.appendChild(btnResponder);
container.appendChild(div);


cargarAportes();

// Logout
async function logout() {
  const token = localStorage.getItem('token'); // ✅ Trae el token desde localStorage

  if (!token) {
    console.warn('⚠️ No hay token, ya estás desconectado');
    localStorage.clear();
    window.location.href = 'index.html';
    return;
  }

  try {
    await fetch('https://themural-backend-production.up.railway.app/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  } catch (err) {
    console.error('❌ Error al cerrar sesión:', err);
  }

  localStorage.clear();
  window.location.href = 'index.html';
}

window.logout = logout;


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

  startX = e.clientX;
  startY = e.clientY;

  applyTransform();
});

// ZOOM
let zoomLevel = 1;
let targetZoomLevel = 1;
const zoomStep = 0.1;
const zoomMin = 0.3;
const zoomMax = 3;

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

// Calcula y ajusta el zoom centrado en el cursor
function zoomAtCursor(e, delta) {
  const rect = lienzo.getBoundingClientRect();
  const cursorX = e.clientX - rect.left;
  const cursorY = e.clientY - rect.top;

  const prevZoom = targetZoomLevel;
  targetZoomLevel = Math.min(Math.max(targetZoomLevel + delta, zoomMin), zoomMax);

  // Calcular factor de cambio
  const zoomFactor = targetZoomLevel / prevZoom;

  // Ajustar offset para que el punto bajo el cursor se mantenga estable
  offsetX = cursorX - (cursorX - offsetX) * zoomFactor;
  offsetY = cursorY - (cursorY - offsetY) * zoomFactor;

  applyZoomSmooth();
}

// Zoom con la rueda del mouse
lienzo.addEventListener('wheel', (e) => {
  e.preventDefault();
  const delta = e.deltaY > 0 ? -zoomStep : zoomStep;
  zoomAtCursor(e, delta);
}, { passive: false });

// Botones de zoom (centrado en el centro del lienzo)
function zoomIn() {
  const center = {
    clientX: lienzo.clientWidth / 2,
    clientY: lienzo.clientHeight / 2
  };
  zoomAtCursor(center, zoomStep);
}

function zoomOut() {
  const center = {
    clientX: lienzo.clientWidth / 2,
    clientY: lienzo.clientHeight / 2
  };
  zoomAtCursor(center, -zoomStep);
}


// Mostrar/Ocultar formulario de aportes
const toggleBtn = document.getElementById('toggleFormBtn');
const formContainer = document.getElementById('formContainer');

toggleBtn.addEventListener('click', () => {
  formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
});

// --- Mis aportes ---

const misBtn = document.getElementById('toggleMisAportesBtn');
const misPanel = document.getElementById('misAportesPanel');
const misList = document.getElementById('misAportesList');

misBtn.addEventListener('click', () => {
  if (misPanel.style.display === 'none' || !misPanel.style.display) {
    cargarMisAportes();
    misPanel.style.display = 'block';
  } else {
    misPanel.style.display = 'none';
  }
});



