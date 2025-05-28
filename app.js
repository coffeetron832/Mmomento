document.addEventListener('DOMContentLoaded', async () => {
  const backendURL = 'https://momento-backend-production.up.railway.app';
  const registerForm = document.getElementById('register-form');
  const loginForm = document.getElementById('login-form');
  const uploadForm = document.getElementById('image-upload-form');
  const galleryDiv = document.getElementById('gallery');
  const logoutBtn = document.getElementById('logout-btn');
  const mensajeDiv = document.getElementById('mensaje');

  function getAuthHeaders(isJson = true) {
    const headers = {};
    const token = localStorage.getItem('token');
    console.log('[DEBUG] getAuthHeaders → token en localStorage:', token);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (isJson) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  }

  async function checkSession() {
    console.log('[DEBUG] checkSession → llamando a /api/auth/session');
    try {
      const res = await fetch(`${backendURL}/api/auth/session`, {
        method: 'GET',
        headers: getAuthHeaders(false),
        credentials: 'include'
      });
      console.log('[DEBUG] checkSession → respuesta status:', res.status);
      return res.ok;
    } catch (err) {
      console.error('[DEBUG] checkSession → error:', err);
      return false;
    }
  }

  // ==== REGISTRO ====
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
        console.log('[DEBUG] Registro → enviando datos:', { username, email, password });
        const res = await fetch(`${backendURL}/api/auth/register`, {
          method: 'POST',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify({ username, email, password })
        });
        console.log('[DEBUG] Registro → status:', res.status);
        const data = await res.json();
        console.log('[DEBUG] Registro → respuesta JSON:', data);

        if (!res.ok) {
          mensajeDiv.textContent = data.error || data.errores?.[0]?.msg || 'Error en el registro';
          return;
        }

        if (!data.token) {
          console.error('[DEBUG] Registro → token no recibido');
          mensajeDiv.textContent = data.message || 'Registro exitoso, pero no se recibió token.';
          return;
        }

        localStorage.setItem('token', data.token);
        console.log('[DEBUG] Registro → token guardado:', localStorage.getItem('token'));
        console.log('[DEBUG] Registro → redirigiendo a main.html');
        window.location.replace('main.html');
      } catch (err) {
        mensajeDiv.textContent = 'Error al registrar usuario';
        console.error('[DEBUG] Registro → excepción:', err);
      }
    });
    return;
  }

  // ==== LOGIN ====
  if (loginForm) {
    if (await checkSession()) {
      console.log('[DEBUG] Login → sesión ya iniciada, redirigiendo a main.html');
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
        console.log('[DEBUG] Login → enviando credenciales:', { email, password });
        const res = await fetch(`${backendURL}/api/auth/login`, {
          method: 'POST',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify({ email, password })
        });
        console.log('[DEBUG] Login → status:', res.status);
        const data = await res.json();
        console.log('[DEBUG] Login → respuesta JSON:', data);

        if (!res.ok) {
          mensajeDiv.textContent = data.error || 'Credenciales incorrectas';
          return;
        }

        if (!data.token) {
          console.error('[DEBUG] Login → token no recibido');
          mensajeDiv.textContent = 'Inicio de sesión exitoso, pero no se recibió token.';
          return;
        }

        localStorage.setItem('token', data.token);
        console.log('[DEBUG] Login → token guardado:', localStorage.getItem('token'));
        console.log('[DEBUG] Login → redirigiendo a main.html');
        window.location.replace('main.html');
      } catch (err) {
        mensajeDiv.textContent = 'Error al iniciar sesión';
        console.error('[DEBUG] Login → excepción:', err);
      }
    });
    return;
  }

  // ==== MAIN (GALERÍA Y SUBIDA) ====
  if (uploadForm && galleryDiv) {
    if (!(await checkSession())) {
      console.log('[DEBUG] Main → sesión no válida, redirigiendo a login.html');
      return window.location.replace('login.html');
    }

    uploadForm.style.display = 'block';
    logoutBtn.style.display = 'block';

    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      console.log('[DEBUG] Logout → token eliminado');
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
        console.log('[DEBUG] Subida → enviando imagen');
        const res = await fetch(`${backendURL}/api/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          credentials: 'include',
          body: formData
        });
        console.log('[DEBUG] Subida → status:', res.status);
        const data = await res.json();
        console.log('[DEBUG] Subida → respuesta JSON:', data);
        mensajeDiv.textContent = data.mensaje || data.error;
        if (res.ok) loadGallery();
      } catch (err) {
        mensajeDiv.textContent = 'Error de conexión';
        console.error('[DEBUG] Subida → excepción:', err);
      }
    });

    async function loadGallery() {
      try {
        console.log('[DEBUG] loadGallery → solicitando imágenes');
        const res = await fetch(`${backendURL}/api/imagenes`, {
          method: 'GET',
          headers: getAuthHeaders(false),
          credentials: 'include'
        });
        console.log('[DEBUG] loadGallery → status:', res.status);
        if (!res.ok) {
          console.log('[DEBUG] loadGallery → sesión inválida, redirigiendo a login.html');
          return window.location.replace('login.html');
        }
        const imgs = await res.json();
        console.log('[DEBUG] loadGallery → imágenes recibidas:', imgs);
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
            console.log('[DEBUG] Eliminar → filename:', img.filename);
            await fetch(`${backendURL}/api/eliminar/${encodeURIComponent(img.filename)}`, {
              method: 'DELETE',
              headers: getAuthHeaders(false),
              credentials: 'include'
            });
            loadGallery();
          };

          const reportBtn = document.createElement('button');
          reportBtn.textContent = '🚩 Reportar';
          reportBtn.onclick = async () => {
            console.log('[DEBUG] Reportar → filename:', img.filename);
            await fetch(`${backendURL}/api/reportar`, {
              method: 'POST',
              headers: getAuthHeaders(),
              credentials: 'include',
              body: JSON.stringify({ filename: img.filename })
            });
            alert('Reportado');
          };

          card.append(image, info, delBtn, reportBtn);
          galleryDiv.appendChild(card);
        });
      } catch (err) {
        console.error('[DEBUG] loadGallery → excepción:', err);
        mensajeDiv.textContent = 'Error cargando la galería';
      }
    }

    loadGallery();
  }
});
