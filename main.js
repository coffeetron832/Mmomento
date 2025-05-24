document.addEventListener('DOMContentLoaded', () => {
  const backendURL = 'https://calm-aback-vacuum.glitch.me';
  const token = localStorage.getItem('token');
  const uploadForm = document.getElementById('image-upload-form');
  const gallery = document.getElementById('gallery');
  const logoutBtn = document.getElementById('logout-btn');

  // Si no hay token, redirigir a login
  if (!token) {
    alert('No estás autenticado');
    // Reemplaza el historial para evitar que el usuario regrese a esta página con el botón atrás
    window.location.replace('index.html');
    return;
  }

  // Al cargar la página, reemplazar historial para que login no quede atrás
  history.replaceState(null, '', window.location.href);

  logoutBtn.onclick = () => {
    localStorage.removeItem('token');
    // Reemplazar para evitar que vuelva a main.html con atrás
    window.location.replace('index.html');
  };

  uploadForm.onsubmit = async e => {
    e.preventDefault();
    const file = document.getElementById('image').files[0];
    if (!file) return alert('Selecciona una imagen');

    const formData = new FormData();
    formData.append('imagen', file);

    try {
      const res = await fetch(`${backendURL}/api/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      alert(data.mensaje || data.error);
      if (res.ok) loadGallery();
    } catch (err) {
      alert('Error al subir imagen');
      console.error(err);
    }
  };

  async function loadGallery() {
    try {
      const res = await fetch(`${backendURL}/api/imagenes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        alert('Sesión expirada o error en la autenticación');
        localStorage.removeItem('token');
        window.location.replace('index.html');
        return;
      }

      const imgs = await res.json();
      gallery.innerHTML = '';

      imgs.forEach(file => {
        const img = document.createElement('img');
        img.src = `${backendURL}/uploads/${file}`;
        img.alt = file;
        gallery.appendChild(img);
      });
    } catch (err) {
      console.error('Error cargando galería:', err);
      alert('Error cargando la galería');
    }
  }

  loadGallery();
});

