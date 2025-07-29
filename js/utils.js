// Sanitiza cualquier texto para evitar XSS
export function sanitize(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Formatea una fecha al estilo colombiano
export function formatearFecha(fechaStr) {
  const fecha = new Date(fechaStr);
  return fecha.toLocaleString('es-CO', {
    dateStyle: 'short',
    timeStyle: 'short'
  });
}

// Valida que un texto no esté vacío o solo espacios
export function esTextoValido(texto) {
  return texto && texto.trim().length > 0;
}

// Muestra una alerta elegante (puedes reemplazar con un toast si usas una librería)
export function mostrarError(msg) {
  alert(`❌ ${msg}`);
}

// Muestra un mensaje de éxito
export function mostrarExito(msg) {
  alert(`✅ ${msg}`);
}
