let token = localStorage.getItem("token"); // antes era const (duplicado)
let currentUserId = null;

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("uploadForm");
  const imagesContainer = document.getElementById("imagesContainer");
  const imageActionMessage = document.getElementById("imageActionMessage");
  
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

  // 👤 Usuario
  let user = {};
  try {
    const stored = localStorage.getItem('user');
    user = stored && stored !== 'undefined' ? JSON.parse(stored) : {};
  } catch {
    console.warn('Usuario mal formado en localStorage');
  }
  currentUserId = user._id || user.id || null; // sin const

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

  // 📤 Subida de imagenMore actionsMore actions
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
        setTimeout(() => loadImages(), 1500); // Espera 1.5 segundos antes de recargar

        if (circleContainer) circleContainer.style.display = 'none';
      } catch (err) {
        console.error('Error en subida de imagen:', err);
        alert('Error en la subida de la imagen');
      }
    });
  }


function renderImages(images) {
  const container = document.getElementById('imagesContainer');
  if (!container) return;

  container.innerHTML = '';

  images.forEach(img => {
    const wrapper = document.createElement('div');
    wrapper.className = 'image-hover-wrapper';

    const description = document.createElement('div');
    description.className = 'image-description';
    description.textContent = img.description || 'Momento';

    const image = document.createElement('img');
    image.src = img.imageUrl || img.url || '';
    image.alt = img.description || 'Momento';
    image.className = 'hidden-image';

    const delBtn = document.createElement('button');
    delBtn.textContent = '🗑️';
    delBtn.className = 'delete-btn';
    delBtn.addEventListener('click', () => deleteImage(img._id, wrapper));

    wrapper.appendChild(description);
    wrapper.appendChild(image);
    wrapper.appendChild(delBtn);
    container.appendChild(wrapper);
  });
}


  
    // 🔄 Cargar imágenes
  async function loadImages() {
    try {
      const res = await fetch('https://momento-backend-production.up.railway.app/api/images/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al obtener imágenes');
      const images = await res.json();
      renderImages(images);
    } catch (e) {
      console.error('Error cargando imágenes:', e);
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
        delBtn.textContent = '✖';
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

  // 🖼 Cargar imágenes al iniciar
  loadImages();
}); // <--- cierre correcto de document.addEventListener
