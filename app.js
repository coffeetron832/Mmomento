document.addEventListener('DOMContentLoaded', async () => {
  const backendURL = 'https://momento-backend-production.up.railway.app';
  const registerForm = document.getElementById('register-form');
  const loginForm = document.getElementById('login-form');
  const uploadForm = document.getElementById('image-upload-form');
  const galleryDiv = document.getElementById('gallery');
  const logoutBtn = document.getElementById('logout-btn');
  const mensajeDiv = document.getElementById('mensaje');

  // Función para obtener headers
  function getAuthHeaders(isJson = true) {
    const headers = {};
    if (isJson) headers['Content-Type'] = 'application/json';
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  // Verifica sesión con token
  async function checkSession() {
    try {
      const res = await fetch(`${backendURL}/api/auth/session`, {
        method: 'GET',
        headers: getAuthHeaders(false),
        credentials: 'include'  // <--- importante para CORS con credenciales
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
      const email = document.getElementById('reg-email').value.trim();
      const password = document.getElementById('reg-password').value.trim();
      mensajeDiv.textContent = '';

      if (!username || !email || !password) {
        mensajeDiv.textContent = 'Todos los campos son obligatorios';
        return;
      }

      try {
        const res = await fetch(`${backendURL}/api/auth/register`, {
          method: 'POST',
          headers: getAuthHeaders(),
          credentials: 'include',  // <--- aquí también
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
          headers: getAuthHeaders(),
          credentials: 'include',  // <--- y aquí también
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (!res.ok) {
          mensajeDiv.textContent = data.error || 'Credenciales incorrectas';
          return;
        }
        // Guarda JWT en localStorage
        localStorage.setItem('token', data.token);
        window.location.replace('main.html');
      } catch (err) {
        mensajeDiv.textContent = 'Error al iniciar sesión';
        console.error(err);
      }
    });
    return;
  }

  // ===== Main (subir imagen, cargar galería) =====
  if (uploadForm && galleryDiv) {
    if (!(await checkSession())) {
      return window.location.replace('login.html');
    }

    uploadForm.style.display = 'block';
    logoutBtn.style.display = 'block';

    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.replace('login.html');
    });

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
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          credentials: 'include',  // <--- importante
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

    async function loadGallery() {
      try {
        const res = await fetch(`${backendURL}/api/imagenes`, {
          method: 'GET',
          headers: getAuthHeaders(false),
          credentials: 'include'  // <--- importante
        });
        if (!res.ok) {
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
              headers: getAuthHeaders(false),
              credentials: 'include'  // <--- importante
            });
            loadGallery();
          };

          const reportBtn = document.createElement('button');
          reportBtn.textContent = '🚩 Reportar';
          reportBtn.onclick = async () => {
            await fetch(`${backendURL}/api/reportar`, {
              method: 'POST',
              headers: getAuthHeaders(),
              credentials: 'include',  // <--- importante
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

    loadGallery();
  }
});


    loadGallery();
  }
});

