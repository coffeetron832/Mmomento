lucide.createIcons();

let currentSlide = 0;
const slides = document.querySelectorAll('.modal-slide');

function cambiarSlide(direccion) {
  slides[currentSlide].classList.remove('active');
  currentSlide = (currentSlide + direccion + slides.length) % slides.length;
  slides[currentSlide].classList.add('active');
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
        body: JSON.stringify({ username })
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

document.getElementById('enviarCodigo').addEventListener('click', async () => {
  const correo = document.getElementById('correo').value;

  if (!correo) {
    alert('Por favor, ingresa un correo electrónico válido');
    return;
  }

  try {
    const res = await fetch('/api/send-verification-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ correo })
    });

    const data = await res.json();
    alert(data.message);
    document.getElementById('verificacion').style.display = 'none';
    document.getElementById('codigo-verificacion').style.display = 'block';

  } catch (error) {
    console.error(error);
    alert('Error al enviar el código');
  }
});

document.getElementById('verificarCodigo').addEventListener('click', async () => {
  const correo = document.getElementById('correo').value;
  const codigoIngresado = document.getElementById('codigo').value;

  try {
    const res = await fetch('/api/verify-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ correo, codigoIngresado })
    });

    const data = await res.json();
    alert(data.message);

    // Si el código es correcto, redirigir al mural
    if (data.token) {
      localStorage.setItem('authToken', data.token);
      window.location.href = '/mural.html'; // Redirige al mural después de la verificación
    }
  } catch (error) {
    console.error(error);
    alert('Código incorrecto o expirado');
  }
});



  
  // Cargar y configurar notificaciones
  cargarNotificaciones();
  configurarPanelNotificaciones();
});
