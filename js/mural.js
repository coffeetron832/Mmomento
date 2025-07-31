import {
  sanitize,
  formatearFecha,
  esTextoValido,
  mostrarError,
  mostrarExito
} from './utils.js';





const username = localStorage.getItem('username');
const token = localStorage.getItem('userToken');





if (!token || tokenExpirado(token)) {
  alert('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
  localStorage.clear();
  window.location.href = 'index.html';
} else {
  // Verificamos en el backend si el token es válido
  fetch('https://themural-backend-production.up.railway.app/api/auth/verificar', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
    .then(res => res.json())
    .then(data => {
      if (!data.valido) {
        alert('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
        localStorage.clear();
        window.location.href = 'index.html';
      } else {
        localStorage.setItem('username', data.usuario.username);
        iniciarTemporizadorDeSesion(token);
        const bienvenidaEl = document.getElementById('bienvenida');
        if (bienvenidaEl) {
          bienvenidaEl.textContent = ` ¡Hola! ${data.usuario.username}`;
        }
      }
    })
    .catch(err => {
      console.error('⚠️ No se pudo verificar sesión con el backend:', err);
      localStorage.clear();
      window.location.href = 'index.html';
    });
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
// Mostrar aportes en el mural
async function cargarAportes() {
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

    const respuestasDiv = div.querySelector('.respuestas');

    if (aporte.respuestas && aporte.respuestas.length > 0) {
      aporte.respuestas.forEach(respuesta => {
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
          <div class="texto-respuesta">${sanitize(respuesta.texto)}</div>
          ${respuesta.username === username ? `
            <button class="btnEditarRespuesta">✏️ Editar</button>
            <button class="btnEliminarRespuesta">🗑️ Eliminar</button>
          ` : ''}
        `;

        if (respuesta.username === username) {
          const btnEditar = r.querySelector('.btnEditarRespuesta');
          const btnEliminar = r.querySelector('.btnEliminarRespuesta');

          btnEditar.addEventListener('click', () => {
            const nuevoTexto = prompt('Editar respuesta:', respuesta.texto);
            if (!nuevoTexto) return;
            fetch(`https://themural-backend-production.up.railway.app/api/aportes/${aporte._id}/respuestas/${respuesta._id}`, {
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
          });

          btnEliminar.addEventListener('click', () => {
            if (!confirm('¿Eliminar esta respuesta?')) return;
            fetch(`https://themural-backend-production.up.railway.app/api/aportes/${aporte._id}/respuestas/${respuesta._id}`, {
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
          });
        }

        respuestasDiv.appendChild(r);
      });
    }

    // Enviar respuesta
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

    // Asignar posición aleatoria dentro del lienzo
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



cargarAportes();

// Logout
async function logout() {
  const token = localStorage.getItem('userToken'); // ✅ Trae el token desde localStorage

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


function iniciarTemporizadorDeSesion(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const tiempoExpiracion = payload.exp * 1000; // En ms
    const ahora = Date.now();
    const tiempoRestante = tiempoExpiracion - ahora;

    if (tiempoRestante <= 0) {
      cerrarSesionAutomatica();
      return;
    }

    // Aviso 1 minuto antes
    setTimeout(() => {
      alert('⚠️ Tu sesión expira en 1 minuto.');
    }, tiempoRestante - 60000); // 60,000 ms = 1 min

    // Cierre automático
    setTimeout(() => {
      cerrarSesionAutomatica();
    }, tiempoRestante);

  } catch (err) {
    console.warn('⚠️ Error al iniciar temporizador:', err);
  }
}

function cerrarSesionAutomatica() {
  const token = localStorage.getItem('userToken');
  const username = localStorage.getItem('username');

  if (!token || !username) return;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiraEn = payload.exp - payload.iat;

    if (expiraEn <= 10800) {
      fetch('https://themural-backend-production.up.railway.app/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    }
  } catch (err) {
    console.warn('❌ Error al detectar expiración de sesión:', err);
  }

  localStorage.clear();
  alert('Tu sesión ha expirado. Si eras un usuario temporal, tus aportes fueron eliminados.');
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



// Soporte táctil para arrastrar el mural con los dedos
lienzo.addEventListener('touchstart', (e) => {
  if (e.touches.length !== 1) return; // Ignora pinch/zoom
  isDragging = true;
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
});

lienzo.addEventListener('touchmove', (e) => {
  if (!isDragging || e.touches.length !== 1) return;
  const touch = e.touches[0];
  const dx = touch.clientX - startX;
  const dy = touch.clientY - startY;

  offsetX += dx;
  offsetY += dy;

  startX = touch.clientX;
  startY = touch.clientY;

  applyTransform();
}, { passive: false });

lienzo.addEventListener('touchend', () => {
  isDragging = false;
});




window.zoomIn = function () {
  const center = {
    clientX: lienzo.clientWidth / 2,
    clientY: lienzo.clientHeight / 2
  };
  zoomAtCursor(center, zoomStep);
};

window.zoomOut = function () {
  const center = {
    clientX: lienzo.clientWidth / 2,
    clientY: lienzo.clientHeight / 2
  };
  zoomAtCursor(center, -zoomStep);
};



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

async function cargarMisAportes() {
  // Obtener todos los aportes
  const res = await fetch('https://themural-backend-production.up.railway.app/api/aportes');
  const data = await res.json();

  // Filtrar solo los tuyos
  const tuyos = data.filter(a => a.username === username);
  misList.innerHTML = '';

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
    // Borrar al hacer click
    li.querySelector('button').addEventListener('click', async (e) => {
      const id = e.currentTarget.dataset.id;
      if (!confirm('¿Eliminar este aporte?')) return;
      const delRes = await fetch(`https://themural-backend-production.up.railway.app/api/aportes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (delRes.ok) {
        cargarMisAportes();
        cargarAportes(); // refrescar el lienzo
      } else {
        alert('No se pudo eliminar.');
      }
    });
    misList.appendChild(li);
  });

  if (tuyos.length === 0) {
    misList.innerHTML = '<li>No tienes aportes.</li>';
  }
}


