document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn         = document.getElementById('toggleUploadBtn');
  const uploadForm        = document.getElementById('uploadFormContainer');
  const logoutBtn         = document.getElementById('logoutBtn');
  const soulprintBtn      = document.getElementById('soulprintBtn');
  const logoutMenuBtn     = document.getElementById('logoutMenuBtn');
  const soulprintMenuBtn  = document.getElementById('soulprintMenuBtn');
  const menuToggleBtn     = document.getElementById('menuToggleBtn');
  const menuOverlay       = document.getElementById('menuOverlay');
  const darkToggle        = document.getElementById('darkModeToggle');
  const body              = document.body;
  const token             = localStorage.getItem('token');
  const buttons           = document.querySelectorAll('.section-button');
  const hiddenInput       = document.getElementById('selected-section');
  const form              = document.getElementById('uploadForm');
  const visibilitySelect  = document.getElementById('visibility');
  const patchSelectorContainer = document.getElementById('patchSelectorContainer');

  if (visibilitySelect) {
    visibilitySelect.addEventListener('change', async () => {
      const isPatch = visibilitySelect.value === 'patch';
      const sectionButtons = document.getElementById('section-buttons');
      const sectionInput = document.getElementById('selected-section');

      if (sectionButtons && sectionInput) {
        sectionButtons.style.display = isPatch ? 'none' : 'block';
        sectionInput.value = isPatch ? '' : sectionInput.value;
      }

      if (patchSelectorContainer) {
        patchSelectorContainer.style.display = isPatch ? 'block' : 'none';
        patchSelectorContainer.innerHTML = isPatch
          ? `<p style="margin-bottom: 0.5rem;">Selecciona los parches con los que quieres compartir:</p>`
          : '';
      }

      if (!isPatch) return;

      try {
        const res = await fetch(`${API_URL}/api/patches`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const patches = await res.json();

        if (!Array.isArray(patches)) throw new Error('No se recibieron parches válidos');

        patches.forEach(patch => {
          const label = document.createElement('label');
          label.style.display = 'block';
          label.style.marginBottom = '0.25rem';

          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.name = 'patches';
          checkbox.value = patch._id;

          label.appendChild(checkbox);
          label.appendChild(document.createTextNode(' ' + patch.name));
          patchSelectorContainer.appendChild(label);
        });

      } catch (err) {
        console.error('Error al cargar parches:', err);
        patchSelectorContainer.innerHTML = '<p style="color:red;">Error al cargar parches.</p>';
      }
    });
  }

  // 🔹 Secciones
  if (buttons && hiddenInput) {
    buttons.forEach(button => {
      button.addEventListener('click', () => {
        buttons.forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
        hiddenInput.value = button.dataset.value;
        console.log('✅ Sección seleccionada:', hiddenInput.value);
      });
    });
  }

  async function cargarImagenesFiltradas(seccion = 'all') {
    try {
      const res = await fetch('https://momento-backend-production.up.railway.app/api/images', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Error al obtener imágenes');

      const todasLasImagenes = await res.json();

      const filtradas = seccion === 'all'
        ? todasLasImagenes
        : todasLasImagenes.filter(img => img.section === seccion);

      renderImages(filtradas);
    } catch (err) {
      console.error('Error al cargar imágenes:', err);
    }
  }

  // ✅ Cargar usuario
  let username = null;
  try {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      username = storedUser.username;
    }
  } catch (e) {
    console.error('Error leyendo localStorage', e);
  }

  // ✅ Soulprint
  if (username) {
    if (soulprintBtn) soulprintBtn.href = `soulprint.html?user=${encodeURIComponent(username)}`;
    if (soulprintMenuBtn) soulprintMenuBtn.href = `soulprint.html?user=${encodeURIComponent(username)}`;
  } else {
    const redirectToLogin = (e) => {
      e.preventDefault();
      alert('Debes iniciar sesión para ver tu Soulprint');
      window.location.href = 'index.html';
    };
    if (soulprintBtn) soulprintBtn.addEventListener('click', redirectToLogin);
    if (soulprintMenuBtn) soulprintMenuBtn.addEventListener('click', redirectToLogin);
  }

  // ✅ Animación Soulprint
  if (soulprintBtn) {
    soulprintBtn.classList.add('animate');
    setTimeout(() => soulprintBtn.classList.remove('animate'), 800);
    soulprintBtn.addEventListener('click', () => {
      soulprintBtn.classList.add('animate');
      setTimeout(() => soulprintBtn.classList.remove('animate'), 800);
    });
  }

  // ✅ Mostrar/ocultar formulario
  if (toggleBtn && uploadForm) {
    toggleBtn.addEventListener('click', () => {
      const isVisible = uploadForm.classList.toggle('visible');
      uploadForm.setAttribute('aria-hidden', (!isVisible).toString());
    });
  }

  // ✅ Cerrar sesión
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.clear();
      window.location.href = 'index.html';
    });
  }
  if (logoutMenuBtn) {
    logoutMenuBtn.addEventListener('click', () => {
      localStorage.clear();
      window.location.href = 'index.html';
    });
  }

  const filtros = document.querySelectorAll('.filter-btn');
  if (filtros.length > 0) {
    filtros.forEach(btn => {
      btn.addEventListener('click', () => {
        filtros.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        const filtro = btn.dataset.filter || 'all';
        cargarImagenesFiltradas(filtro);
      });
    });
  }

  // 🎨 Explorar emociones
  const exploreBtn = document.getElementById('exploreBtn');
  const exploreBtnMenu = document.getElementById('exploreBtnMenu');
  const emotionPanel = document.getElementById('emotionPanel');
  const closeEmotionPanel = document.getElementById('closeEmotionPanel');

  if (exploreBtn && emotionPanel) {
    exploreBtn.addEventListener('click', () => {
      emotionPanel.style.display = 'flex';
      emotionPanel.setAttribute('aria-hidden', 'false');
    });
  }

  if (exploreBtnMenu && emotionPanel && menuOverlay) {
    exploreBtnMenu.addEventListener('click', () => {
      emotionPanel.style.display = 'flex';
      emotionPanel.setAttribute('aria-hidden', 'false');
      menuOverlay.classList.remove('show');
    });
  }

  if (closeEmotionPanel && emotionPanel) {
    closeEmotionPanel.addEventListener('click', () => {
      emotionPanel.style.display = 'none';
      emotionPanel.setAttribute('aria-hidden', 'true');
    });
  }

  document.querySelectorAll('.emotion-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      const filtro = btn.getAttribute('data-filter') || 'all';
      cargarImagenesFiltradas(filtro);
      if (emotionPanel) emotionPanel.style.display = 'none';
    });
  });

  // ☁️ Mostrar formulario desde menú
  const toggleUploadBtnMenu = document.getElementById('toggleUploadBtnMenu');
  if (toggleUploadBtnMenu && uploadForm && menuOverlay) {
    toggleUploadBtnMenu.addEventListener('click', () => {
      const isVisible = uploadForm.classList.toggle('visible');
      uploadForm.setAttribute('aria-hidden', (!isVisible).toString());
      menuOverlay.classList.remove('show');
    });
  }


  // 📱 Cerrar formulario al tocar fuera (solo móviles)
  if (window.innerWidth <= 600) {
    document.addEventListener('click', (e) => {
      const uploadFormContainer = document.getElementById('uploadFormContainer');
      const uploadForm = document.getElementById('uploadForm');

      const isVisible = uploadFormContainer.classList.contains('visible');
      const touchedOutside = !uploadForm.contains(e.target) &&
                        !e.target.closest('#toggleUploadBtn') &&
                        !e.target.closest('#toggleUploadBtnMenu');

      if (isVisible && touchedOutside) {
        uploadFormContainer.classList.remove('visible');
        uploadFormContainer.setAttribute('aria-hidden', 'true');
      }
    });
  }

  
  // 🔗 Ir a círculos
  const openPatchManagerBtn = document.getElementById('openPatchManagerBtn');
  if (openPatchManagerBtn) {
    openPatchManagerBtn.addEventListener('click', () => {
      window.location.href = 'circles.html';
    });
  }
});
