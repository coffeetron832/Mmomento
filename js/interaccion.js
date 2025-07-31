// interaccion.js

// Muestra u oculta el formulario de aportes
export function toggleFormularioAporte() {
  const form = document.getElementById('formularioAporte');
  form.classList.toggle('visible');
}

// Muestra u oculta el formulario de comentarios
export function toggleFormularioComentario(id) {
  const form = document.querySelector(`#formularioComentario[data-id='${id}']`);
  if (form) {
    form.classList.toggle('visible');
  }
}

// Muestra u oculta el panel de "Mis aportes"
export function toggleMisAportes() {
  const panel = document.getElementById('misAportesPanel');
  panel.classList.toggle('visible');
}

// Muestra una alerta temporal
export function mostrarAlerta(texto, tipo = 'info') {
  const alerta = document.createElement('div');
  alerta.className = `alerta alerta-${tipo}`;
  alerta.textContent = texto;

  document.body.appendChild(alerta);
  setTimeout(() => {
    alerta.remove();
  }, 3000);
}
