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



    // ✅ Definimos usuario como variable global al inicio
let usuario; // ✅ Declaración vacía global
// ✅ Declarar este Set al inicio del archivo, antes de usarlo
const aportesMostrados = new Set();


function verificarToken() {
  const token = localStorage.getItem('token');

  if (!token) {
    alert('Debes iniciar sesión para usar el mural.');
    window.location.href = '/index.html'; // o la ruta que uses para login
    return false;
  }
  return true;
}



const toggleBtn = document.getElementById('toggleUIBtn');
const formulario = document.querySelector('.formulario');
const misAportes = document.getElementById('misAportes');

let uiVisible = true;



    // 🕛 Borrar mural si es un nuevo día
    const hoy = new Date().toDateString();
    const ultimaVisita = localStorage.getItem('muralFecha');
    if (ultimaVisita !== hoy) {
      localStorage.setItem('muralFecha', hoy);
      document.getElementById('mural').innerHTML = '';
    }

    const tipo = document.getElementById('tipo');
    const contenido = document.getElementById('contenido');
    const imagenInput = document.getElementById('imagenInput');
    const mural = document.getElementById('mural');
    const preview = document.getElementById('preview');
    const previewImg = document.getElementById('previewImg');
    const canvas = document.getElementById('canvasDoodle');
    const ctx = canvas.getContext('2d');
    const colorPicker = document.getElementById('colorPicker');
    const doodleControls = document.getElementById('doodleControls');

   let scale = 1, posX = 0, posY = 0;
