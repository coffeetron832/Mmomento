/* mural.js - Simplificado para aportes de texto con respuestas y cierre de hilos */
const API_BASE_URL = 'https://themural-backend-production.up.railway.app';

// Posiciones de cada “pixel” en la mariposa (mismo array que en soulprint.html)
const butterflyPixelPositions = [
  [12, -6], [18, -6], [6, 0], [24, 0], [0, 6], [30, 6], [6, 12], [24, 12],
  [12, 18], [18, 18], [6, 24], [24, 24], [12, 30], [18, 30],
  [-12, -6], [-18, -6], [-6, 0], [-24, 0], [-30, 6], [-6, 12], [-24, 12], [0, 6],
  [-12, 18], [-18, 18], [-6, 24], [-24, 24], [-12, 30], [-18, 30]
];


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





// ——— Helper para renderizar la mariposa en el tooltip ———
function renderButterflyTooltip(container, colors) {
  // elimina sólo cualquier grid previo, no todo el contenido
  const prevGrid = container.querySelector('.grid-tooltip');
  if (prevGrid) prevGrid.remove();

  const scale = 8;
  const tooltipGrid = document.createElement('div');
  tooltipGrid.className = 'grid-tooltip';
  colors.forEach((color, i) => {
    const [x, y] = butterflyPixelPositions[i];
    const pixel = document.createElement('div');
    pixel.className = 'pixel-tooltip';
    pixel.style.left = `${(x + 36) * (scale / 6)}px`;
    pixel.style.top  = `${(y + 36) * (scale / 6)}px`;
    pixel.style.backgroundColor = color || '#ffffff';
    tooltipGrid.appendChild(pixel);
  });
  container.appendChild(tooltipGrid);
}







async function cargarMisAportes() {
  // apunta al contenedor correcto
  const contenedor = document.getElementById('listaMisAportes');
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
<small>💬 ${aporte.respuestas?.length || 0} respuesta(s)</small>

        </div>
        <button class="btn-eliminar-aporte" data-id="${aporte._id}">🗑️ Eliminar</button>
      `;
      contenedor.appendChild(d);
    });

    // listeners para eliminar
    contenedor.querySelectorAll('.btn-eliminar-aporte').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('¿Seguro que deseas eliminar este aporte?')) return;
        const id = btn.dataset.id;
        try {
          const res2 = await fetch(`${API_BASE_URL}/api/mural/cerrar/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          const body = await res2.json();
          if (res2.ok) {
  btn.parentElement.remove();
  Toastify({
    text: 'Aporte eliminado con éxito.',
    duration: 3000,
    gravity: 'top',
    position: 'center',
    style: { background: '#4caf50' }
  }).showToast();
} else {
  Toastify({
    text: body.message || 'Error al eliminar el aporte.',
    duration: 4000,
    gravity: 'top',
    position: 'center',
    style: { background: '#f44336' }
  }).showToast();
}

        } catch (err) {
          console.error('Error al eliminar aporte:', err);
          Toastify({
  text: 'Ocurrió un error al eliminar el aporte.',
  duration: 4000,
  gravity: 'top',
  position: 'center',
  style: { background: '#f44336' }
}).showToast();

        }
      });
    });

  } catch (error) {
    console.error('Error cargando mis aportes:', error);
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
async function mostrarModalRespuestas(aporteId) {
  // 1) Referencias al modal y a su contenedor (ajustado a tu HTML)
  const modal = document.getElementById('modal-respuestas');
  const contenedor = modal.querySelector('.contenido-respuestas');
  if (!modal || !contenedor) {
    console.error('No se encontró el modal o su contenedor en el DOM');
    return;
  }
  contenedor.innerHTML = ''; // limpia contenido previo

  try {
    // 2) Cargo los aportes del día y filtro el que me interesa
    const res = await fetch(`${API_BASE_URL}/api/mural/today`);
    const datos = await res.json();
    const aporte = datos.find(a => a._id === aporteId);

    if (!aporte) {
      contenedor.innerHTML = '<p>Aporte no encontrado.</p>';
      modal.classList.remove('hidden');
      return;
    }

    // 3) Por cada comentario en el aporte, creo su bloque
    aporte.respuestas.forEach((r, idx) => {
      const bloque = document.createElement('div');
      bloque.className = 'comentario-modal';
      bloque.innerHTML = `
        <p><strong>@${r.autor}</strong>: ${r.contenido}</p>
        <small>${new Date(r.fecha || r.createdAt).toLocaleString()}</small>
      `;

      // 4) Solo muestro “Responder” si NO soy el autor del comentario
      if (r.autor !== usuario) {
        const btn = document.createElement('button');
        btn.textContent = 'Responder';
        btn.className = 'btn-subresponder';
        btn.addEventListener('click', () => {
          // Evito duplicar el formulario
          if (bloque.querySelector('textarea')) return;

          const form = document.createElement('div');
          form.className = 'form-subrespuesta';
          form.innerHTML = `
            <textarea rows="2" placeholder="Tu respuesta..."></textarea>
            <button>Enviar</button>
          `;
          form.querySelector('button').addEventListener('click', async () => {
            const txt = form.querySelector('textarea').value.trim();
            if (!txt) return alert('Escribe algo primero.');
            await fetch(
              `${API_BASE_URL}/api/mural/${aporteId}/responder/${idx}`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ contenido: txt }),
              }
            );
            // recargo el modal para reflejar la nueva subrespuesta
            mostrarModalRespuestas(aporteId);
          });
          bloque.appendChild(form);
        });
        bloque.appendChild(btn);
      }

      contenedor.appendChild(bloque);
    });

    // 5) Abro el modal
    modal.classList.remove('hidden');

  } catch (err) {
    console.error('Error cargando respuestas:', err);
    contenedor.innerHTML = '<p>Error al cargar las respuestas.</p>';
    modal.classList.remove('hidden');
  }
}
window.mostrarModalRespuestas = mostrarModalRespuestas;




