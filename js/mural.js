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

// ——— Helper para renderizar la mariposa en el tooltip ———
function renderButterflyTooltip(container, colors) {
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

// ===== Cargar mis aportes (anónimos) =====
async function cargarMisAportes() {
  const contenedor = document.getElementById('listaMisAportes');
  contenedor.innerHTML = '<p>Cargando tus aportes...</p>';

  try {
    const res = await fetch(`${API_BASE_URL}/api/mural/mios?user=${encodeURIComponent(usuario)}`, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
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

    // Eliminar aporte
    contenedor.querySelectorAll('.btn-eliminar-aporte').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('¿Seguro que deseas eliminar este aporte?')) return;
        const id = btn.dataset.id;
        try {
          const res2 = await fetch(`${API_BASE_URL}/api/mural/cerrar/${id}`, {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  }
});
          if (res2.ok) {
            btn.parentElement.remove();
            Toastify({ text: 'Aporte eliminado.', duration: 3000, gravity: 'top', position: 'center', style: { background: '#4caf50' } }).showToast();
          } else {
            throw await res2.json();
          }
        } catch (err) {
          Toastify({ text: err.message || 'Error al eliminar.', duration: 3000, gravity: 'top', position: 'center', style: { background: '#f44336' } }).showToast();
        }
      });
    });

  } catch (error) {
    contenedor.innerHTML = '<p>Error al cargar tus aportes.</p>';
    console.error(error);
  }
}

// ===== Zoom & Pan (sin cambios) =====
// … tu código de zoom & pan …

// ===== Modal de respuestas =====
async function mostrarModalRespuestas(aporteId) {
  const modal = document.getElementById('modal-respuestas');
  const contenedor = modal.querySelector('.contenido-respuestas');
  contenedor.innerHTML = '';

  try {
    const res = await fetch(`${API_BASE_URL}/api/mural/today`);
    const datos = await res.json();
    const aporte = datos.find(a => a._id === aporteId) || {};

    if (!aporte.respuestas) {
      contenedor.innerHTML = '<p>No hay respuestas.</p>';
    } else {
      aporte.respuestas.forEach((r, idx) => {
        const bloque = document.createElement('div');
        bloque.className = 'comentario-modal';
        bloque.innerHTML = `<p><strong>@${r.autor}</strong>: ${r.contenido}</p><small>${new Date(r.fecha||r.createdAt).toLocaleString()}</small>`;
        
        // Subrespuestas
        const lista = document.createElement('div');
        lista.className = 'subrespuestas';
        (r.subrespuestas||[]).forEach(sub => {
          const subDiv = document.createElement('div');
          subDiv.className = 'subrespuesta';
          subDiv.innerHTML = `<p><strong>@${sub.autor}</strong>: ${sub.contenido}</p><small>${new Date(sub.fecha||sub.createdAt).toLocaleString()}</small>`;
          lista.appendChild(subDiv);
        });
        bloque.appendChild(lista);

        // Botón responder
        const btn = document.createElement('button');
        btn.textContent = 'Responder';
        btn.className = 'btn-subresponder';
        btn.addEventListener('click', () => abrirFormularioSubrespuesta(bloque, aporteId, idx, lista));
        bloque.appendChild(btn);

        contenedor.appendChild(bloque);
      });
    }
    modal.classList.remove('hidden');
  } catch (err) {
    console.error(err);
    contenedor.innerHTML = '<p>Error al cargar respuestas.</p>';
    modal.classList.remove('hidden');
  }
}

function abrirFormularioSubrespuesta(bloque, aporteId, idx, lista) {
  if (bloque.querySelector('.form-subrespuesta')) return;
  const form = document.createElement('div');
  form.className = 'form-subrespuesta';
  form.innerHTML = `<textarea rows="2" placeholder="Tu respuesta..."></textarea><button>Enviar</button>`;
  form.querySelector('button').addEventListener('click', async () => {
    const txt = form.querySelector('textarea').value.trim();
    if (!txt) return alert('Escribe algo primero.');

    // Enviar subrespuesta
await fetch(`${API_BASE_URL}/api/mural/${aporteId}/responder/${idx}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  },
  body: JSON.stringify({ contenido: txt })
});

    // Insertar subrespuesta en UI
    const nuevaSub = document.createElement('div');
    nuevaSub.className = 'subrespuesta';
    nuevaSub.innerHTML = `<p><strong>@${usuario}</strong>: ${txt}</p><small>${new Date().toLocaleString()}</small>`;
    lista.appendChild(nuevaSub);
    form.remove();
  });
  bloque.appendChild(form);
}

// ===== Agregar Aporte =====
async function agregarAlMural() {
  const contenidoElem = document.getElementById('contenido');
  const texto = contenidoElem.value.trim();

  if (!texto) {
    Toastify({
      text: 'Escribe algo primero.',
      duration: 3000,
      gravity: 'top',
      position: 'center',
      style: { background: '#f44336' }
    }).showToast();
    return;
  }

  const token = localStorage.getItem('authToken');

  if (!token) {
    alert('No tienes un token válido. Refresca la página o vuelve a ingresar.');
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/mural`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ contenido: texto })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Error al publicar.');
    }

    contenidoElem.value = '';
    cargarAportes();
    Toastify({
      text: 'Aporte publicado.',
      duration: 3000,
      gravity: 'top',
      position: 'center',
      style: { background: '#4caf50' }
    }).showToast();
  } catch (err) {
    console.error('❌ Error publicando aporte:', err);
    Toastify({
      text: err.message || 'Error desconocido',
      duration: 3000,
      gravity: 'top',
      position: 'center',
      style: { background: '#f44336' }
    }).showToast();
  }
}

window.agregarAlMural = agregarAlMural;

