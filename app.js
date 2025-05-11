const backendURL = "https://calm-aback-vacuum.glitch.me/"; // ← Pega tu URL aquí

// Obtiene el token de localStorage
function getAuthToken() {
  return localStorage.getItem("token");
}

// Inicializa la UI según autenticación
function initAuthenticatedUI() {
  const token = getAuthToken();
  document.getElementById("authForms").style.display = token ? "none" : "block";
  document.getElementById("uploadForm").style.display = token ? "flex" : "none";
}

// Registro de usuario
document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const res = await fetch(`${backendURL}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: fd.get("username"), password: fd.get("password") })
  });
  const data = await res.json();
  if (res.ok) {
    alert("Registro exitoso. Ahora inicia sesión.");
    e.target.reset();
  } else {
    alert(data.message || "Error al registrar");
  }
});

// Login de usuario
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const res = await fetch(`${backendURL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: fd.get("username"), password: fd.get("password") })
  });
  const data = await res.json();
  if (res.ok) {
    localStorage.setItem("token", data.token);
    alert("Inicio de sesión correcto");
    e.target.reset();
    initAuthenticatedUI();
    loadImages();
  } else {
    alert(data.message || "Error al iniciar sesión");
  }
});

// Subida de imágenes (protegido)
document.getElementById("uploadForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const token = getAuthToken();
  if (!token) return alert("Debes iniciar sesión para subir imágenes");

  const formData = new FormData(e.target);
  const res = await fetch(`${backendURL}/upload/`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` },
    body: formData
  });
  if (res.ok) {
    const result = await res.json();
    alert("Imagen subida con éxito");
    let myImages = JSON.parse(localStorage.getItem("myImages") || "[]");
    myImages.push(result.id);
    localStorage.setItem("myImages", JSON.stringify(myImages));
    e.target.reset();
    loadImages();
  } else {
    const data = await res.json();
    alert(data.error || "Error al subir la imagen");
  }
});

// Carga la galería, muestra likes y botón Eliminar
async function loadImages() {
  const res = await fetch(`${backendURL}/images`);
  const data = await res.json();
  const gallery = document.getElementById("gallery");
  gallery.innerHTML = "";

  const myImages = JSON.parse(localStorage.getItem("myImages") || "[]");
  const token = getAuthToken();

  data.forEach(img => {
    const div = document.createElement('div');
    div.className = 'gallery-item';
    div.innerHTML = `
      <img src="${img.image_url}" alt="${img.username}" />
      <p style="text-align:center;">@${img.username}</p>
      <div class="button-row"></div>
    `;
    const row = div.querySelector('.button-row');

    // Botón 🔥 de like
    const likeKey = `likes_${img.id}`;
    let likes = parseInt(localStorage.getItem(likeKey) || "0", 10);
    const likeBtn = document.createElement('button');
    likeBtn.className = 'like-btn';
    likeBtn.textContent = '🔥';
    const likeCount = document.createElement('span');
    likeCount.className = 'like-count';
    likeCount.textContent = likes;
    likeBtn.addEventListener('click', () => {
      if (!token) return alert('Debes iniciar sesión para dar like');
      likes++;
      localStorage.setItem(likeKey, likes);
      likeCount.textContent = likes;
    });
    row.appendChild(likeBtn);
    row.appendChild(likeCount);

    // Botón Eliminar (solo para el usuario que subió)
    if (token && myImages.includes(img.id)) {
      const delBtn = document.createElement('button');
      delBtn.className = 'delete-btn';
      delBtn.textContent = 'Eliminar';
      delBtn.addEventListener('click', async () => {
        const resDelete = await fetch(`${backendURL}/delete/${img.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resDelete.ok) {
          const updated = myImages.filter(id => id !== img.id);
          localStorage.setItem("myImages", JSON.stringify(updated));
          loadImages();
        } else {
          const data = await resDelete.json();
          alert(data.error || 'Error al eliminar la imagen');
        }
      });
      row.appendChild(delBtn);
    }

    gallery.appendChild(div);
  });
}

// Inicialización al cargar la página
window.addEventListener('DOMContentLoaded', () => {
  initAuthenticatedUI();
  loadImages();

  // Prevenir drag & drop sobre inputs de texto
  document.querySelectorAll('input[type="text"]').forEach(input => {
    input.addEventListener('dragover', e => e.preventDefault());
    input.addEventListener('drop', e => e.preventDefault());
  });
  document.getElementById('uploadForm').addEventListener('drop', e => {
    if (e.target.type === 'text') e.preventDefault();
  });

  // Toggle Modo Oscuro
  document.getElementById('toggleDarkMode').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const btn = document.getElementById('toggleDarkMode');
    btn.textContent = document.body.classList.contains('dark-mode')
      ? '🌞 Modo claro'
      : '🌓 Modo oscuro';
  });

  // Modal de términos
  if (localStorage.getItem('termsAccepted')) document.body.classList.add('terms-accepted');
  document.getElementById('acceptTerms').addEventListener('click', () => {
    localStorage.setItem('termsAccepted', 'true');
    document.body.classList.add('terms-accepted');
  });
});
