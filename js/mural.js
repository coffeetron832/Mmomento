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

// Elementos del DOM
const bienvenidaEl = document.getElementById('bienvenida');
const aporteForm = document.getElementById('aporteForm');
const textoAporteEl = document.getElementById('textoAporte');
const toggleFormBtn = document.getElementById('toggleFormBtn');
const formContainer = document.getElementById('formContainer');
const misBtn = document.getElementById('toggleMisAportesBtn');
const misPanel = document.getElementById('misAportesPanel');
const misList = document.getElementById('misAportesList');
const lienzo = document.getElementById('lienzo');
const container = document.getElementById('aportesContainer');
const logoutBtn = document.getElementById('logoutBtn');

if (bienvenidaEl) {
  bienvenidaEl.textContent = `👋 Bienvenido, ${username}`;
}

// ——— Manejo de formulario principal ———
aporteForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const texto = textoAporteEl.value.trim();
  if (!esTextoValido(texto)) {
    mostrarError('El aporte no puede estar vacío.');
    return;
  }

  const res = await fetch('https://themural-backend-production.up.railway.app/api/aportes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ texto: sanitize(texto) })
  });

  if (res.ok) {
    textoAporteEl.value = '';
    cargarAportes();
    mostrarExito('Aporte publicado.');
  } else {
    mostrarError('Error publicando el aporte.');
  }
});

// ——— Mostrar/Ocultar formulario ———
toggleFormBtn.addEventListener('click', () => {
  formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
});

// ——— Logout ———
logoutBtn.addEventListener('click', async () => {
  try {
    await fetch('https://themural-backend-production.up.railway.app/api/auth/logout', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  } catch {}
  localStorage.clear();
  window.location.href = 'index.html';
});

// ——— Drag y Zoom del lienzo ———
let isDragging = false, startX = 0, startY = 0;
let offsetX = 0, offsetY = 0;
let zoomLevel = 1, targetZoomLevel = 1;
const zoomStep = 0.1, zoomMin = 0.3, zoomMax = 3;

lienzo.addEventListener('mousedown', e => {
  isDragging = true;
  startX = e.clientX; startY = e.clientY;
  lienzo.style.cursor = 'grabbing';
});
document.addEventListener('mouseup', () => {
  isDragging = false;
  lienzo.style.cursor = 'grab';
});
document.addEventListener('mousemove', e => {
  if (!isDragging) return;
  const dx = e.clientX - startX, dy = e.clientY - startY;
  offsetX += dx; offsetY += dy;
  startX = e.clientX; startY = e.clientY;
  applyTransform();
});
lienzo.addEventListener('wheel', e => {
  e.preventDefault();
  const delta = e.deltaY > 0 ? -zoomStep : zoomStep;
  zoomAtCursor(e, delta);
}, { passive: false });

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
function zoomAtCursor(e, delta) {
  const rect = lienzo.getBoundingClientRect();
  const cx = e.clientX - rect.left, cy = e.clientY - rect.top;
  const prevZoom = targetZoomLevel;
  targetZoomLevel = Math.min(Math.max(targetZoomLevel + delta, zoomMin), zoomMax);
  const factor = targetZoomLevel / prevZoom;
  offsetX = cx - (cx - offsetX) * factor;
  offsetY = cy - (cy - offsetY) * factor;
  animateZoom();
}
window.zoomIn = () => zoomAtCursor({ clientX: lienzo.clientWidth/2, clientY: lienzo.clientHeight/2 }, zoomStep);
window.zoomOut = () => zoomAtCursor({ clientX: lienzo.clientWidth/2, clientY: lienzo.clientHeight/2 }, -zoomStep);

// ——— Panel “Mis aportes” ———
misBtn.addEventListener('click', () => {
  if (misPanel.style.display === 'none' || !misPanel.style.display) {
    cargarMisAportes();
    misPanel.style.display = 'block';
  } else {
    misPanel.style.display = 'none';
  }
});

// ——— Función para cargar aportes y respuestas ———
async function cargarAportes() {
  const res = await fetch('https://themural-backend-production.up.railway.app/api/aportes');
  const data = await res.json();
  container.innerHTML = '';

  data.forEach(aporte => {
    const div = document.createElement('div');
    div.className = 'aporte';

    // Cabecera
    const fecha = new Date(aporte.createdAt).toLocaleString('es-CO', {
      dateStyle: 'medium', timeStyle: 'short'
    });
    div.innerHTML = `
      <div class="autor">${aporte.username}</div>
      <div class="fecha">${fecha}</div>
      <div class="contenido">${sanitize(aporte.texto)}</div>
      <div class="respuestas"></div>
      <form class="form-respuesta" style="display:none; margin-top:8px;">
        <textarea rows="2" placeholder="Responder..." style="width:100%;"></textarea>
        <button type="submit">Enviar respuesta</button>
      </form>
    `;

    // Posición aleatoria
    div.style.left = `${Math.random()*2000}px`;
    div.style.top  = `${Math.random()*2000}px`;

    // Insertar respuestas
    const respuestasEl = div.querySelector('.respuestas');
    aporte.respuestas?.forEach(resp => {
      const rDiv = document.createElement('div');
      rDiv.className = 'respuesta';
      rDiv.style.marginLeft = '1rem';
      rDiv.style.borderLeft = '2px solid #555';
      rDiv.style.paddingLeft = '0.5rem';

      const fechaR = new Date(resp.createdAt).toLocaleString('es-CO', {
        dateStyle: 'short', timeStyle: 'short'
      });
      rDiv.innerHTML = `
        <div class="autor">${resp.username}</div>
        <div class="fecha">${fechaR}</div>
        <div class="contenido">${sanitize(resp.texto)}</div>
        ${resp.username === username
          ? `<button class="editar-respuesta">✏️ Editar</button>
             <button class="borrar-respuesta">🗑️ Eliminar</button>`
          : ''
        }
      `;

      // Editar
      if (resp.username === username) {
        rDiv.querySelector('.editar-respuesta').addEventListener('click', async () => {
          const nuevo = prompt('Editar respuesta:', resp.texto);
          if (!nuevo) return;
          const r = await fetch(
            `https://themural-backend-production.up.railway.app/api/aportes/${aporte._id}/respuestas/${resp._id}`,
            { method:'PUT',
              headers:{
                'Content-Type':'application/json',
                'Authorization':`Bearer ${token}`
              },
              body: JSON.stringify({ texto: sanitize(nuevo) })
            }
          );
          if (r.ok) cargarAportes();
          else alert('Error editando respuesta.');
        });

        rDiv.querySelector('.borrar-respuesta').addEventListener('click', async () => {
          if (!confirm('¿Eliminar esta respuesta?')) return;
          const r = await fetch(
            `https://themural-backend-production.up.railway.app/api/aportes/${aporte._id}/respuestas/${resp._id}`,
            { method:'DELETE', headers:{ 'Authorization':`Bearer ${token}` } }
          );
          if (r.ok) cargarAportes();
          else alert('Error eliminando respuesta.');
        });
      }

      respuestasEl.appendChild(rDiv);
    });

    // Manejo de nuevo formulario de respuesta
    const form = div.querySelector('.form-respuesta');
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const txt = form.querySelector('textarea').value.trim();
      if (!txt) return;
      const r = await fetch(
        `https://themural-backend-production.up.railway.app/api/aportes/${aporte._id}/respuestas`,
        {
          method:'POST',
          headers:{
            'Content-Type':'application/json',
            'Authorization':`Bearer ${token}`
          },
          body:JSON.stringify({ texto: sanitize(txt) })
        }
      );
      if (r.ok) cargarAportes();
      else alert('Error enviando respuesta.');
    });

    // Botón para mostrar/ocultar formulario
    const btn = document.createElement('button');
    btn.textContent = '💬 Responder';
    btn.className = 'btn-responder';
    btn.style.marginTop = '6px';
    btn.addEventListener('click', () => {
      form.style.display = form.style.display === 'none' ? 'block' : 'none';
    });

    div.appendChild(btn);
    container.appendChild(div);
  });
}

