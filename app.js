const backendURL = "https://calm-aback-vacuum.glitch.me/"; // ← Pega tu URL aquí

// Helpers
function showToast(msg, isError=false) {
  const div = document.createElement('div');
  div.className = 'toast' + (isError? ' toast-error':'');
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
    method:'POST', headers:{'Content-Type':'application/json'},
    body:JSON.stringify({username,email,password})
  });
  const d = await res.json();
  if(res.ok) showToast('Registrado ✔️'); else showToast(d.error,true);
};

// Login
document.getElementById('loginForm').onsubmit = async e => {
  e.preventDefault();
  const username = e.target.querySelector('#loginUsername').value;
  const password = e.target.querySelector('#loginPassword').value;
  const res = await fetch(`${backendURL}/api/login`, {
    method:'POST', headers:{'Content-Type':'application/json'},
    body:JSON.stringify({username,password})
  });
  const d = await res.json();
  if(res.ok){
    authToken = d.token;
    document.getElementById('uploadSection').style.display = 'block';
    showToast('Bienvenido ✔️');
  } else showToast(d.error,true);
};

// Subir imagen
document.getElementById('uploadForm').onsubmit = async e => {
  e.preventDefault();
  const file = e.target.querySelector('#imageInput').files[0];
  const fd = new FormData(); fd.append('image',file);
  const res = await fetch(`${backendURL}/upload`,{
    method:'POST', headers:{Authorization:`Bearer ${authToken}`}, body:fd
  });
  const d = await res.json();
  if(res.ok){ showToast('Subida ✔️'); loadImages(); }
  else showToast(d.error,true);
};

// Cargar galería
async function loadImages(){
  const res = await fetch(`${backendURL}/images`);
  const imgs = await res.json();
  const gallery = document.getElementById('gallery');
  gallery.innerHTML = '';
  imgs.forEach(img => {
    const div = document.createElement('div'); div.className='gallery-item';
    div.innerHTML = `
      <img src="${img.image_url}" alt="" />
      <p>@${img.username}</p>
      <div class="button-row">
        <button class="like-btn" data-id="${img.id}">🔥</button>
        <span>${img.likes}</span>
      </div>`;
    gallery.append(div);
  });
  attachLikeHandlers();
}

// Likes
tmp function attachLikeHandlers(){
  document.querySelectorAll('.like-btn').forEach(btn=>{
    btn.onclick = async()=>{
      const id = btn.dataset.id;
      const res = await fetch(`${backendURL}/api/like/${id}`,{
        method:'POST', headers:{Authorization:`Bearer ${authToken}`}
      });
      const d = await res.json();
      if(res.ok){ btn.nextElementSibling.textContent = d.totalLikes; showToast('¡Like!'); btn.disabled=true; }
      else showToast(d.error,true);
    }
  });
}

// Init
window.onload = loadImages;
