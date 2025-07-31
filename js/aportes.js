import { sanitize, formatearFecha } from './utils.js';

const API_URL = 'https://themural-backend-production.up.railway.app/api/aportes';
const token = localStorage.getItem('token');

// ———————————————— FUNCIONES INTERNAS ————————————————

function crearElementoAporte(aporte, usernameActual) {
  const div = document.createElement('div');
  div.className = 'aporte';

  const autor = aporte.usuario?.username || 'Anónimo';
  const esPropio = autor === usernameActual;

  div.innerHTML = `
    <p><strong>${sanitize(autor)}</strong> dijo:</p>
    <p>${sanitize(aporte.texto)}</p>
    <small>${formatearFecha(aporte.createdAt)}</small>
    ${esPropio ? '<button class="eliminar-aporte">🗑️ Eliminar</button>' : ''}
    <div class="comentarios"></div>
    <form class="form-comentario">
      <input type="text" name="comentario" placeholder="Escribe un comentario..." required>
      <button type="submit">Comentar</button>
    </form>
  `;

  if (esPropio) {
    div.querySelector('.eliminar-aporte').addEventListener('click', async () => {
      await eliminarAporte(aporte._id);
      div.remove();
    });
  }

  const formComentario = div.querySelector('.form-comentario');
  const comentariosDiv = div.querySelector('.comentarios');

  if (aporte.respuestas?.length) {
    for (const respuesta of aporte.respuestas) {
      const r = document.createElement('p');
      r.innerHTML = `<strong>${sanitize(respuesta.usuario?.username || 'Anónimo')}:</strong> ${sanitize(respuesta.texto)}`;
      comentariosDiv.appendChild(r);
    }
  }

  formComentario.addEventListener('submit', async (e) => {
    e.preventDefault();
    const texto = formComentario.comentario.value.trim();
    if (!texto) return;
    await crearComentario(aporte._id, texto);
    formComentario.reset();
    cargarAportes(); // Recarga
  });

  return div;
}

// ———————————————— EXPORTABLES ————————————————

export async function crearAporte(texto) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ texto })
  });

  if (!res.ok) throw new Error('No se pudo crear el aporte');
}

export async function crearComentario(aporteId, texto) {
  const res = await fetch(`${API_URL}/${aporteId}/respuestas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ texto })
  });

  if (!res.ok) throw new Error('No se pudo comentar');
}

export async function eliminarAporte(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!res.ok) throw new Error('No se pudo eliminar el aporte');
}

export async function cargarAportes() {
  const contenedor = document.getElementById('contenedor-aportes');
  contenedor.innerHTML = '';

  const res = await fetch(API_URL);
  const aportes = await res.json();

  const username = localStorage.getItem('username');

  for (const aporte of aportes) {
    const el = crearElementoAporte(aporte, username);
    contenedor.appendChild(el);
  }
}

export async function cargarMisAportes() {
  const contenedor = document.getElementById('mis-aportes');
  contenedor.innerHTML = '';

  const res = await fetch(API_URL, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const aportes = await res.json();

  const username = localStorage.getItem('username');

  for (const aporte of aportes) {
    if (aporte.usuario?.username === username) {
      const el = crearElementoAporte(aporte, username);
      contenedor.appendChild(el);
    }
  }
}

export function initAportesModulo() {
  const tab = document.getElementById('tab-mis-aportes');
  tab.addEventListener('click', cargarMisAportes);
}

export function initFormularioAporte() {
  const form = document.getElementById('form-aporte');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const texto = form.texto.value.trim();
    if (!texto) return;

    await crearAporte(texto);
    form.reset();
    cargarAportes();
  });
}
