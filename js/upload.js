let token = localStorage.getItem("token"); // antes era const (duplicado)
let currentUserId = null;
let currentSectionFilter = 'all'; // ✅ Sección activa por defecto


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

    const hiddenInput = document.getElementById('selected-section');
if (!hiddenInput.value) {
  alert('Por favor selecciona una sección creativa.');
  return;
}

  
    const fileInput = document.getElementById('image');
    if (!fileInput || !fileInput.files.length) {
      alert('Selecciona una imagen');
      return;
    }

    const formData = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');
    const imagesContainer = document.getElementById('imagesContainer');

    // 🔄 Mostrar loader y desactivar botón
    if (imagesContainer) imagesContainer.innerHTML = '<p class="loader">Cargando...</p>';
    if (submitBtn) submitBtn.disabled = true;

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

      // ✅ Mensaje de éxito
      const successMsg = document.getElementById('imageActionMessage');
      if (successMsg) {
        successMsg.innerHTML = '🌟 ¡Tu momento ha sido compartido con el alma!';
        successMsg.style.display = 'block';
        successMsg.style.opacity = '0';
        successMsg.style.transition = 'opacity 0.8s ease';

        setTimeout(() => (successMsg.style.opacity = '1'), 100);
        setTimeout(() => {
          successMsg.style.opacity = '0';
          setTimeout(() => {
            successMsg.style.display = 'none';
          }, 800);
        }, 5000);
      }

      form.reset();
      if (circleContainer) circleContainer.style.display = 'none';

      // 🔁 Recargar desde backend (evita duplicados)
      await loadImages();
    } catch (err) {
      console.error('Error en subida de imagen:', err);
      alert('Error en la subida de la imagen');
    } finally {
      // ✅ Restaurar botón y quitar loader
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}



