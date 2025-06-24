const token = localStorage.getItem("token");
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("uploadForm");
  const imagesContainer = document.getElementById("imagesContainer");

  const welcomeBackMessage = localStorage.getItem('welcomeBackMessage');
if (welcomeBackMessage) {
  const msgBox = document.getElementById('uploadSuccessMessage');
  if (msgBox) {
    msgBox.textContent = welcomeBackMessage;
    msgBox.style.display = 'block';
    msgBox.style.opacity = '1';

    setTimeout(() => {
      msgBox.style.opacity = '0';
      setTimeout(() => {
        msgBox.style.display = 'none';
        localStorage.removeItem('welcomeBackMessage'); // Solo se muestra una vez
      }, 2000);
    }, 3000);
  }
}

  // 🌙 Aplicar modo oscuro
  const darkValue = localStorage.getItem('darkMode');
  const isDarkStored = darkValue === 'true' || darkValue === 'enabled';
  if (isDarkStored) document.body.classList.add('dark-mode');

  // 🔘 Switch modo oscuro
  const toggleCheckbox = document.getElementById('darkModeToggle');
  if (toggleCheckbox) {
  toggleCheckbox.checked = isDarkStored;
  toggleCheckbox.addEventListener('change', () => {
    const checked = toggleCheckbox.checked;
    if (checked) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('darkMode', 'false');
    }
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

  const token = localStorage.getItem("token");

// 👤 Usuario actual
  let user = {};
  try {
    const stored = localStorage.getItem('user');
    user = stored && stored !== 'undefined' ? JSON.parse(stored) : {};
  } catch {
    console.warn('Usuario mal formado en localStorage');
  }
  currentUserId = user._id || user.id || null;

  // 👋 Mostrar nombre
  const welcomeEl = document.getElementById('welcomeText');
  if (welcomeEl && user.name) welcomeEl.textContent = user.name;

  // 🔄 Cargar imágenes desde el inicio
  loadImages();



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
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    // Guardar el mensaje temporalmente
    localStorage.setItem('logoutMessage', '👋 Cerraste sesión con éxito. Esperamos verte pronto 💙');
    
    // Limpiar todo excepto el mensaje
    const logoutMsg = localStorage.getItem('logoutMessage');
    localStorage.clear();
    localStorage.setItem('logoutMessage', logoutMsg);

    // Redirigir
    window.location.href = 'index.html';
  });
}

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

        const successMsg = document.getElementById('imageActionMessage');
if (successMsg) {
  successMsg.innerHTML = '🌟 ¡Tu momento ha sido compartido con el alma!';
  successMsg.style.display = 'block';
  successMsg.style.opacity = '0';
  successMsg.style.transition = 'opacity 0.8s ease';

  setTimeout(() => {
    successMsg.style.opacity = '1';
  }, 100);

  setTimeout(() => {
    successMsg.style.opacity = '0';
    setTimeout(() => {
      successMsg.style.display = 'none';
    }, 800);
  }, 5000);
}

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
      imgs.forEach(imgObj => {
        imagesContainer.appendChild(createImageCard(imgObj));
      });
    } catch (e) {
      console.error(e);
      imagesContainer.innerHTML = "<p style='color:red;'>Error al cargar imágenes.</p>";
    }
  }

  function createImageCard(image) {
  const card = document.createElement('div');
  card.className = 'image-card';

  const img = documfunction createImageCard(image) {
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

  // ✅ Compara como strings
  if (ownerId?.toString() === currentUserId?.toString()) {
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.setAttribute('aria-label', 'Eliminar imagen');
    deleteBtn.innerText = '✖️';
    deleteBtn.addEventListener('click', () => deleteImage(image._id, card));
    card.appendChild(deleteBtn);
  }

  card.append(img, desc, userInfo);
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
      el.remove();
      const msg = document.getElementById('uploadSuccessMessage');
      if (msg) {
        msg.innerHTML = '🗑️ Tu Momento ya no está... pero dejó huella.';
        msg.style.display = 'block';
        msg.style.opacity = '0';
        msg.style.transition = 'opacity 0.8s ease';

        setTimeout(() => {
          msg.style.opacity = '1';
        }, 100);

        setTimeout(() => {
          msg.style.opacity = '0';
          setTimeout(() => {
            msg.style.display = 'none';
          }, 800);
        }, 5000);
      }
    } else {
      const data = await res.json();
      alert(data.error || 'Error al eliminar imagen');
    }
  } catch (e) {
    console.error('Error eliminando imagen:', e);
    alert('Error al eliminar la imagen');
  }
}


  

// 🔔 Botón para mostrar notificaciones
const notifBtn = document.getElementById('notifBtn');
const notifDropdown = document.getElementById('notifDropdown');
const notifList = document.getElementById('notifList');
const notifCount = document.getElementById('notifCount');


if (notifBtn && notifDropdown) {
  notifBtn.addEventListener('click', async () => {
    notifDropdown.style.display = notifDropdown.style.display === 'block' ? 'none' : 'block';
    if (notifDropdown.style.display === 'block') {
      await loadNotifications();
    }
  });
}

// 🔄 Cargar notificaciones del usuario
async function loadNotifications() {
  try {
    const res = await fetch(
      'https://momento-backend-production.up.railway.app/api/notifications',
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    if (!res.ok) throw new Error('Error al obtener notificaciones');

    const notifications = await res.json();
    notifList.innerHTML = '';

    if (!notifications.length) {
      notifList.innerHTML = '<li style="padding:0.5rem;">Sin notificaciones nuevas</li>';
      notifCount.style.display = 'none';
      return;
    }

    // Mostrar máximo 10 notificaciones
   notifications.slice(0, 10).forEach(n => {
  const li = document.createElement('li');
  li.style.display = 'flex';
  li.style.justifyContent = 'space-between';
  li.style.alignItems = 'center';
  li.style.padding = '0.5rem';
  li.style.borderBottom = '1px solid #eee';

  const msg = document.createElement('span');
  msg.textContent = `🦋 ${n.message}`;

  const delBtn = document.createElement('button');
  delBtn.textContent = '✖'; // ❌ o X
  delBtn.style.border = 'none';
  delBtn.style.background = 'transparent';
  delBtn.style.color = '#999';
  delBtn.style.cursor = 'pointer';
  delBtn.title = 'Eliminar notificación';
  delBtn.addEventListener('click', async () => {
    try {
      const res = await fetch(`https://momento-backend-production.up.railway.app/api/notifications/${n._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('No se pudo eliminar');
      li.remove();
    } catch (e) {
      console.error('Error eliminando notificación:', e);
      alert('Error al eliminar notificación');
    }
  });

  li.append(msg, delBtn);
  notifList.appendChild(li);
});


    // Actualizar contador
    notifCount.textContent = notifications.length;
    notifCount.style.display = 'inline-block';
  } catch (e) {
    console.error('Error al cargar notificaciones:', e);
    notifList.innerHTML = '<li style="padding:0.5rem;color:red;">Error al cargar notificaciones</li>';
    notifCount.style.display = 'none';
  }
}