// ——— Función para cargar “Mis aportes” con mis respuestas ———
async function cargarMisAportes() {
  const res = await fetch('https://themural-backend-production.up.railway.app/api/aportes');
  const data = await res.json();
  misList.innerHTML = '';

  const tuyos = data.filter(a => a.username === username);
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
      dateStyle: 'short', timeStyle: 'short'
    });
    li.innerHTML = `
      <div><strong>${sanitize(a.texto)}</strong></div>
      <div style="font-size:12px;color:gray;">${fecha}</div>
      <button data-id="${a._id}" style="margin-top:4px;">🗑️ Eliminar aporte</button>
      <div class="respuestasMis" style="margin-top:10px;padding-left:10px;"></div>
    `;

    // Eliminar aporte
    li.querySelector('button').addEventListener('click', async () => {
      if (!confirm('¿Eliminar este aporte?')) return;
      const r = await fetch(
        `https://themural-backend-production.up.railway.app/api/aportes/${a._id}`,
        { method:'DELETE', headers:{ 'Authorization':`Bearer ${token}` } }
      );
      if (r.ok) { cargarMisAportes(); cargarAportes(); }
      else alert('Error eliminando aporte.');
    });

    // Mis respuestas
    const rm = li.querySelector('.respuestasMis');
    a.respuestas
      .filter(r => r.username === username)
      .forEach(resp => {
        const rd = document.createElement('div');
        rd.style.marginTop = '6px';
        rd.style.paddingLeft = '8px';
        rd.style.borderLeft = '2px solid #555';
        rd.style.fontSize = '13px';

        const fr = new Date(resp.createdAt).toLocaleString('es-CO', {
          dateStyle:'short', timeStyle:'short'
        });
        rd.innerHTML = `
          <div><strong>${resp.username}</strong> <span style="color:#aaa;">${fr}</span></div>
          <div>${sanitize(resp.texto)}</div>
          <button class="editar-resp">✏️ Editar respuesta</button>
          <button class="borrar-resp">🗑️ Eliminar respuesta</button>
        `;

        rd.querySelector('.editar-resp').addEventListener('click', async () => {
          const n = prompt('Editar respuesta:', resp.texto);
          if (!n) return;
          const r = await fetch(
            `https://themural-backend-production.up.railway.app/api/aportes/${a._id}/respuestas/${resp._id}`,
            {
              method:'PUT',
              headers:{
                'Content-Type':'application/json',
                'Authorization':`Bearer ${token}`
              },
              body:JSON.stringify({ texto: sanitize(n) })
            }
          );
          if (r.ok) { cargarMisAportes(); cargarAportes(); }
          else alert('Error editando.');
        });

        rd.querySelector('.borrar-resp').addEventListener('click', async () => {
          if (!confirm('¿Eliminar esta respuesta?')) return;
          const r = await fetch(
            `https://themural-backend-production.up.railway.app/api/aportes/${a._id}/respuestas/${resp._id}`,
            { method:'DELETE', headers:{ 'Authorization':`Bearer ${token}` } }
          );
          if (r.ok) { cargarMisAportes(); cargarAportes(); }
          else alert('Error eliminando.');
        });

        rm.appendChild(rd);
      });

    misList.appendChild(li);
  });
}

// ——— Inicialización ———
cargarAportes();