let isDragging = false;
let isPinching = false;
let startX, startY;
let initialDistance = null;
let initialScale = scale;



  const muralContainer = document.getElementById('muralContainer');
  const zoomInBtn = document.getElementById('zoomIn');
  const zoomOutBtn = document.getElementById('zoomOut');

  function updateTransform() {
    mural.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
  }

  zoomInBtn.addEventListener('click', () => {
    scale = Math.min(2, scale + 0.1);
    updateTransform();
  });

  zoomOutBtn.addEventListener('click', () => {
    scale = Math.max(0.4, scale - 0.1);
    updateTransform();
  });

  muralContainer.addEventListener('mousedown', e => {
    isDragging = true;
    startX = e.clientX - posX;
    startY = e.clientY - posY;
    muralContainer.style.cursor = 'grabbing';
  });

  muralContainer.addEventListener('mousemove', e => {
    if (!isDragging) return;
    posX = e.clientX - startX;
    posY = e.clientY - startY;
    updateTransform();
  });

  muralContainer.addEventListener('mouseup', () => {
    isDragging = false;
    muralContainer.style.cursor = 'grab';
  });

  muralContainer.addEventListener('mouseleave', () => {
    isDragging = false;
    muralContainer.style.cursor = 'grab';
  });

    let drawing = false;

    tipo.addEventListener('change', () => {
      const tipoVal = tipo.value;
      contenido.style.display = tipoVal === 'imagen' || tipoVal === 'doodle' ? 'none' : 'block';
      imagenInput.style.display = tipoVal === 'imagen' ? 'block' : 'none';
      canvas.style.display = tipoVal === 'doodle' ? 'block' : 'none';
      doodleControls.style.display = tipoVal === 'doodle' ? 'flex' : 'none';
      preview.style.display = tipoVal === 'imagen' ? 'block' : 'none';
    });

    imagenInput.addEventListener('change', () => {
      const archivo = imagenInput.files[0];
      if (!archivo) return;
      const img = new Image();
      const reader = new FileReader();
      reader.onload = function(e) {
        img.onload = function() {
          if (img.width > 400 || img.height > 400) {
            alert('La imagen supera los 400x400px. Por favor, súbela más pequeña.');
            imagenInput.value = '';
            previewImg.src = '';
            return;
          }
          previewImg.src = e.target.result;
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(archivo);
    });

    canvas.addEventListener('mousedown', () => drawing = true);
    canvas.addEventListener('mouseup', () => drawing = false);
    canvas.addEventListener('mouseleave', () => drawing = false);
    canvas.addEventListener('mousemove', e => {
      if (!drawing) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      ctx.fillStyle = colorPicker.value;
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    });


muralContainer.addEventListener('touchstart', e => {
  if (e.touches.length === 1) {
    // Empieza desplazamiento con un dedo
    isDragging = true;
    const touch = e.touches[0];
    startX = touch.clientX - posX;
    startY = touch.clientY - posY;
    muralContainer.style.cursor = 'grabbing';
  } else if (e.touches.length === 2) {
    // Empieza gesto de zoom con dos dedos
    isDragging = false;
    isPinching = true;
    initialDistance = getDistance(e.touches[0], e.touches[1]);
    initialScale = scale;
  }
}, { passive: false });

muralContainer.addEventListener('touchmove', e => {
  if (isDragging && e.touches.length === 1) {
    const touch = e.touches[0];
    posX = touch.clientX - startX;
    posY = touch.clientY - startY;
    updateTransform();
  } else if (isPinching && e.touches.length === 2) {
    e.preventDefault();
    const newDistance = getDistance(e.touches[0], e.touches[1]);
    const scaleChange = newDistance / initialDistance;
    scale = Math.min(2, Math.max(0.4, initialScale * scaleChange));
    updateTransform();
  }
}, { passive: false });

muralContainer.addEventListener('touchend', e => {
  if (e.touches.length < 2) {
    isDragging = false;
    isPinching = false;
    muralContainer.style.cursor = 'grab';
  }
});



    function limpiarCanvas() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    async function agregarAlMural() {
  const tipoSeleccionado = tipo.value;
  const token = localStorage.getItem('token');

  if (!token) {
    alert('Debes iniciar sesión para usar el mural.');
    throw new Error('Token no encontrado');
  }

  // 🚫 Verificamos si el usuario está suspendido
  if (estaSuspendido()) {
    alert('Estás suspendido por 30 minutos por lenguaje inapropiado.');
    return;
  }

  let contenidoFinal = '';

  if (tipoSeleccionado === 'frase' || tipoSeleccionado === 'emoji') {
    if (!contenido.value.trim()) {
      return alert('Escribe algo primero.');
    }

    const texto = contenido.value.trim();

    // 🧠 Verificamos si contiene palabras prohibidas
    if (contienePalabraProhibida(texto)) {
      const fin = Date.now() + tiempoSuspension;
      localStorage.setItem('momentoSuspension', fin.toString());
      alert('Has usado palabras prohibidas y estás suspendido por 30 minutos.');
      return;
    }

    contenidoFinal = texto;
    contenido.value = '';
  }

  else if (tipoSeleccionado === 'imagen') {
    const archivo = imagenInput.files[0];
    if (!archivo) return alert('Selecciona una imagen.');

    const formData = new FormData();
    formData.append('imagen', archivo);
    formData.append('usuario', usuario);

    try {
      const res = await fetch('https://momento-backend-production.up.railway.app/api/mural/image', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error subiendo imagen.');
      }

      mostrarAporte(data.data);
      imagenInput.value = '';
      previewImg.src = '';
      preview.style.display = 'none';

    } catch (err) {
      console.error('Error al subir imagen:', err);
      alert('La imagen fue rechazada o hubo un error.');
    }

    return;
  }

  else if (tipoSeleccionado === 'doodle') {
    contenidoFinal = canvas.toDataURL();
    limpiarCanvas();
  }

  await enviarAlBackend(usuario, tipoSeleccionado, contenidoFinal);
}


  async function enviarAlBackend(usuario, tipo, contenido) {
  const token = localStorage.getItem('token');
if (!token) {
  alert('Debes iniciar sesión para usar el mural.');
  throw new Error('Token no encontrado');
}


  try {
    const res = await fetch('https://momento-backend-production.up.railway.app/api/mural', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ tipo, contenido })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'No se pudo guardar el aporte');

    mostrarAporte(data.data);
  } catch (err) {
    alert(err.message);
    console.error('Error guardando en el mural:', err);
  }
}


function mostrarAporte({ _id, tipo, contenido, usuario }) {
  if (aportesMostrados.has(_id)) return; // ✅ Evita duplicados

  aportesMostrados.add(_id); // ✅ Marca este aporte como ya mostrado

  const nuevo = document.createElement('div');
  nuevo.classList.add('mural-item');
  nuevo.id = `aporte-${_id}`;

  const { offsetWidth: w, offsetHeight: h } = mural;
  const x = Math.floor(Math.random() * (w - 200));
  const y = Math.floor(Math.random() * (h - 200));
  const rot = `${Math.floor(Math.random() * 10 - 5)}deg`;
  const scale = `${0.95 + Math.random() * 0.1}`;
  nuevo.style.left = `${x}px`;
  nuevo.style.top = `${y}px`;
  nuevo.style.setProperty('--rot', rot);
  nuevo.style.setProperty('--scale', scale);
  nuevo.title = `Aporte de: ${usuario}`;

  if (tipo === 'frase') {
    nuevo.classList.add('frase');
    nuevo.textContent = contenido;
  } else if (tipo === 'emoji') {
    nuevo.classList.add('emoji');
    nuevo.textContent = contenido;
  } else if (tipo === 'imagen' || tipo === 'doodle') {
    const img = new Image();
    img.src = contenido;
    img.onload = () => mural.appendChild(nuevo);
    nuevo.appendChild(img);
  }

  mural.appendChild(nuevo);
}



