// modal.js

// Funciones globales para el modal de bienvenida
window.cerrarMensaje = function() {
  const overlay = document.getElementById("modalOverlay");
  const checkbox = document.getElementById("noMostrarCheckbox");
  if (checkbox?.checked) {
    localStorage.setItem("noMostrarModal", "true");
  }
  overlay?.classList.add("hidden");
};

window.abrirMensaje = function() {
  const overlay = document.getElementById("modalOverlay");
  if (localStorage.getItem("noMostrarModal") !== "true") {
    overlay?.classList.remove("hidden");
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("modalOverlay");
  // Solo abre si no está marcado para no mostrar
  abrirMensaje();

  // Cerrar al clicar fuera del contenido
  overlay?.addEventListener("click", e => {
    if (e.target === overlay) cerrarMensaje();
  });
});
