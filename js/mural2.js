lucide.createIcons();

window.cerrarModal = function () {
  const modal = document.getElementById("modalRespuestas");
  if (modal) {
    modal.classList.add("hidden");
  }
}



document.addEventListener("DOMContentLoaded", async () => {
  const API_BASE_URL = 'https://themural-backend-production.up.railway.app';

  let username = localStorage.getItem('username');
  let token = localStorage.getItem('authToken');

  // ✅ Si no hay username, redirige
  if (!username) {
    return window.location.href = '/index.html';
  }

  // ✅ Si no hay token, intenta generarlo
  if (!token) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/token/generate-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ correo: username })
      });

      if (!res.ok) throw new Error("Error generando token");

      const data = await res.json();
      token = data.token;
      localStorage.setItem('authToken', token);
    } catch (err) {
      console.error("❌ Error generando token:", err);
      return window.location.href = '/index.html';
    }
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
        li.innerHTML = `<strong>${notif.sender?.username || "Usuario"}:</strong> ${notif.message}`;
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

  // ✅ Cargar aportes del usuario y mostrarlos
  async function cargarMisAportes() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/mural/mios?user=${encodeURIComponent(username)}`);
    if (!res.ok) throw new Error("No se pudieron cargar tus aportes.");

    const result = await res.json();
    const aportes = result.data || []; // ← Extraemos el array del objeto

    const container = document.getElementById("listaMisAportes");
    if (!container) return;

    container.innerHTML = "";

    if (aportes.length === 0) {
      container.innerHTML = "<p>No has hecho ningún aporte aún.</p>";
      return;
    }

    aportes.forEach((aporte) => {
      const div = document.createElement("div");
      div.className = "aporte-item p-2 border-b border-gray-300";
      div.innerHTML = `
  <p><strong>Contenido:</strong> ${aporte.contenido}</p>
  <p><strong>Estado:</strong> ${aporte.estado}</p>
  <p><small>${new Date(aporte.createdAt).toLocaleString()}</small></p>
`;

      container.appendChild(div);
    });
  } catch (err) {
    console.error("❌ Error mostrando tus aportes:", err);
  }
}


  // 🔄 Llamar la función al cargar la página
  cargarMisAportes();
});