cargarAportes();

// Reemplazar esta parte en cargarAportes()
async function cargarAportes() {
  try {
    mural.innerHTML = '';
    aportesMostrados.clear(); // ✅ También limpiamos el Set
    
    const res = await fetch('https://momento-backend-production.up.railway.app/api/mural/today');
    const datos = await res.json();

console.log('🧩 Aportes recibidos:', datos); // ← Agrega esto
    console.log('👤 Usuario localStorage:', usuario);

    datos.forEach(aporte => mostrarAporte(aporte));
    mostrarMisAportes(datos); // ← NUEVO
  } catch (err) {
    console.error('Error al cargar el mural:', err);
  }
}



function cerrarMensaje() {
  const noMostrar = document.getElementById('noMostrarCheckbox').checked;
  if (noMostrar) {
    localStorage.setItem('noMostrarMensajeMural', 'true');
  }
  document.getElementById('modalOverlay').style.display = 'none';
}

// 🧠 Palabras prohibidas
const palabrasProhibidas = ['odio', 'muerte', 'estúpido', 'imbécil'];
const tiempoSuspension = 30 * 60 * 1000; // 30 minutos

function contienePalabraProhibida(texto) {
  const palabras = texto.toLowerCase().split(/\s+/);
  return palabrasProhibidas.some(prohibida => palabras.includes(prohibida));
}

function estaSuspendido() {
  const finSuspension = localStorage.getItem('momentoSuspension');
  return finSuspension && new Date().getTime() < parseInt(finSuspension);
}

// Mostrar aportes del usuario y sus tiempos restantes
function mostrarMisAportes(datos) {
  const contenedor = document.getElementById('listaMisAportes');
  contenedor.innerHTML = '';

  const token = localStorage.getItem('token');
if (!token) {
  alert('Debes iniciar sesión para usar el mural.');
  throw new Error('Token no encontrado');
}


  const ahora = new Date();

  datos
    .filter(aporte => aporte.usuario === usuario)
    .forEach(aporte => {
      const div = document.createElement('div');
      div.className = 'aporte-propio';

      const span = document.createElement('span');
      span.textContent = `• ${aporte.tipo}`;

      const tiempoRestante = document.createElement('div');
      tiempoRestante.className = 'tiempo-restante';
      const creado = new Date(aporte.fechaCreacion);
      const expiracion = new Date(creado.getTime() + 6 * 60 * 60 * 1000);
      const msRestantes = expiracion - ahora;

if (msRestantes <= 0) {
  tiempoRestante.textContent = '✅ Expirado';
} else {
  const minutos = Math.floor(msRestantes / 60000);
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;

  if (horas > 0) {
    tiempoRestante.textContent = `⏳ Quedan ${horas}h ${mins}min`;
  } else if (minutos > 5) {
    tiempoRestante.textContent = `⏳ Quedan ${minutos} min`;
  } else {
    tiempoRestante.textContent = '⏳ Últimos minutos';
  }
}

      const btnBorrar = document.createElement('button');
      btnBorrar.textContent = '✖';
      btnBorrar.className = 'borrar-aporte';
      btnBorrar.onclick = async () => {
  if (!confirm('¿Eliminar este aporte?')) return;

  const token = localStorage.getItem('token');
const res = await fetch(`https://momento-backend-production.up.railway.app/api/mural/${aporte._id}`, {
  method: 'DELETE',
  headers: {
    Authorization: `Bearer ${token}`
  }
});


  const data = await res.json();

  if (!res.ok) {
    alert(data.message || 'Error al eliminar.');
    return;
  }

  div.remove();
};


      div.appendChild(span);
      div.appendChild(btnBorrar);
      div.appendChild(tiempoRestante);
      contenedor.appendChild(div);
    });
}

