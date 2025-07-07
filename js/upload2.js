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
  // 1️⃣ Obtén los elementos correctos
const visibilitySelect = document.getElementById('visibility');
const patchSelectorContainer = document.getElementById('patchSelectorContainer');

visibilitySelect.addEventListener('change', async () => {
  const isPatch = visibilitySelect.value === 'patch';

  // Mostrar u ocultar secciones
  const sectionButtons = document.getElementById('section-buttons');
  const sectionInput = document.getElementById('selected-section');

  if (isPatch) {
    sectionButtons.style.display = 'none';
    sectionInput.value = ''; // Limpiar valor seleccionado
  } else {
    sectionButtons.style.display = 'block';
  }

  // Mostrar u ocultar selector de parches
  patchSelectorContainer.style.display = isPatch ? 'block' : 'none';
  patchSelectorContainer.innerHTML = isPatch
    ? `<p style="margin-bottom: 0.5rem;">Selecciona los parches con los que quieres compartir:</p>`
    : '';

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


const sectionButtons = document.getElementById('section-buttons');
const sectionInput = document.getElementById('selected-section');

  // 🔹 Secciones
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      buttons.forEach(btn => btn.classList.remove('selected'));
      button.classList.add('selected');
      hiddenInput.value = button.dataset.value;
      console.log('✅ Sección seleccionada:', hiddenInput.value);
    });
  });

async function cargarImagenesFiltradas(seccion = 'all') {
  const token = localStorage.getItem('token');

  try {
    const res = await fetch('https://momento-backend-production.up.railway.app/api/images', {
      headers: {
        Authorization: `Bearer ${token}`
      }
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

  
  // ✅ Cargar usuario desde localStorage
  let username = null;
  try {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      username = storedUser.username;
    }
  } catch (e) {
    console.error('Error leyendo localStorage', e);
  }

  // ✅ Soulprint desde botón principal
  if (username) {
    soulprintBtn.href = `soulprint.html?user=${encodeURIComponent(username)}`;
    soulprintMenuBtn.href = `soulprint.html?user=${encodeURIComponent(username)}`;
  } else {
    const redirectToLogin = (e) => {
      e.preventDefault();
      alert('Debes iniciar sesión para ver tu Soulprint');
      window.location.href = 'index.html';
    };
    soulprintBtn.addEventListener('click', redirectToLogin);
    soulprintMenuBtn.addEventListener('click', redirectToLogin);
  }

  // ✅ Animación Soulprint
  soulprintBtn.classList.add('animate');
  setTimeout(() => soulprintBtn.classList.remove('animate'), 800);
  soulprintBtn.addEventListener('click', () => {
    soulprintBtn.classList.add('animate');
    setTimeout(() => soulprintBtn.classList.remove('animate'), 800);
  });

  // ✅ Mostrar/ocultar formulario
  toggleBtn.addEventListener('click', () => {
    const isVisible = uploadForm.classList.toggle('visible');
    uploadForm.setAttribute('aria-hidden', (!isVisible).toString());
  });


  // ✅ Cerrar sesión
  logoutBtn.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'index.html';
  });
  logoutMenuBtn.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'index.html';
  });

const filtros = document.querySelectorAll('.filter-btn');
filtros.forEach(btn => {
  btn.addEventListener('click', () => {
    filtros.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    const filtro = btn.dataset.filter || 'all';
    cargarImagenesFiltradas(filtro);
  });
});

  // ✨ Explorar emociones - Botón flotante y panel
const exploreBtn = document.getElementById('exploreBtn');
const emotionPanel = document.getElementById('emotionPanel');
const closeEmotionPanel = document.getElementById('closeEmotionPanel');
  // 🫂 Botón para ir a circles.html
const openPatchManagerBtn = document.getElementById('openPatchManagerBtn');
openPatchManagerBtn?.addEventListener('click', () => {
  window.location.href = 'circles.html';
});


// Mostrar el panel
exploreBtn?.addEventListener('click', () => {
  emotionPanel.style.display = 'flex';
  emotionPanel.setAttribute('aria-hidden', 'false');
});

// Cerrar el panel
closeEmotionPanel?.addEventListener('click', () => {
  emotionPanel.style.display = 'none';
  emotionPanel.setAttribute('aria-hidden', 'true');
});

// Manejar clics en los filtros emocionales
document.querySelectorAll('.emotion-filter').forEach(btn => {
  btn.addEventListener('click', () => {
    const filtro = btn.getAttribute('data-filter') || 'all';
    cargarImagenesFiltradas(filtro);
    emotionPanel.style.display = 'none';
  });
});
    });
