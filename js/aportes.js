// aportes.js
import { sanitize, formatearFecha } from './utils.js';

let token, username;
let container, lienzo, misList;

export function initAportesModulo(context) {
  token = context.token;
  username = context.username;
  container = document.getElementById('aportesContainer');
  lienzo = document.getElementById('lienzo');
  misList = document.getElementById('misAportesList');
}

export async function cargarAportes() {
  const res = await fetch('https://themural-backend-production.up.railway.app/api/aportes');
  const data = await res.json();

  container.innerHTML = '';

  data.forEach(aporte => {
    const div = document.createElement('div');
    div.classList.add('aporte');
    div.innerHTML = `
      <div class="cabecera">
        <span class="usuario">@${aporte.username}</span>
        <span class="fecha">${formatearFecha(aporte.createdAt)}</span>
      </div>
      <div class="contenido">${sanitize(aporte.texto)}</div>
      <button class="btn-responder">💬 Responder</button>
      <form class="form-respuesta" style="display:none; margin-top:5px;">
        <textarea placeholder="Escribe tu respuesta..." required style="width:100%; height:40px;"></textarea>
        <button type="submit">Enviar</button>
      </form>
      <div class="respuestas" style="margin-top:8px; padding-left:10px;"></div>
    `;

    agregarRespuestas(div, aporte);
    agregarFormularioRespuesta(div, aporte);

    const muralWidth = lienzo.clientWidth * 2;
    const muralHeight = lienzo.clientHeight * 2;
    const randomX = Math.floor(Math.random() * muralWidth) - lienzo.clientWidth / 2;
    const randomY = Math.floor(Math.random() * muralHeight) - lienzo.clientHeight / 2;

    div.style.position = 'absolute';
    div.style.left = `${randomX}px`;
    div.style.top = `${randomY}px`;

    container.appendChild(div);
  });
}

function agregarRespuestas(div, aporte) {
  const respuestasDiv = div.querySelector('.respuestas');

  (aporte.respuestas || []).forEach(respuesta => {
    const r = document.createElement('div');
    r.style.cssText = 'margin-top:6px; padding-left:8px; border-left:2px solid #555; font-size:13px;';

    const rFecha = new Date(respuesta.createdAt).toLocaleString('es-CO', {
      dateStyle: 'short',
      timeStyle: 'short'
    });

    r.innerHTML = `
      <div><strong>${respuesta.username}</strong> <span style="color:#aaa;">${rFecha}</span></div>
      <div class="texto-respuesta">${sanitize(respuesta.texto)}</div>
      ${respuesta.username === username ? `
        <button class="btnEditarRespuesta">✏️ Editar</button>
        <button class="btnEliminarRespuesta">🗑️ Eliminar</button>
      ` : ''}
    `;

    if (respuesta.username === username) {
      r.querySelector('.btnEditarRespuesta').addEventListener('click', () => editarRespuesta(aporte._id, respuesta));
      r.querySelector('.btnEliminarRespuesta').addEventListener('click', () => eliminarRespuesta(aporte._id, respuesta._id));
    }

    respuestasDiv.appendChild(r);
  });
}

function agregarFormularioRespuesta(div, aporte) {
  const form = div.querySelector('.form-respuesta');
  const btnResponder = div.querySelector('.btn-responder');

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
      cargarMisAportes();
    } else {
      alert('Error enviando respuesta.');
    }
  });
}

function editarRespuesta(aporteId, respuesta) {
  const nuevoTexto = prompt('Editar respuesta:', respuesta.texto);
  if (!nuevoTexto) return;

  fetch(`https://themural-backend-production.up.railway.app/api/aportes/${aporteId}/respuestas/${respuesta._id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ texto: nuevoTexto })
  }).then(r => {
    if (r.ok) {
      cargarAportes();
      cargarMisAportes();
    } else {
      alert('Error editando respuesta.');
    }
  });
}

function eliminarRespuesta(aporteId, respuestaId) {
  if (!confirm('¿Eliminar esta respuesta?')) return;

  fetch(`https://themural-backend-production.up.railway.app/api/aportes/${aporteId}/respuestas/${respuestaId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => {
    if (r.ok) {
      cargarAportes();
      cargarMisAportes();
    } else {
      alert('Error eliminando respuesta.');
    }
  });
}

export async function cargarMisAportes() {
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
    const fecha = new Date(a.createdAt).toLocaleString('es-CO', {
      dateStyle: 'short',
      timeStyle: 'short'
    });

    li.innerHTML = `
      <span>${fecha}</span>
      <button data-id="${a._id}" title="Eliminar">&#x1F5D1;</button>
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

    misList.appendChild(li);
  });
}

export function initFormularioAporte() {
  const form = document.getElementById('aporteForm');
  const textarea = document.getElementById('textoAporte');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const texto = textarea.value.trim();
    if (!texto) return;

    const res = await fetch('https://themural-backend-production.up.railway.app/api/aportes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ texto })
    });

    if (res.ok) {
      textarea.value = '';
      cargarAportes();
    } else {
      alert('Error publicando el aporte.');
    }
  });
}
