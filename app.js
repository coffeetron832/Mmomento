const backendURL = "https://calm-aback-vacuum.glitch.me"; // ← Pega tu URL aquí
let authToken = null;

// Mostrar notificaciones
function showToast(msg, isError=false) {
  const d = document.createElement('div');
  d.className = 'toast' + (isError ? ' toast-error' : '');
  d.textContent = msg;
  document.getElementById('toastContainer').append(d);
  setTimeout(() => d.remove(), 3000);
}

// Registro
document.getElementById('registerForm').onsubmit = async e => {
  e.preventDefault();
  const username = document.getElementById('regUsername').value;
  const email    = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  const res = await fetch(`${backendURL}/api/register`, {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({username,email,password})
  });
  const data = await res.json();
  if(res.ok) { showToast('Registro exitoso ✔️'); e.target.reset(); }
  else showToast(data.error||'Error al registrar', true);
};

// Login de usuario
const loginForm = document.getElementById('loginForm');
loginForm.onsubmit = async e => {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;
  console.log('Intentando login con', username);
  try {
    const res = await fetch(`${backendURL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    console.log('Respuesta login status:', res.status);
    const data = await res.json();
    console.log('Datos login:', data);
    if (res.ok && data.token) {
      authToken = data.token;
      showToast('Sesión iniciada ✔️');
      document.getElementById('authSection').style.display = 'none';
      document.getElementById('uploadSection').style.display = 'block';
      loadImages();
    } else {
      showToast(data.error || 'Error al iniciar sesión', true);
    }
  } catch (err) {
    console.error('Error en login fetch:', err);
    showToast('Error de red al iniciar sesión', true);
  }
};
// Subir imagen
document.getElementById('uploadForm').onsubmit = async e => {
  e.preventDefault();
  const file = document.getElementById('imageInput').files[0];
  const fd = new FormData(); fd.append('image', file);
  const res = await fetch(`${backendURL}/upload`, {
    method:'POST', headers:{Authorization:`Bearer ${authToken}`}, body:fd
  });
  const data = await res.json();
  if(res.ok) { showToast('Imagen subida ✔️'); loadImages(); }
  else showToast(data.error||'Error al subir', true);
};

// Cargar galería
async function loadImages() {
  const res = await fetch(`${backendURL}/images`);
  const imgs = await res.json();
  const gallery = document.getElementById('gallery');
  gallery.innerHTML = '';

  imgs.forEach(img => {
    const div = document.createElement('div'); div.className='gallery-item';
    div.innerHTML = `
      <img src="${img.image_url}" alt="" />
      <p>@${img.username}</p>
      <div class='button-row'>
        <button class='like-btn' data-id='${img.id}'>🔥</button>
        <span>${img.likes}</span>
      </div>
    `;
    gallery.append(div);
  });
  attachLikeHandlers();
}

// Likes
function attachLikeHandlers() {
  document.querySelectorAll('.like-btn').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.id;
      const res = await fetch(`${backendURL}/api/like/${id}`, {
        method:'POST', headers:{Authorization:`Bearer ${authToken}`}
      });
      const d = await res.json();
      if(res.ok) {
        btn.nextElementSibling.textContent = d.totalLikes;
        showToast('¡Like registrado!');
        btn.disabled = true;
      } else showToast(d.error, true);
    };
  });
}

// Inicio
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('uploadSection').style.display = 'none';
  loadImages();
});
