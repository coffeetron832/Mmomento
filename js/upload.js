// upload.js

// Mostrar año actual en el footer
const yearEl = document.getElementById('currentYear');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("uploadForm");
  const imagesContainer = document.getElementById("imagesContainer");
  const token = localStorage.getItem("token");

  // 🌙 Aplicar modo oscuro si está activado en localStorage
  const darkValue = localStorage.getItem('darkMode');
  const isDarkStored = darkValue === 'true' || darkValue === 'enabled'; // por compatibilidad
  if (isDarkStored) document.body.classList.add('dark-mode');

  // 🔘 Switch 3D de modo oscuro
  const toggleCheckbox = document.getElementById('toggleCheckbox');
  if (toggleCheckbox) {
    toggleCheckbox.checked = isDarkStored;
    toggleCheckbox.addEventListener('change', () => {
      const nowDark = document.body.classList.toggle('dark-mode');
      localStorage.setItem('darkMode', nowDark.toString());
    });
  }

  // 👋 Modal de bienvenida (solo una vez por sesión)
  const hasSeenModal = sessionStorage.getItem('hasSeenModal') === 'true';
  const modal = document.getElementById('welcomeModal');
  const closeModalBtn = document.getElementById('closeModalBtn');

  if (!hasSeenModal && modal) {
    modal.style.display = 'flex';
    sessionStorage.setItem('hasSeenModal', 'true');
  }
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => modal.style.display = 'none');
  }

  // 🧠 Obtener datos del usuario
  let user = {};
  try {
    const stored = localStorage.getItem('user');
    user = stored && stored !== 'undefined' ? JSON.parse(stored) : {};
  } catch {
    console.warn('Usuario mal formado en localStorage');
  }
  const currentUserId = user._id || user.id || null;

  // 👋 Mostrar nombre del usuario
  const welcomeEl = document.getElementById('welcomeText');
  if (welcomeEl && user.name) welcomeEl.textContent = user.name;

  // ✅ Mostrar/ocultar selector de círculos
  const visibilitySelect = document.getElementById('visibility');
  const circleContainer = document.getElementById('circleSelectorContainer');
  if (visibilitySelect && circleContainer) {
    visibilitySelect.addEventListener('change', () => {
      if (visibilitySelect.value === 'circle') {
        circleContainer.style.display = 'block';
        loadUserCircles();
      } else {
        circleContainer.style.display = 'none';
      }
    });
  }

  // 🧩 Crear tarjeta de imagen
  function createImageCard(image) {
    const card = document.createElement('div');
    card.className = 'image-card';

    const img = document.createElement('img');
    img.src = image.imageUrl || image.url || '';
    img.alt = image.description || 'Imagen subida';

    const desc = document.createElement('p');
    desc.className = 'image-description';
    desc.textContent = image.description || '';

    const userInfo = document.createElement('p');
    userInfo.className = 'image-user';

    let ownerId = null;
    if (image.userId && typeof image.userId === 'object') {
      ownerId = image.userId._id || image.userId.id;
      userInfo.textContent = image.userId.username
        ? `Subido por: ${image.userId.username}`
        : 'Subido por: Anónimo';
    } else if (typeof image.userId === 'string') {
      ownerId = image.userId;
      userInfo.textContent = currentUserId === image.userId
        ? 'Subido por: Tú'
        : 'Subido por: Usuario desconocido';
    } else {
      userInfo.textContent = 'Subido por: Anónimo';
    }

    card.append(img, desc, userInfo);

    if (currentUserId && ownerId && currentUserId === ownerId.toString()) {
      const del = document.createElement('button');
      del.textContent = '🗑 Eliminar';
      del.className = 'delete-btn';
      del.addEventListener('click', () => deleteImage(image._id, card));
      card.appendChild(del);
    }
    return card;
  }

  // 🚫 Redirigir si no autenticado
  if (!token) {
    alert('Debes iniciar sesión');
    window.location.href = 'login.html';
    return;
  }

  // 🚀 Cargar imágenes
  async function loadImages() {
    try {
      const res = await fetch('https://momento-backend-production.up.railway.app/api/images/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al obtener imágenes');
      const imgs = await res.json();
      imagesContainer.innerHTML = '';
      imgs.forEach(i => imagesContainer.appendChild(createImageCard(i)));
    } catch (e) {
      console.error('Error cargando imágenes:', e);
      imagesContainer.innerHTML = "<p style='color:red;'>Error al cargar imágenes.</p>";
    }
  }

  // 🗑 Eliminar imagen
  async function deleteImage(id, el) {
    try {
      const res = await fetch(
        `https://momento-backend-production.up.railway.app/api/images/${id}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        alert('Imagen eliminada exitosamente');
        el.remove();
      } else {
        const data = await res.json();
        alert(data.error || 'Error al eliminar imagen');
      }
    } catch (e) {
      console.error('Error eliminando imagen:', e);
      alert('Error al eliminar la imagen');
    }
  }

  // 🔄 Cargar círculos del usuario
  async function loadUserCircles() {
    const select = document.getElementById('circles');
    if (!select) return;
    select.innerHTML = '<option disabled>Cargando círculos...</option>';
    try {
      const res = await fetch(
        `https://momento-backend-production.up.railway.app/api/circles/user/${currentUserId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error('Error al obtener círculos');
      const circles = await res.json();
      select.innerHTML = circles.length
        ? circles.map(c => `<option value="${c._id||c.id}">${c.name||'Círculo'}</option>`).join('')
        : '<option disabled>No tienes círculos</option>';
    } catch (e) {
      console.error('Error cargando círculos:', e);
      select.innerHTML = '<option disabled>Error cargando círculos</option>';
    }
  }

  // 📤 Envío del formulario
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const file = document.getElementById('image');
    if (!file.files.length) { alert('Selecciona una imagen'); return; }
    const data = new FormData(form);
    try {
      const res = await fetch(
        'https://momento-backend-production.up.railway.app/api/images/',
        { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: data }
      );
      const result = await res.json();
      if (res.ok) {
        alert('Imagen subida con éxito');
        form.reset();
        imagesContainer.prepend(createImageCard(result));
        document.getElementById('circleSelectorContainer').style.display = 'none';
      } else {
        alert(result.error || 'Error al subir la imagen');
      }
    } catch (e) {
      console.error('Error en subida de imagen:', e);
      alert('Error en la subida de la imagen');
    }
  });

  // Inicializar carga
  loadImages();
  window.loadUserCircles = loadUserCircles;
});
