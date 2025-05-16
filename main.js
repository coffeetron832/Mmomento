document.addEventListener('DOMContentLoaded', () => {
  const backendURL = 'https://calm-aback-vacuum.glitch.me';
  const token = localStorage.getItem('token');
  const uploadForm = document.getElementById('image-upload-form');
  const gallery = document.getElementById('gallery');
  const logoutBtn = document.getElementById('logout-btn');

  if (!token) {
    alert('No estás autenticado');
    window.location.href = 'index.html';
    return;
  }

  logoutBtn.onclick = () => {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
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
    }
  };

  async function loadGallery() {
    try {
      const res = await fetch(`${backendURL}/api/imagenes`);
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
    }
  }

  loadGallery();
});