async function cargarMisAportes() {
const token = localStorage.getItem('token');
if (!token) {
  alert('Debes iniciar sesión para usar el mural.');
  throw new Error('Token no encontrado');
}


  const lista = document.getElementById('listaAportesUsuario');
  lista.innerHTML = '';

  try {
    const res = await fetch('https://momento-backend-production.up.railway.app/api/mural/today');
    const datos = await res.json();
    const mios = datos.filter(a => a.usuario === usuario);

    mios.forEach(aporte => {
      const div = document.createElement('div');
      div.classList.add('aporte-usuario');

      const tipo = aporte.tipo === 'emoji' ? 'Emoji' :
                   aporte.tipo === 'frase' ? 'Frase' :
                   aporte.tipo === 'imagen' ? 'Imagen' : 'Doodle';

      const creado = new Date(aporte.fechaCreacion);
      const restante = 86400 - Math.floor((Date.now() - creado.getTime()) / 1000);
      const minutosRestantes = Math.floor(restante / 60);

      div.innerHTML = `
        <strong>${tipo}</strong><br/>
        ${aporte.tipo === 'frase' || aporte.tipo === 'emoji' ? aporte.contenido : ''}
        <div class="tiempo-restante">⏳ Quedan ${minutosRestantes} min</div>
        <button onclick="borrarAporte('${aporte._id}')">🗑 Eliminar</button>
      `;

      lista.appendChild(div);
    });

  } catch (err) {
    console.error('Error cargando aportes del usuario:', err);
  }
}

async function eliminarAporte(id, divElemento) {
  const token = localStorage.getItem('token');
if (!token) {
  alert('Debes iniciar sesión para usar el mural.');
  throw new Error('Token no encontrado');
}



  const confirmacion = confirm('¿Estás seguro de eliminar este aporte?');
  if (!confirmacion) return;

  try {
    const res = await fetch(`https://momento-backend-production.up.railway.app/api/mural/${id}`, {
      method: 'DELETE',
      headers: {
    Authorization: `Bearer ${token}`
  }
});

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Error al eliminar');

    // Eliminar visualmente el aporte del DOM
    divElemento.remove();
  } catch (err) {
    alert(err.message);
    console.error(err);
  }
}

window.addEventListener('beforeunload', () => {
  const token = localStorage.getItem('tokenMomento');
  if (!token) return;

  fetch('/api/ping', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    keepalive: true
  });
});

window.addEventListener('DOMContentLoaded', () => {
  if (!verificarToken()) return;
  usuario = obtenerUsuarioDesdeToken();
  console.log('👤 Usuario:', usuario);

  const btnFormulario   = document.getElementById('btnFormulario');
const btnMisAportes   = document.getElementById('btnMisAportes');
const panelFormulario = document.querySelector('.formulario.flotante');
const panelMisAportes = document.getElementById('misAportes');

function cerrarTodosLosPopovers() {
  panelFormulario.classList.remove('mostrar');
  panelMisAportes.classList.remove('mostrar');
}

function togglePanel(panel) {
  if (panel.classList.contains('mostrar')) {
    panel.classList.remove('mostrar');
  } else {
    // Forzar reflow para que sí ocurra la transición
    panel.classList.remove('mostrar');
    void panel.offsetWidth; // <- Esto reinicia el estilo del DOM
    panel.classList.add('mostrar');
  }
}


btnFormulario.addEventListener('click', e => {
  e.stopPropagation();
  togglePanel(panelFormulario);
});

btnMisAportes.addEventListener('click', e => {
  e.stopPropagation();
  togglePanel(panelMisAportes);
});

document.addEventListener('click', e => {
  if (
    !e.target.closest('.formulario.flotante') &&
    !e.target.closest('#misAportes') &&
    !e.target.closest('#footerButtons')
  ) cerrarTodosLosPopovers();
});


  document.addEventListener('click', e => {
    if (
      !e.target.closest('.formulario.flotante') &&
      !e.target.closest('#misAportes') &&
      !e.target.closest('#footerButtons')
    ) cerrarTodosLosPopovers();
  });

  // 👇 Este bloque ya cubre lo que estaba en el DOMContentLoaded duplicado
  if (window.innerWidth <= 600) {
    document.getElementById('toggleUIBtn').style.display = 'block';
  }
  if (!localStorage.getItem('noMostrarMensajeMural')) {
    document.getElementById('mensajeInicial').style.display = 'block';
  }

  // ✅ Finalmente, carga los aportes
  cargarAportes();
});







