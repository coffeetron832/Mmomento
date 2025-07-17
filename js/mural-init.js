// mural-init.js

document.addEventListener('DOMContentLoaded', () => {
  console.log('🧠 Mural iniciado');

  // Verifica si los módulos están correctamente cargados
  if (!document.getElementById('mural')) {
    console.warn('⚠️ No se encontró el contenedor del mural');
    return;
  }

  // Puedes dejar aquí funciones globales si lo necesitas en el futuro
  // Por ejemplo, limpieza del formulario, reinicio de elementos, etc.
});
