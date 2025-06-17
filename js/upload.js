document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("uploadForm");
  const imagesContainer = document.getElementById("imagesContainer");
  const token = localStorage.getItem("token");

  // 🔘 Switch modo oscuro
  const toggleCheckbox = document.getElementById('darkModeToggle');
  if (toggleCheckbox) {
    toggleCheckbox.checked = isDarkStored;
    toggleCheckbox.addEventListener('change', () => {
      const nowDark = document.body.classList.toggle('dark-mode');
      localStorage.setItem('darkMode', nowDark.toString());
    });
  }

  // 👋 Modal de bienvenida
  const hasSeenModal = sessionStorage.getItem('hasSeenModal') === 'true';
  const modal = document.getElementById('welcomeModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  if (!hasSeenModal && modal) {
    modal.style.display = 'flex';
    sessionStorage.setItem('hasSeenModal', 'true');
  }
  if (closeModalBtn) closeModalBtn.addEventListener('click', () => modal.style.display = 'none');

  // ⚙️ Enlace a Soulprint
  const soulprintBtn = document.getElementById('soulprintBtn');
  const username = localStorage.getItem('username');
  if (soulprintBtn && username) soulprintBtn.href = `/soulprint.html?user=${username}`;

  // 👤 Usuario
  let user = {};
  try {
    const stored = localStorage.getItem('user');
    user = stored && stored !== 'undefined' ? JSON.parse(stored) : {};
  } catch {
    console.warn('Usuario mal formado en localStorage');
  }
  const currentUserId = user._id || user.id || null;

  const welcomeEl = document.getElementById('welcomeText');
  if (welcomeEl && user.name) welcomeEl.textContent = user.name;

  // 👁 Mostrar selector de círculos
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

  // 🪄 Botón subir imagen
  const toggleUploadBtn = document.getElementById('toggleUploadBtn');
  const formContainer = document.getElementById('uploadFormContainer');
  if (toggleUploadBtn && formContainer) {
    toggleUploadBtn.addEventListener('click', () => {
      if (formContainer.style.display === 'block') {
        document.activeElement.blur();
      }
      const isVisible = formContainer.style.display === 'block';
      formContainer.style.display = isVisible ? 'none' : 'block';
      formContainer.setAttribute('aria-hidden', isVisible ? 'true' : 'false');
    });
  }

  // 🔓 Cerrar sesión
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'login.html';
  });

  // 🚫 Redirigir si no autenticado
  if (!token) {
    alert('Debes iniciar sesión');
    window.location.href = 'login.html';
    return;
  }

  // 📤 Subida de imagen
  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const fileInput = document.getElementById('image');
      if (!fileInput || !fileInput.files.length) {
        alert('Selecciona una imagen');
        return;
      }
      const formData = new FormData(form);

      try {
        const res = await fetch(
          'https://momento-backend-production.up.railway.app/api/images/',
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData
          }
        );
        const result = await res.json();

        if (!res.ok) {
          console.error('Error servidor:', result);
          alert(result.error || result.message || 'Error al subir la imagen');
          return;
        }

        alert('Imagen subida con éxito');
        form.reset();

        // 🔄 Recarga completa de la galería tras subir
        await loadImages();

        if (circleContainer) circleContainer.style.display = 'none';
      } catch (err) {
        console.error('Error en subida de imagen:', err);
        alert('Error en la subida de la imagen');
      }
    });
  }

  // 🔄 Cargar imágenes
  async function loadImages() {
    try {
      const res = await fetch(
        'https://momento-backend-production.up.railway.app/api/images/',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error('Error al obtener imágenes');
      const imgs = await res.json();
      imagesContainer.innerHTML = '';
      imgs.forEach(i => imagesContainer.appendChild(createImageCard(i)));
    } catch (e) {
      console.error('Error cargando imágenes:', e);
      imagesContainer.innerHTML = "<p style='color:red;'>Error al cargar imágenes.</p>";
    }
  }

  // 🧩 Crear tarjeta
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
      const container = document.createElement('div');
      container.className = 'delete-container';
      container.style.position = 'relative';

      const delButton = document.createElement('button');
      delButton.className = 'bin';
      delButton.addEventListener('click', () => deleteImage(image._id, card));

      const decorDiv = document.createElement('div');
      decorDiv.className = 'div';

      const small = document.createElement('small');
      const icon = document.createElement('i');
      small.appendChild(icon);
      decorDiv.appendChild(small);

      container.appendChild(delButton);
      container.appendChild(decorDiv);
      card.appendChild(container);
    }

    return card;
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

  // 🔁 Cargar círculos
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

  // 🔄 Inicializar
  loadImages();
  window.loadUserCircles = loadUserCircles;
});
