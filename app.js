const backendURL = "https://calm-aback-vacuum.glitch.me/"; // ← Pega tu URL aquí
let authToken = null;

// Contenedor de toasts
function showToast(msg, isError = false) {
  const div = document.createElement('div');
  div.className = 'toast' + (isError ? ' toast-error' : '');
  div.textContent = msg;
  document.getElementById('toastContainer').append(div);
  setTimeout(() => div.remove(), 3000);
}

// Registro
document.getElementById('registerForm').onsubmit = async e => {
  e.preventDefault();
  const username = e.target.querySelector('#regUsername').value;
  const email    = e.target.querySelector('#regEmail').value;
  const password = e.target.querySelector('#regPassword').value;

  const res = await fetch(`${backendURL}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });
  const d = await res.json();
  if (res.ok) {
    showToast('Registro exitoso ✔️');
    e.target.reset();
  } else {
    showToast(d.error || 'Error al registrar', true);
  }
};

// Login
document.getElementById('loginForm').onsubmit = async e => {
  e.preventDefault();
  const username = e.target.querySelector('#loginUsername').value;
  const password = e.target.querySelector('#loginPassword').value;

  const res = await fetch(`${backendURL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const d = await res.json();
  if (res.ok) {
    authToken = d.token;
    showToast('Inicio de sesión correcto ✔️');
    // Ocultar formularios de auth y mostrar upload
    document.getElementById('auth').style.display = 'none';
    document.getElementById('uploadSection').style.display = 'block';
    // Desplazar hasta el formulario de subida
    document.getElementById('uploadSection').scrollIntoView({ behavior: 'smooth' });
  } else {
    showToast(d.error || 'Error al iniciar sesión', true);
  }
};

// Subir imagen
document.getElementById('uploadForm').onsubmit = async e => {
  e.preventDefault();
  const file = e.target.querySelector('#imageInput').files[0];
  const fd = new FormData();
  fd.append('image', file);

  const res = await fetch(`${backendURL}/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${authToken}` },
    body: fd
  });
  const d = await res.json();
  if (res.ok) {
    showToast('Imagen subida ✔️');
    loadImages();
    e.target.reset();
  } else {
    showToast(d.error || 'Error al subir', true);
  }
};

// Cargar galería
async function loadImages() {
  const res = await fetch(`${backendURL}/images`);
  const imgs = await res.json();
  const gallery = document.getElementById('gallery');
  gallery.innerHTML = '';

  // Ids de imágenes subidas por este navegador
  const stored = JSON.parse(localStorage.getItem('myImages') || '[]');

  imgs.forEach(img => {
    const div = document.createElement('div');
    div.className = 'gallery-item';
    div.innerHTML = `
      <img src="${img.image_url}" alt="" />
      <p>@${img.username}</p>
      <div class="button-row">
        <button class="like-btn" data-id="${img.id}">🔥</button>
        <span class="like-count">${img.likes}</span>
      </div>
    `;
    // Si es del mismo navegador, mostramos eliminar
    if (stored.includes(img.id)) {
      const delBtn = document.createElement('button');
      delBtn.className = 'delete-btn';
      delBtn.textContent = 'Eliminar';
      delBtn.onclick = async () => {
        const resD = await fetch(`${backendURL}/delete/${img.id}`, { method: 'DELETE' });
        if (resD.ok) {
          const upd = stored.filter(x => x !== img.id);
          localStorage.setItem('myImages', JSON.stringify(upd));
          loadImages();
        } else {
          const err = await resD.json();
          showToast(err.error || 'Error al eliminar', true);
        }
      };
      div.querySelector('.button-row').append(delBtn);
    }

    gallery.append(div);
  });

  attachLikeHandlers();
}

// Gestionar likes
function attachLikeHandlers() {
  document.querySelectorAll('.like-btn').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.id;
      const res = await fetch(`${backendURL}/api/like/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const d = await res.json();
      if (res.ok) {
        btn.nextElementSibling.textContent = d.totalLikes;
        showToast('¡Like registrado!');
        btn.disabled = true;
      } else {
        showToast(d.error, true);
      }
    };
  });
}

// Inicio: sólo carga la galería y mantiene auth visible
window.addEventListener('DOMContentLoaded', () => {
  loadImages();
});
  });
}

// Init
window.onload = loadImages;
