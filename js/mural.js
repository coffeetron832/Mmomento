/* mural.js - Simplificado para aportes de texto con respuestas y cierre de hilos */
const API_BASE_URL = 'https://themural-backend-production.up.railway.app';
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


async function cargarMisAportes() {
  const contenedor = document.getElementById('mis-aportes');
  contenedor.innerHTML = '<p>Cargando tus aportes...</p>';

  try {
    const res = await fetch(`${API_BASE_URL}/api/mural/mios`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });

    const aportes = await res.json();
    contenedor.innerHTML = '';

    if (!aportes.length) {
      contenedor.innerHTML = '<p>No has hecho ningún aporte aún.</p>';
      return;
    }

    aportes.forEach(aporte => {
      const d = document.createElement('div');
      d.classList.add('aporte-mio');
      d.innerHTML = `
        <div class="contenido-aporte">
          <p>${aporte.contenido}</p>
          <small>${new Date(aporte.createdAt).toLocaleString()}</small>
        </div>
        <button class="btn-eliminar-aporte" data-id="${aporte._id}">🗑️ Eliminar</button>
      `;
      contenedor.appendChild(d);
    });

    // Agregar listeners a los botones de eliminar
    contenedor.querySelectorAll('.btn-eliminar-aporte').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const confirmar = confirm('¿Seguro que deseas eliminar este aporte?');
        if (!confirmar) return;

        try {
          const res = await fetch(`${API_BASE_URL}/api/mural/cerrar/${id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });

          const data = await res.json();
          if (res.ok) {
            btn.parentElement.remove();
            alert('Aporte eliminado con éxito.');
          } else {
            alert(data.message || 'Error al eliminar el aporte.');
          }
        } catch (err) {
          console.error('❌ Error al eliminar aporte:', err);
          alert('Ocurrió un error al eliminar el aporte.');
        }
      });
    });

  } catch (error) {
    console.error('❌ Error al cargar mis aportes:', error);
    contenedor.innerHTML = '<p>Error al cargar tus aportes.</p>';
  }
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

zoomInBtn?.addEventListener('click', () => { scale = Math.min(2, scale + 0.1); updateTransform(); });
zoomOutBtn?.addEventListener('click', () => { scale = Math.max(0.4, scale - 0.1); updateTransform(); });

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
    } else if (['mouseup','mouseleave'].includes(evt)) {
      isDragging = false;
      muralContainer.style.cursor = 'grab';
    }
  });
});


// ===== Modal de respuestas por aporte =====
function mostrarModalRespuestas(aporteId, respuestas) {
  const modal = document.getElementById('modalRespuestas');
  const contenedor = document.getElementById('modalContenido');
  contenedor.innerHTML = '';

  if (respuestas.length === 0) {
    contenedor.innerHTML = '<p>No hay respuestas aún.</p>';
  } else {
    respuestas.forEach(r => {
      const d = document.createElement('div');
      d.className = 'comentario-modal';
      d.innerHTML = `<strong>${r.autor}</strong>: ${r.contenido}`;
      contenedor.appendChild(d);
    });
  }

  // quita la clase hidden para mostrarlo
  modal.classList.remove('hidden');
}
window.mostrarModalRespuestas = mostrarModalRespuestas;


// ===== Aportes =====
async function agregarAlMural() {
  if (!verificarToken()) return;
  const contenidoElem = document.getElementById('contenido');
  const contenido = contenidoElem.value.trim();
  if (!contenido) { alert('Por favor escribe algo antes de compartir.'); return; }
  try {
    const res = await fetch(`${API_BASE_URL}/api/mural`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ contenido })
    });
    if (res.ok) { contenidoElem.value = ''; cargarAportes(); }
    else { const err = await res.json(); alert(err.message || 'Error al subir el aporte.'); }
  } catch (err) { console.error('Error al subir el aporte:', err); alert('Error al subir el aporte.'); }
}
window.agregarAlMural = agregarAlMural;

// ===== Mostrar Aporte con acciones =====
function mostrarAporte({ _id, contenido, usuario: autor, respuestas = [] }) {
  if (aportesMostrados.has(_id)) return;
  aportesMostrados.add(_id);
  const esAutor = autor === usuario;

  const card = document.createElement('div');
  card.className = 'mural-item';
  card.id = `aporte-${_id}`;
  card.title = `Aporte de: ${autor}`;

  // Posición aleatoria
  const { offsetWidth: w, offsetHeight: h } = mural;
  card.style.left = `${Math.random() * (w - 200)}px`;
  card.style.top = `${Math.random() * (h - 200)}px`;
  card.style.setProperty('--rot', `${Math.random() * 10 - 5}deg`);
  card.style.setProperty('--scale', `${0.95 + Math.random() * 0.1}`);

  // Contenido
  const p = document.createElement('p');
  p.textContent = contenido;
  card.appendChild(p);

  // Acciones (Responder / Cerrar)
  const actions = document.createElement('div');
  actions.className = 'mural-actions';

  if (!esAutor) {
    const btnResponder = document.createElement('button');
    btnResponder.textContent = 'Responder';
    btnResponder.addEventListener('click', () => abrirFormularioComentario(_id));
    actions.appendChild(btnResponder);
  }

  if (esAutor) {
    const btnCerrar = document.createElement('button');
    btnCerrar.textContent = 'Cerrar aporte';
    btnCerrar.addEventListener('click', () => cerrarAporte(_id, card));
    actions.appendChild(btnCerrar);
  }

  card.appendChild(actions);

  // Formulario de comentario (oculto por defecto)
  const form = document.createElement('div');
  form.className = 'form-comentario hidden';
  form.innerHTML = `
    <textarea rows="2" placeholder="Escribe tu comentario..."></textarea>
    <button>Enviar</button>
  `;
  form.querySelector('button').addEventListener('click', async () => {
    const text = form.querySelector('textarea').value.trim();
    if (!text) return alert('Escribe algo antes de comentar.');
    await comentarAporte(_id, text);
    cargarAportes();
  });
  card.appendChild(form);

  // ===== Aquí reemplazamos la "Lista de comentarios" inline por:
  // número de respuestas + botón de tres puntos que abre el modal
  const info = document.createElement('div');
  info.className = 'respuesta-info';

  const num = document.createElement('span');
  num.textContent = `${respuestas.length} usuario${respuestas.length === 1 ? '' : 's'} ha${respuestas.length === 1 ? '' : 'n'} respondido`;

  const btnVer = document.createElement('button');
  btnVer.className = 'btn-ver-respuestas';
  btnVer.innerHTML = '⋯';
  btnVer.title = 'Ver respuestas';
  btnVer.addEventListener('click', () => mostrarModalRespuestas(_id, respuestas));

  info.appendChild(num);
  info.appendChild(btnVer);
  card.appendChild(info);

  mural.appendChild(card);
}

// ===== Cargar Aportes =====
async function cargarAportes() {
  try {
    mural.innerHTML = '';
    aportesMostrados.clear();
    const res = await fetch(`${API_BASE_URL}/api/mural/today`);
    if (!res.ok) throw new Error(`Error ${res.status}`);
    const datos = await res.json();
    datos.forEach(mostrarAporte);
  } catch (err) {
    console.error('Error al cargar el mural:', err);
  }
}

// ===== Comentarios =====
function abrirFormularioComentario(id) {
  const card = document.getElementById(`aporte-${id}`);
  card.querySelector('.form-comentario').classList.toggle('hidden');
}

async function comentarAporte(id, texto) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/mural/${id}/comentar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ contenido: texto })
    });
    if (!res.ok) throw new Error();
  } catch {
    alert('No se pudo comentar.');
  }
}

// ===== Cerrar Aporte =====
async function cerrarAporte(id, card) {
  if (!confirm('¿Cerrar este aporte?')) return;
  try {
    const res = await fetch(`${API_BASE_URL}/api/mural/${id}/cerrar`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) {
      card.remove();
    } else {
      throw new Error();
    }
  } catch {
    alert('No se pudo cerrar el aporte.');
  }
}

// ===== Cerrar modales =====
window.cerrarModalRespuestas = () => {
  document.getElementById('modalRespuestas').classList.add('hidden');
};







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
  if (misPanel.classList.contains('mostrar')) {
    cargarMisAportes();
  }
});


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

  
  cargarAportes();
  togglePopovers();

  // ===== Notificaciones =====
  const notifBtn   = document.getElementById('notifBtn');
  const notifPanel = document.getElementById('notifPanel');
  const notifList  = document.getElementById('notifList');
  const notifBadge = document.getElementById('notifBadge');
  const token      = localStorage.getItem('token');
  
  // Cargar y mostrar notificaciones
  async function cargarNotificaciones() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error();
    const notis = await res.json();

    notifList.innerHTML = '';
    const pendientes = notis.filter(n => !n.isRead).length;
    notifBadge.textContent = pendientes > 0 ? `(${pendientes})` : '';

    if (notis.length === 0) {
      notifList.innerHTML = '<li>No hay notificaciones</li>';
      return;
    }

    notis.forEach(n => {
      const li = document.createElement('li');
      li.className = n.isRead ? 'read' : 'unread';
      li.innerHTML = `
        <div class="notif-contenido">
          <strong>${n.sender.username}</strong>: ${n.message}
          <div style="font-size:0.8rem;color:var(--subtle)">
            ${new Date(n.createdAt).toLocaleString()}
          </div>
        </div>
        <button class="eliminar-notif" data-id="${n._id}" title="Eliminar notificación">✖</button>
      `;

      // Marcar como leída al hacer click en el contenido (no en el botón)
      li.querySelector('.notif-contenido').addEventListener('click', async () => {
        await fetch(`${API_BASE_URL}/api/notifications/${n._id}/read`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` }
        });
        li.className = 'read';
        await cargarNotificaciones(); // Recargar para actualizar el contador
      });

      // Eliminar notificación
      li.querySelector('.eliminar-notif').addEventListener('click', async (e) => {
        e.stopPropagation(); // Prevenir que se marque como leída al borrar
        await fetch(`${API_BASE_URL}/api/notifications/${n._id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        await cargarNotificaciones(); // Recargar la lista
      });

      notifList.appendChild(li);
    });

  } catch (err) {
    console.error('Error cargando notificaciones:', err);
    notifList.innerHTML = '<li>Error cargando notificaciones</li>';
  }
}

// Abrir/cerrar panel
notifBtn.addEventListener('click', async e => {
  e.stopPropagation();
  if (notifPanel.classList.contains('hidden')) {
    await cargarNotificaciones();
  }
  notifPanel.classList.toggle('hidden');
});

// Cerrar al click fuera
document.addEventListener('click', e => {
  if (!e.target.closest('#notifPanel') && !e.target.closest('#notifBtn')) {
    notifPanel.classList.add('hidden');
  }
});







});

