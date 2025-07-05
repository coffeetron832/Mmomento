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

  if (!append) container.innerHTML = '';

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

    const column = document.createElement('div');
    column.className = 'image-column';

    imagesInSection.forEach(image => {
      const card = document.createElement('div');
      card.className = 'image-card tilt-card';

      const img = document.createElement('img');
      img.src = image.imageUrl || image.url || '';
      img.alt = image.description || 'imagen subida';
      img.loading = 'lazy';

      // ✅ Crear fila de usuario
      const userRow = document.createElement('div');
      userRow.className = 'card-user';

      if (image.userId?.username) {
        const userLink = document.createElement('a');
        userLink.textContent = `@${image.userId.username}`;
        userLink.href = `soulprint.html?user=${encodeURIComponent(image.userId.username)}`;
        userLink.style.color = '#ccc';
        userLink.style.textDecoration = 'none';
        userRow.appendChild(userLink);
      }

      if (image.userId?.username === currentUsername) {
        const delBtn = document.createElement('button');
        delBtn.className = 'delete-btn';
        delBtn.textContent = '🗑️';
        delBtn.addEventListener('click', () => deleteImage(image._id, card));
        userRow.appendChild(delBtn);
      }

      // ✅ Crear fila de mariposas
      const likeRow = document.createElement('div');
      likeRow.className = 'card-likes';

      if (image.userId?.username !== currentUsername) {
        const btn = document.createElement('button');
        btn.className = 'butterfly-btn';
        btn.innerHTML = '🦋';
        btn.dataset.id = image._id;

        const hasLiked = image.likes?.includes(currentUserId);
        btn.dataset.given = hasLiked ? 'true' : 'false';
        if (hasLiked) btn.classList.add('active');

       btn.addEventListener('click', async () => {
  try {
    const wasGiven = btn.dataset.given === 'true';
    const nowGiven = !wasGiven;
    btn.dataset.given = nowGiven ? 'true' : 'false';
    btn.classList.toggle('active', nowGiven);

    btn.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.3)' }, { transform: 'scale(1)' }], {
      duration: 300,
      easing: 'ease-in-out'
    });

    const res = await fetch(`https://momento-backend-production.up.railway.app/api/images/${image._id}/like`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    if (!res.ok) throw new Error('Error en mariposa');
    // ⚡️ Envío mensaje a otras pestañas:
localStorage.setItem('butterfly-given', Date.now());

    // ✅ Asegúrate de tener este cierre aquí
    window.postMessage('butterfly-given', '*');

  } catch (err) {
    console.error('Error:', err);
  }
});

// 👇 SOLO SI se muestra el botón, agregamos también el botón al DOM
  likeRow.appendChild(btn);
} // ✅ <- AQUÍ ESTABA FALTANDO CIERRE

// 👍 Mostrar conteo de likes (independiente de si el usuario puede dar mariposa o no)
if (image.likes?.length > 0) {
  const likeCount = document.createElement('span');
  likeCount.className = 'like-count';
  likeCount.textContent = `x ${image.likes.length}`;
  likeRow.appendChild(likeCount);
}

      // ✅ Contenedor blanco con descripción, usuario y mariposas
      const infoBox = document.createElement('div');
      infoBox.className = 'card-info';

      const description = document.createElement('div');
      description.className = 'card-title';
      description.textContent = image.description || '(sin descripción)';

      infoBox.appendChild(description);
      infoBox.appendChild(userRow);
      infoBox.appendChild(likeRow);


      card.appendChild(img);
      card.appendChild(infoBox);
      column.appendChild(card);
    });

    sectionGroup.appendChild(column);
    container.appendChild(sectionGroup);
  });
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


  document.addEventListener('mousemove', (e) => {
  document.querySelectorAll('.tilt-card').forEach(card => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const deltaX = (x - centerX) / centerX;
    const deltaY = (y - centerY) / centerY;

    if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
      card.style.transform = `rotateY(${deltaX * 10}deg) rotateX(${-deltaY * 10}deg)`;

      const spotlight = card.querySelector('.spotlight');
      if (spotlight) {
        spotlight.style.left = `${x}px`;
        spotlight.style.top = `${y}px`;
        spotlight.style.opacity = 1;
      }
    } else {
      card.style.transform = `rotateY(0deg) rotateX(0deg)`;
      const spotlight = card.querySelector('.spotlight');
      if (spotlight) spotlight.style.opacity = 0;
    }
  });
});


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
  li.style.flexDirection = 'column';
  li.style.padding = '0.5rem';
  li.style.borderBottom = '1px solid #eee';

  const msg = document.createElement('span');
  msg.textContent = `🦋 ${n.message}`;

  const actions = document.createElement('div');
  actions.style.marginTop = '5px';
  actions.style.display = 'flex';
  actions.style.gap = '10px';

  // 🔘 Solo si es invitación a parche
  if (n.type === 'invitacion_parche' && n.patchId) {
    const acceptBtn = document.createElement('button');
    acceptBtn.textContent = 'Aceptar';
    acceptBtn.className = 'btn-accept';
    acceptBtn.addEventListener('click', () => respondToInvite(n._id, 'accepted'));

    const rejectBtn = document.createElement('button');
    rejectBtn.textContent = 'Rechazar';
    rejectBtn.className = 'btn-reject';
    rejectBtn.addEventListener('click', () => respondToInvite(n._id, 'rejected'));

    actions.appendChild(acceptBtn);
    actions.appendChild(rejectBtn);
  }

  const delBtn = document.createElement('button');
  delBtn.textContent = '✖';
  delBtn.className = 'btn-delete';
  delBtn.title = 'Eliminar notificación';
  delBtn.addEventListener('click', async () => {
    await fetch(`${API_URL}/notifications/${n._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    li.remove();
  });

  actions.appendChild(delBtn);
  li.append(msg, actions);
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

function showFullImage(imageUrl) {
  // Verifica si ya existe
  let overlay = document.getElementById('fullImageOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'fullImageOverlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '9999';

    const img = document.createElement('img');
    img.style.maxWidth = '90%';
    img.style.maxHeight = '90%';
    img.style.boxShadow = '0 0 20px rgba(255,255,255,0.2)';
    img.id = 'overlayFullImage';
    overlay.appendChild(img);

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✖';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '20px';
    closeBtn.style.right = '30px';
    closeBtn.style.fontSize = '2rem';
    closeBtn.style.color = '#fff';
    closeBtn.style.background = 'transparent';
    closeBtn.style.border = 'none';
    closeBtn.style.cursor = 'pointer';
    closeBtn.addEventListener('click', () => overlay.remove());
    overlay.appendChild(closeBtn);

    document.body.appendChild(overlay);
  }

  document.getElementById('overlayFullImage').src = imageUrl;
  overlay.style.display = 'flex';
}

async function respondToInvite(notificationId, status) {
  try {
    const res = await fetch(`${API_URL}/patches/respond-invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ notificationId, status }) // accepted o rejected
    });

    const data = await res.json();
    if (res.ok) {
      alert(`✅ Invitación ${status === 'accepted' ? 'aceptada' : 'rechazada'}`);
      await loadNotifications(); // recargar notificaciones
    } else {
      alert(`❌ ${data.error || 'No se pudo procesar la invitación'}`);
    }
  } catch (err) {
    console.error('Error al responder invitación:', err);
    alert('❌ Error al enviar respuesta');
  }
}

  
}); // <--- cierre correcto de document.addEventListener