// ===== Aportes =====
async function agregarAlMural() {
  if (!verificarToken()) return;
  const contenidoElem = document.getElementById('contenido');
  const contenido = contenidoElem.value.trim();
  if (!contenido) {
    Toastify({
      text: 'Por favor escribe algo antes de compartir.',
      duration: 3000,
      gravity: 'top',
      position: 'center',
      style: { background: '#f44336' }
    }).showToast();
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/mural`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ contenido })
    });

    const data = await res.json();

    if (!res.ok) {
  let mensaje = data.message || '⚠️ Error al subir el aporte.';

  // Si incluye la palabra "suspendido hasta", convertir la hora a local (Colombia)
  const match = mensaje.match(/suspendido hasta (.+?) por/);
  if (match) {
    const utcTime = new Date(match[1]);
    const opciones = { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'America/Bogota' };
    const horaColombia = utcTime.toLocaleTimeString('es-CO', opciones);
    mensaje = mensaje.replace(match[1], `${horaColombia} (hora Colombia)`);
  }

  Toastify({
    text: mensaje,
    duration: 6000,
    gravity: 'top',
    position: 'center',
    style: { background: '#f44336' }
  }).showToast();
  return;
}


    // ✅ Sólo si el backend lo acepta
    contenidoElem.value = '';
    cargarAportes();
    Toastify({
      text: '✨ Aporte publicado exitosamente.',
      duration: 3000,
      gravity: 'top',
      position: 'center',
      style: { background: '#4caf50' }
    }).showToast();

  } catch (err) {
    console.error('Error al subir el aporte:', err);
    Toastify({
      text: '❌ Error de red al subir el aporte.',
      duration: 4000,
      gravity: 'top',
      position: 'center',
      style: { background: '#f44336' }
    }).showToast();
  }
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

  // Acciones (Responder / Cerrar aporte)
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

  // Formulario de comentario en el aporte (oculto)
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

  // Información de respuestas
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

  // ===== Mostrar respuestas y subrespuestas inline =====
  const respuestasContainer = document.createElement('div');
  respuestasContainer.className = 'respuestas-container';

  respuestas.forEach((respuesta, i) => {
    // División de cada respuesta
    const respuestaDiv = document.createElement('div');
    respuestaDiv.className = 'respuesta-div';

    // Texto de la respuesta
    const autorEl = document.createElement('strong');
    autorEl.textContent = `${respuesta.autor}: `;
    const contenidoEl = document.createElement('span');
    contenidoEl.textContent = respuesta.contenido;
    respuestaDiv.appendChild(autorEl);
    respuestaDiv.appendChild(contenidoEl);

    // Botón para subresponder
    const btnSubresponder = document.createElement('button');
    btnSubresponder.textContent = 'Responder';
    btnSubresponder.className = 'btn-subresponder';
    btnSubresponder.addEventListener('click', () => {
      // Evitar múltiples inputs
      if (respuestaDiv.querySelector('.subrespuesta-form')) return;

      const subForm = document.createElement('div');
      subForm.className = 'subrespuesta-form';
      subForm.innerHTML = `
        <input type="text" placeholder="Escribe tu respuesta..." />
        <button>Enviar</button>
      `;
      const input = subForm.querySelector('input');
      subForm.querySelector('button').addEventListener('click', async () => {
        const texto = input.value.trim();
        if (!texto) return;
        const token = localStorage.getItem('token');
        await fetch(`${API_BASE_URL}/api/mural/${_id}/responder/${i}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ contenido: texto })
        });
        cargarAportes();
      });

      respuestaDiv.appendChild(subForm);
    });
    respuestaDiv.appendChild(btnSubresponder);

    // Contenedor de subrespuestas
    const subContainer = document.createElement('div');
    subContainer.className = 'subrespuestas';
    (respuesta.subrespuestas || []).forEach(sub => {
      const subEl = document.createElement('div');
      subEl.className = 'subrespuesta';
      subEl.textContent = `${sub.autor}: ${sub.contenido}`;
      subContainer.appendChild(subEl);
    });
    respuestaDiv.appendChild(subContainer);

    respuestasContainer.appendChild(respuestaDiv);
  });

  card.appendChild(respuestasContainer);

  // Tooltip de mariposa (igual que antes)
  let hoverTimeout, tooltipEl;
  card.addEventListener('mouseenter', () => {
    hoverTimeout = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/users/butterfly/${autor}`);
        const data = await res.json();
        const colors = data.butterflyColors || [];
        tooltipEl = document.createElement('div');
        tooltipEl.className = 'tooltip-usuario';
        tooltipEl.innerHTML = `<strong>@${autor}</strong>`;
        renderButterflyTooltip(tooltipEl, colors);
        document.body.appendChild(tooltipEl);
        const rect = card.getBoundingClientRect();
        tooltipEl.style.left = `${rect.right + 10 + window.scrollX}px`;
        tooltipEl.style.top  = `${rect.top + window.scrollY}px`;
      } catch (err) {
        console.error('Error cargando mariposa tooltip:', err);
      }
    }, 3000);
  });
  card.addEventListener('mouseleave', () => {
    clearTimeout(hoverTimeout);
    if (tooltipEl) tooltipEl.remove();
  });

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
    const data = await res.json();

    if (!res.ok) {
      return Toastify({
        text: data.message || 'No se pudo comentar.',
        duration: 4000,
        gravity: 'top',
        position: 'center',
      }).showToast();
    }

    Toastify({
      text: data.message || 'Comentario agregado.',
      duration: 3000,
      gravity: 'top',
      position: 'center',
    }).showToast();

    // Aquí limpias el input o refrescas la lista de comentarios…

  } catch (err) {
    Toastify({
      text: err.message || 'Error de red al comentar.',
      duration: 4000,
      gravity: 'top',
      position: 'center',
    }).showToast();
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

