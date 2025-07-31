import {
  obtenerAportes,
  crearAporte,
  crearComentario,
  eliminarAporte
} from './aportes.js';

import {
  renderAportes
} from './muralCanvas.js'; // Suponiendo que aquí se renderiza visualmente

import {
  toggleFormularioAporte,
  toggleFormularioComentario,
  toggleMisAportes
} from './interaccion.js';

import {
  esTextoValido,
  mostrarError,
  mostrarExito
} from './utils.js';

import {
  iniciarTemporizadorDeSesion,
  logout
} from './session.js'; // Aquí estás manejando la sesión, por eso no usamos auth.js directamente

(async () => {
  const token = localStorage.getItem('userToken');
  const username = localStorage.getItem('username');

  if (!token || !username) {
    mostrarError('Tu sesión ha expirado. Por favor vuelve a ingresar.');
    window.location.href = 'index.html';
    return;
  }

  iniciarTemporizadorDeSesion(token);

  try {
    const aportes = await obtenerAportes(token);
    renderAportes(aportes, username);
  } catch (error) {
    mostrarError('Error al cargar el mural. Intenta más tarde.');
  }

  // Manejar el canvas si aplica
  // setupLienzo(); <-- si decides mover esto a muralCanvas.js

  const formAporte = document.getElementById('formularioAporte');
  if (formAporte) {
    formAporte.addEventListener('submit', async (e) => {
      e.preventDefault();
      const texto = formAporte.texto.value.trim();
      if (!esTextoValido(texto)) return mostrarError('Tu aporte está vacío.');

      try {
        await crearAporte(token, texto);
        formAporte.reset();
        mostrarExito('¡Aporte publicado!');
        const nuevosAportes = await obtenerAportes(token);
        renderAportes(nuevosAportes, username);
      } catch (err) {
        mostrarError('No se pudo publicar tu aporte.');
      }
    });
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }

  // Funciones globales para botones en HTML
  window.toggleFormularioAporte = toggleFormularioAporte;
  window.toggleFormularioComentario = toggleFormularioComentario;
  window.toggleMisAportes = toggleMisAportes;

  window.eliminarAporte = async function (id) {
    try {
      await eliminarAporte(token, id);
      mostrarExito('Aporte eliminado.');
      const nuevosAportes = await obtenerAportes(token);
      renderAportes(nuevosAportes, username);
    } catch (err) {
      mostrarError('Error al eliminar el aporte.');
    }
  };

  window.enviarComentario = async function (id, inputId) {
    const input = document.getElementById(inputId);
    const texto = input.value.trim();
    if (!esTextoValido(texto)) return mostrarError('Comentario vacío.');

    try {
      await crearComentario(token, id, texto);
      input.value = '';
      const nuevosAportes = await obtenerAportes(token);
      renderAportes(nuevosAportes, username);
    } catch (err) {
      mostrarError('Error al comentar.');
    }
  };
})();