// ===== Mostrar Aporte en el mural =====
function mostrarAporte({ _id, contenido, usuario: autor, respuestas=[] }) {
  if (aportesMostrados.has(_id)) return;
  aportesMostrados.add(_id);

  const esAutor = autor === usuario;
  const card = document.createElement('div');
  card.className = 'mural-item';
  card.id = `aporte-${_id}`;

  // Posición y estilo
  const { offsetWidth: w, offsetHeight: h } = mural;
  card.style.left = `${Math.random()*(w-200)}px`;
  card.style.top  = `${Math.random()*(h-200)}px`;
  card.style.setProperty('--rot', `${Math.random()*10-5}deg`);
  card.style.setProperty('--scale', `${0.95+Math.random()*0.1}`);

  // Contenido
  const p = document.createElement('p');
  p.textContent = contenido;
  card.appendChild(p);

  // Acciones
  const actions = document.createElement('div');
  actions.className = 'mural-actions';
  if (!esAutor) {
    const btn = document.createElement('button');
    btn.textContent = 'Responder';
    btn.addEventListener('click', () => abrirFormularioComentario(_id));
    actions.appendChild(btn);
  } else {
    const btn = document.createElement('button');
    btn.textContent = 'Cerrar aporte';
    btn.addEventListener('click', () => cerrarAporte(_id, card));
    actions.appendChild(btn);
  }
  card.appendChild(actions);

  // Info de respuestas
  const info = document.createElement('div');
  info.className = 'respuesta-info';
  const num = document.createElement('span');
  num.setAttribute('data-contador-id', _id);
  num.textContent = `${respuestas.length} respuesta${respuestas.length===1?'':'s'}`;
  const btnVer = document.createElement('button');
  btnVer.className = 'btn-ver-respuestas';
  btnVer.textContent = '⋯';
  btnVer.addEventListener('click', () => mostrarModalRespuestas(_id));
  info.append(num, btnVer);
  card.appendChild(info);

  // Tooltip mariposa
  let hoverTimeout, tooltipEl;
  card.addEventListener('mouseenter', () => {
    hoverTimeout = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/users/butterfly/${autor}`);
        const { butterflyColors = [] } = await res.json();
        tooltipEl = document.createElement('div');
        tooltipEl.className = 'tooltip-usuario';
        tooltipEl.innerHTML = `<strong>@${autor}</strong>`;
        renderButterflyTooltip(tooltipEl, butterflyColors);
        document.body.appendChild(tooltipEl);
        const rect = card.getBoundingClientRect();
        tooltipEl.style.left = `${rect.right + 10 + window.scrollX}px`;
        tooltipEl.style.top  = `${rect.top + window.scrollY}px`;
      } catch (e) { console.error(e); }
    }, 3000);
  });
  card.addEventListener('mouseleave', () => {
    clearTimeout(hoverTimeout);
    tooltipEl?.remove();
  });

  mural.appendChild(card);
}

// ===== Cargar Aportes =====
async function cargarAportes() {
  mural.innerHTML = '';
  aportesMostrados.clear();
  try {
    const res = await fetch(`${API_BASE_URL}/api/mural/today`);
    const datos = await res.json();
    datos.forEach(mostrarAporte);
  } catch (e) {
    console.error('Error cargando mural:', e);
  }
}

// ===== Comentarios inline =====
function abrirFormularioComentario(id) {
  const card = document.getElementById(`aporte-${id}`);
  card.querySelector('.form-comentario').classList.toggle('hidden');
}

// ===== Comentar aporte =====
async function comentarAporte(id, texto) {
  await fetch(`${API_BASE_URL}/api/mural/${id}/comentar`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  },
  body: JSON.stringify({ contenido: texto })
});

  Toastify({ text: 'Comentario agregado.', duration:2000, gravity:'top', position:'center' }).showToast();
  cargarAportes();
}

// ===== Cerrar aporte =====
async function cerrarAporte(id, card) {
  if (!confirm('Cerrar este aporte?')) return;
  await fetch(`${API_BASE_URL}/api/mural/${id}/cerrar`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  }
});

  card.remove();
}

// ===== Popovers =====
function togglePopovers() {
  const btnF = document.getElementById('btnFormulario');
  const fp = document.querySelector('.formulario');
  const btnM = document.getElementById('btnMisAportes');
  const mp = document.getElementById('misAportes');

  btnF?.addEventListener('click', e => { e.stopPropagation(); fp.classList.toggle('mostrar'); mp.classList.remove('mostrar'); });
  btnM?.addEventListener('click', e => { e.stopPropagation(); mp.classList.toggle('mostrar'); fp.classList.remove('mostrar'); if (mp.classList.contains('mostrar')) cargarMisAportes(); });
  document.addEventListener('click', e => {
    if (!e.target.closest('.formulario')) fp.classList.remove('mostrar');
    if (!e.target.closest('#misAportes'))  mp.classList.remove('mostrar');
  });
}

// ===== Init =====
window.addEventListener('DOMContentLoaded', () => {
  usuario = window.currentUsername;
  if (!usuario) return window.location.href = 'index.html';

  cargarAportes();
  togglePopovers();
});


(async () => {
  let token = localStorage.getItem('authToken');
  let username = localStorage.getItem('username');
  let correo = localStorage.getItem('correo');

  if (!username) {
    username = prompt('¿Cómo te llamas?');
    if (!username) {
      return alert('Debes ingresar un nombre.');
    }
    localStorage.setItem('username', username);
  }

  if (!token) {
    const res = await fetch(`${API_BASE_URL}/api/token/generate-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, correo }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Error al generar token:', errorText);
      return alert('No se pudo generar el token.');
    }

    const data = await res.json();
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    } else {
      alert('No se pudo generar el token.');
    }
  }

  window.currentUsername = username;
})();

