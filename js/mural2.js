lucide.createIcons();

let currentSlide = 0;
const slides = document.querySelectorAll('.modal-slide');

function cambiarSlide(direccion) {
  slides[currentSlide].classList.remove('active');
  currentSlide = (currentSlide + direccion + slides.length) % slides.length;
  slides[currentSlide].classList.add('active');
}

document.addEventListener("DOMContentLoaded", () => {
  const API_BASE_URL = 'https://themural-backend-production.up.railway.app';

  // ✅ Verificar que haya username y token
  const username = localStorage.getItem('username');
  const token = localStorage.getItem('authToken');

  if (!username || !token) {
    return window.location.href = '/index.html';
  }

  // ===== Notificaciones =====
  async function cargarNotificaciones() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Error al obtener notificaciones: ${res.status} - ${text}`);
      }

      const data = await res.json();
      const notifList = document.getElementById("notifList");
      const notifBadge = document.getElementById("notifBadge");

      if (!notifList || !notifBadge) return;

      notifList.innerHTML = "";

      if (data.length > 0) {
        notifBadge.textContent = `(${data.length})`;
      } else {
        notifBadge.textContent = "";
      }

      data.forEach((notif) => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${notif.sender.username}:</strong> ${notif.message}`;
        notifList.appendChild(li);
      });

    } catch (err) {
      console.error("Error al cargar notificaciones:", err);
    }
  }

  // Alternar panel
  function configurarPanelNotificaciones() {
    const btn = document.getElementById("notifBtn");
    const panel = document.getElementById("notifPanel");

    if (!btn || !panel) return;

    btn.addEventListener("click", () => {
      panel.classList.toggle("hidden");

      if (!panel.classList.contains("hidden")) {
        const badge = document.getElementById("notifBadge");
        if (badge) badge.textContent = "";
      }
    });
  }

  // ✅ Mostrar mensaje de bienvenida
  const banner = document.getElementById("welcome-banner");
  const message = localStorage.getItem("welcomeBackMessage");

  if (message && banner) {
    banner.textContent = message;
    banner.classList.remove("hidden");
    banner.classList.add("fade-in");

    localStorage.removeItem("welcomeBackMessage");

    setTimeout(() => banner.classList.add("fade-out"), 3000);
    setTimeout(() => banner.remove(), 4000);
  }

  // 🔓 Cerrar sesión simple
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      const username = localStorage.getItem('username');
      localStorage.clear();
      if (username) localStorage.setItem('username', username); // opcional
      history.replaceState(null, null, "/index.html");
      window.location.href = "/index.html";
    });
  }

  // Cargar y configurar notificaciones
  cargarNotificaciones();
  configurarPanelNotificaciones();
});
