document.addEventListener('DOMContentLoaded', () => {
  const backendURL     = 'https://momento-backend-production.up.railway.app';
  const registerForm   = document.getElementById('register-form');
  const loginForm      = document.getElementById('login-form');
  const uploadForm     = document.getElementById('image-upload-form');
  const galleryDiv     = document.getElementById('gallery');
  const logoutBtn      = document.getElementById('logout-btn');
  const mensajeDiv     = document.getElementById('mensaje');
  let jwtToken         = localStorage.getItem('token') || null;

  // ===== Registro =====
  if (registerForm) {
    registerForm.onsubmit = async e => {
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
    };
    return;
  }

  // ===== Login =====
  if (loginForm) {
  loginForm.onsubmit = async e => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();
    mensajeDiv.textContent = '';

    if (!email || !password) {
      mensajeDiv.textContent = 'Ingresa correo y contraseña';
      return;
    }

    try {
      const res = await fetch(`${backendURL}/api/auth/login`, {  // CORREGIDO endpoint
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })  // SIN username
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        window.location.href = 'main.html';
      } else {
        mensajeDiv.textContent = data.error || 'Credenciales incorrectas';
      }
    } catch (err) {
      mensajeDiv.textContent = 'Error al iniciar sesión';
      console.error(err);
    }
  };
  return;
}


  // ===== Main (cargar galería y subir imagen) =====
  if (uploadForm && galleryDiv) {
    if (!jwtToken) return window.location.href = 'index.html';

    uploadForm.style.display = 'block';
    if (logoutBtn) logoutBtn.style.display = 'block';
    loadGallery();

    uploadForm.onsubmit = async e => {
      e.preventDefault();
      mensajeDiv.textContent = '';
      const file = document.getElementById('image').files[0];
      if (!file) return mensajeDiv.textContent = 'Selecciona una imagen';
      const formData = new FormData();
      formData.append('imagen', file);
      try {
        const res = await fetch(`${backendURL}/api/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${jwtToken}` },
          body: formData
        });
        const data = await res.json();
        mensajeDiv.textContent = data.mensaje || data.error;
        if (res.ok) loadGallery();
      } catch {
        mensajeDiv.textContent = 'Error de conexión';
      }
    };

    logoutBtn.onclick = () => {
      localStorage.removeItem('token');
      window.location.href = 'index.html';
    };

    async function loadGallery() {
      try {
        const res = await fetch(`${backendURL}/api/imagenes`);
        const imgs = await res.json();
        galleryDiv.innerHTML = '';
        imgs.forEach(img => {
          const card = document.createElement('div');
          card.className = 'image-card';

          const image = document.createElement('img');
          image.src = `${backendURL}/uploads/${img.filename}`;
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
          delBtn.onclick = () => eliminarImagen(img.filename, delBtn);

          const reportBtn = document.createElement('button');
          reportBtn.textContent = '🚩 Reportar';
          reportBtn.onclick = () => reportarImagen(img.filename, reportBtn);

          card.append(image, info, delBtn, reportBtn);
          galleryDiv.appendChild(card);
        });
      } catch (err) {
        console.error('Error cargando galería:', err);
      }
    }

    async function eliminarImagen(filename, btn) {
      btn.disabled = true;
      try {
        const res = await fetch(`${backendURL}/api/eliminar/${filename}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${jwtToken}` }
        });
        const data = await res.json();
        mensajeDiv.textContent = data.mensaje || data.error;
        if (res.ok) setTimeout(loadGallery, 300);
        else btn.disabled = false;
      } catch (err) {
        mensajeDiv.textContent = 'Error eliminando imagen';
        console.error(err);
        btn.disabled = false;
      }
    }

    async function reportarImagen(filename, btn) {
      btn.disabled = true;
      try {
        const res = await fetch(`${backendURL}/api/reportar`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ filename })
        });
        const data = await res.json();
        mensajeDiv.textContent = data.message || data.error || 'Respuesta inesperada';
        if (!res.ok) btn.disabled = false;
      } catch (err) {
        mensajeDiv.textContent = 'Error al reportar imagen';
        console.error(err);
        btn.disabled = false;
      }
    }
  }
});
