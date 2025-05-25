// app.js
document.addEventListener('DOMContentLoaded', async () => {
  const backendURL = 'https://momento-backend-production.up.railway.app';
  const registerForm = document.getElementById('register-form');
  const loginForm    = document.getElementById('login-form');
  const uploadForm   = document.getElementById('image-upload-form');
  const galleryDiv   = document.getElementById('gallery');
  const logoutBtn    = document.getElementById('logout-btn');
  const mensajeDiv   = document.getElementById('mensaje');

  // Helper: verifica sesión con cookie
  async function checkSession() {
    try {
      const res = await fetch(`${backendURL}/api/auth/session`, {
        method: 'GET',
        credentials: 'include'
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  // ===== Registro =====
  if (registerForm) {
    registerForm.addEventListener('submit', async e => {
      e.preventDefault();
      const username = document.getElementById('reg-username').value.trim();
      const email    = document.getElementById('reg-email').value.trim();
      const password = document.getElementById('reg-password').value.trim();
      mensajeDiv.textContent = '';

      if (!username || !email || !password) {
        mensajeDiv.textContent = 'Todos los campos son obligatorios';
        return;
      }

      try {
        const res = await fetch(`${backendURL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password })
        });
        const data = await res.json();
        mensajeDiv.textContent = data.message || data.error || 'Respuesta inesperada';
      } catch (err) {
        mensajeDiv.textContent = 'Error al registrar usuario';
        console.error(err);
      }
    });
    return;
  }

  // ===== Login =====
  if (loginForm) {
    // Si ya hay sesión activa, redirige
    if (await checkSession()) {
      return window.location.replace('main.html');
    }

    loginForm.addEventListener('submit', async e => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value.trim();
      mensajeDiv.textContent = '';

      if (!email || !password) {
        mensajeDiv.textContent = 'Ingresa correo y contraseña';
        return;
      }

      try {
        const res = await fetch(`${backendURL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',  // ¡importante para que guarde la cookie!
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (!res.ok) {
          mensajeDiv.textContent = data.error || 'Credenciales incorrectas';
          return;
        }
        // Login exitoso → redirige y reemplaza historial
        window.location.replace('main.html');
      } catch (err) {
        mensajeDiv.textContent = 'Error al iniciar sesión';
        console.error(err);
      }
    });
    return;
  }

  // ===== Main (cargar galería y subir imagen) =====
  if (uploadForm && galleryDiv) {
    // 1) Verificar sesión al cargar
    if (!(await checkSession())) {
      return window.location.replace('login.html');
    }

    // 2) Mostrar formularios
    uploadForm.style.display = 'block';
    logoutBtn.style.display = 'block';

    // 3) Logout
    logoutBtn.addEventListener('click', async () => {
      await fetch(`${backendURL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      window.location.replace('login.html');
    });

    // 4) Subida de imágenes
    uploadForm.addEventListener('submit', async e => {
      e.preventDefault();
      mensajeDiv.textContent = '';
      const file = document.getElementById('image').files[0];
      if (!file) {
        mensajeDiv.textContent = 'Selecciona una imagen';
        return;
      }
      const formData = new FormData();
      formData.append('imagen', file);

      try {
        const res = await fetch(`${backendURL}/api/upload`, {
          method: 'POST',
          credentials: 'include',
          body: formData
        });
        const data = await res.json();
        mensajeDiv.textContent = data.mensaje || data.error;
        if (res.ok) loadGallery();
      } catch (err) {
        mensajeDiv.textContent = 'Error de conexión';
        console.error(err);
      }
    });

    // 5) Cargar galería
    async function loadGallery() {
      try {
        const res = await fetch(`${backendURL}/api/imagenes`, {
          method: 'GET',
          credentials: 'include'
        });
        if (!res.ok) {
          // Sesión expirada o problema
          return window.location.replace('login.html');
        }
        const imgs = await res.json();
        galleryDiv.innerHTML = '';
        imgs.forEach(img => {
          const card = document.createElement('div');
          card.className = 'image-card';

          const image = document.createElement('img');
          image.src = `${backendURL}/uploads/${encodeURIComponent(img.filename)}`;
          image.alt = img.filename;

          const info = document.createElement('div');
          info.className = 'image-info';
          info.innerHTML = `
            <strong>${img.usuario}</strong><br>
            <span>Subida: ${new Date(img.fechaSubida).toLocaleString()}</span><br>
            <span>Expira: ${new Date(img.expiraEn).toLocaleString()}</span>
          `;

          const delBtn = document.createElement('button');
          delBtn.textContent = '🗑️ Eliminar';
          delBtn.onclick = async () => {
            if (!confirm('¿Seguro que deseas eliminar esta imagen?')) return;
            await fetch(`${backendURL}/api/eliminar/${encodeURIComponent(img.filename)}`, {
              method: 'DELETE',
              credentials: 'include'
            });
            loadGallery();
          };

          const reportBtn = document.createElement('button');
          reportBtn.textContent = '🚩 Reportar';
          reportBtn.onclick = async () => {
            await fetch(`${backendURL}/api/reportar`, {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ filename: img.filename })
            });
            alert('Reportado');
          };

          card.append(image, info, delBtn, reportBtn);
          galleryDiv.appendChild(card);
        });
      } catch (err) {
        console.error('Error cargando galería:', err);
        mensajeDiv.textContent = 'Error cargando la galería';
      }
    }

    // 6) Carga inicial
    loadGallery();
  }
});