function applyFilter() {
  const sections = document.querySelectorAll('.section-group');
  sections.forEach(section => {
    const sectionId = section.dataset.section;
    section.style.display =
      currentSectionFilter === 'all' || currentSectionFilter === sectionId
        ? 'block'
        : 'none';
  });
}

  
  function renderImages(images, append = false) {
  const container = document.getElementById('imagesContainer');
  if (!container) return;

  // 🔹 Si no estamos haciendo "append", limpiamos el contenedor
  if (!append) {
    container.innerHTML = '';
  }

  const grouped = {};
  images.forEach(img => {
    const section = img.section || 'sin_seccion';
    if (!grouped[section]) grouped[section] = [];
    grouped[section].push(img);
  });

  const sectionTitles = {
    caos_bonito: '❤️‍🔥 Caos bonito',
    zona_cero: '🛤️ Zona cer0',
    emocional_404: '🧨 404 Emocional',
    nunca_antes_visto: '🤐 Nunca antes visto',
    sin_seccion: '📦 Sin sección'
  };

  const storedUser = JSON.parse(localStorage.getItem('user'));
  const currentUsername = storedUser?.username || null;
  const token = localStorage.getItem('token');

  Object.keys(sectionTitles).forEach(sectionKey => {
    const imagesInSection = grouped[sectionKey];
    if (!imagesInSection?.length) return;

    const sectionGroup = document.createElement('div');
    sectionGroup.className = 'section-group';
    sectionGroup.dataset.section = sectionKey;

    const sectionHeader = document.createElement('h2');
    sectionHeader.textContent = sectionTitles[sectionKey];
    sectionHeader.className = 'section-title';
    sectionGroup.appendChild(sectionHeader);

    const sectionWrapper = document.createElement('div');
    sectionWrapper.className = 'images-grid';

    imagesInSection.forEach(image => {
      const card = document.createElement('div');
      card.classList.add('image-card-hover');

      const desc = document.createElement('div');
      desc.className = 'image-description-hover';
      desc.textContent = image.description || '(sin descripción)';
      card.appendChild(desc);

      const preview = document.createElement('div');
      preview.className = 'image-preview-hover';

      const img = document.createElement('img');
      img.src = image.imageUrl || image.url || '';
      img.alt = image.description || 'Momento';
      preview.appendChild(img);
      card.appendChild(preview);

      desc.addEventListener('mouseenter', () => {
        preview.style.display = 'block';
        setTimeout(() => preview.style.opacity = '1', 10);
      });

      desc.addEventListener('mouseleave', () => {
        preview.style.opacity = '0';
        setTimeout(() => preview.style.display = 'none', 300);
      });

      const userRow = document.createElement('div');
userRow.className = 'user-row'; // Puedes usar una clase o estilos inline
userRow.style.display = 'flex';
userRow.style.alignItems = 'center';
userRow.style.gap = '0.4rem';

if (image.userId && image.userId.username) {
  const userLink = document.createElement('a');
  userLink.className = 'image-user';
  userLink.textContent = `@${image.userId.username}`;
  userLink.href = `soulprint.html?user=${encodeURIComponent(image.userId.username)}`;
  userLink.style.textDecoration = 'none';
  userLink.style.color = 'inherit'; // Mantener estilos actuales

  userRow.appendChild(userLink);
}


 // 🦋 Botón mariposa (si no es tuya)
  if (image.userId?.username !== currentUsername) {
    const btn = document.createElement('button');
    btn.className = 'butterfly-btn';
    btn.innerHTML = '🦋';
    btn.dataset.id = image._id;

    // 1) Estado inicial: ¿ya la diste?
    const hasLiked = image.likes?.includes(currentUsername);
    if (hasLiked) {
      btn.classList.add('active');
      btn.dataset.given = 'true';
    } else {
      btn.dataset.given = 'false';
    }

    // 2) Listener de clic
   btn.addEventListener('click', async () => {
  try {
    // 1. Saber si ya había dado mariposa antes del click
    const wasGiven = btn.dataset.given === 'true';

    // 2. Cambiar el atributo visual antes de esperar respuesta
    const nowGiven = !wasGiven;
    btn.dataset.given = nowGiven ? 'true' : 'false';

    // 3. Aplicar o quitar clase .active según nuevo estado
    btn.classList.toggle('active', nowGiven);

    // 4. Animación visual inmediata
    btn.animate([
      { transform: 'scale(1)', filter: 'brightness(1)' },
      { transform: 'scale(1.4)', filter: 'brightness(1.5)' },
      { transform: 'scale(1)', filter: 'brightness(1)' }
    ], {
      duration: 300,
      easing: 'ease-out'
    });

    // 5. Enviar la mariposa al backend
    const res = await fetch(
      `https://momento-backend-production.up.railway.app/api/images/${image._id}/like`,
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    if (!res.ok) throw new Error('No se pudo enviar');
    
  } catch (err) {
    console.error('Error al enviar mariposa:', err);

    // 6. Revertimos el estado si falló
    const wasGiven = btn.dataset.given === 'true';
    btn.dataset.given = wasGiven ? 'false' : 'true';
    btn.classList.toggle('active', !wasGiven);
  }
});


    userRow.appendChild(btn);
  }

card.appendChild(userRow);


      if (image.likes?.length > 0) {
        const count = document.createElement('div');
        count.className = 'like-count';
        count.textContent = `🦋 x ${image.likes.length}`;
        card.appendChild(count);
      }

      if (image.userId?.username === currentUsername) {
        const delBtn = document.createElement('button');
        delBtn.className = 'delete-btn';
        delBtn.textContent = '🗑️';
        delBtn.addEventListener('click', () => deleteImage(image._id, card));
        card.appendChild(delBtn);
      }

      sectionWrapper.appendChild(card);
    });

    sectionGroup.appendChild(sectionWrapper);
    container.appendChild(sectionGroup);
  });

  applyFilter();
}


// 👇 Esto va fuera de la función
window.renderImages = renderImages;





const filterBtns = document.querySelectorAll('.filter-btn');
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    currentSectionFilter = btn.dataset.filter;
    applyFilter();
  });
});


let allImages = [];

function loadImages() {
  fetch('https://momento-backend-production.up.railway.app/api/images/', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  })
    .then(res => res.json())
    .then(images => {
      allImages = images;
      renderFilteredImages('all'); // Mostrar todo al inicio
    })
    .catch(err => console.error('Error al cargar imágenes:', err));
}

function renderFilteredImages(sectionKey) {
  const filtered = sectionKey === 'all'
    ? allImages
    : allImages.filter(img => (img.section || 'sin_seccion') === sectionKey);

  renderImages(filtered);
}


// Cargar imágenes inicialmente
loadImages();


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

}); // <--- cierre correcto de document.addEventListener
