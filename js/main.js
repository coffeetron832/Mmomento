import { verificarToken, obtenerUsuarioDesdeToken } from './aauth.js';
import { inicializarUI } from './ui.js';
import { setupZoom } from './zoom.js';
// importa los demás según los dividas

window.addEventListener('DOMContentLoaded', () => {
  if (!verificarToken()) return;

  const usuario = obtenerUsuarioDesdeToken();
  window.usuario = usuario; // o pásalo como parámetro

  inicializarUI();
  setupZoom();

  // iniciar otras funciones...
});
