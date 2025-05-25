// main.js
const API = 'https://momento-backend-production.up.railway.app';

/**
 * Comprueba si hay sesión activa (cookie JWT) en el backend.
 * @returns {Promise<boolean>}
 */
async function checkSession() {
  try {
    const res = await fetch(`${API}/api/auth/session`, {
      method: 'GET',
      credentials: 'include'
    });
    return res.ok;
  } catch (err) {
    console.error('Error comprobando sesión:', err);
    return false;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const uploadForm = document.getElementById('image-upload-form');
  const gallery    = document.getElementById('gallery');
  const logoutBtn  = document.getElementById('logout-btn');
  const mensaje    = document.getElementById('mensaje');

  // 1) Validar sesión al cargar
  const sessionValid = await checkSession();
  if (!sessionValid) {
    // Redirige al login y reemplaza historial
    return window.location.replace('login.html');
  }

  // 2) Logout limpia cookie en backend
  logoutBtn.addEventListener('click', async () => {
    await fetch(`${API}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    window.location.replace('login.html');
  });

  // 3) Subida de imágenes
  uploadForm.addEventListener('submit', async e => {
    e.preventDefault();
    const fileInput = document.getElementById('image');
    if (!fileInput.files.length) {
      mensaje.textContent = 'Debes seleccionar una imagen';
      return;
    }

    const formData = new FormData();
    formData.append('imagen', fileInput.files[0]);

    try {
      const res = await fetch(`${API}/api/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) {
        mensaje.textContent = data.error || 'Error al subir la imagen';
        return;
      }
      mensaje.textContent = data.mensaje;
      uploadForm.reset();
      loadGallery();
    } catch (err) {
      console.error('Error al subir imagen:', err);
      mensaje.textContent = 'Error de conexión al subir imagen';
    }
  });

  // 4) Cargar galería
  async function loadGallery() {
    try {
      const res = await fetch(`${API}/api/imagenes`, {
        method: 'GET',
        credentials: 'include'
      });
      if (!res.ok) {
        // Sesión expirada
        return window.location.replace('login.html');
      }
      const imgs = await res.json();
      gallery.innerHTML = '';
      imgs.forEach(img => {
        const card = document.createElement('div');
        card.className = 'image-card';

        const image = document.createElement('img');
        image.src = `${API}/uploads/${encodeURIComponent(img.filename)}`;
        image.alt = `Imagen de ${img.usuario}`;

        const label = document.createElement('div');
        label.className = 'polaroid-label';
        label.textContent = `${img.usuario} — ${new Date(img.fechaSubida).toLocaleDateString()}`;

        const info = document.createElement('div');
        info.className = 'image-info';
        info.textContent =
          `Subida: ${new Date(img.fechaSubida).toLocaleTimeString()}  Expira: ${new Date(img.expiraEn).toLocaleTimeString()}`;

        const delBtn = document.createElement('button');
        delBtn.textContent = '🗑️ Eliminar';
        delBtn.onclick = async () => {
          if (!confirm('¿Deseas eliminar esta imagen?')) return;
          await fetch(`${API}/api/eliminar/${encodeURIComponent(img.filename)}`, {
            method: 'DELETE',
            credentials: 'include'
          });
          loadGallery();
        };

        card.append(image, label, info, delBtn);
        gallery.appendChild(card);
      });
    } catch (err) {
      console.error('Error cargando galería:', err);
      mensaje.textContent = 'Error cargando la galería';
    }
  }

  // Carga inicial
  loadGallery();
});
