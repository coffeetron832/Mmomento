const backendURL = 'https://calm-aback-vacuum.glitch.me/'; // Asegúrate de poner la URL correcta

document.addEventListener('DOMContentLoaded', () => {
  const otpRequestForm = document.getElementById('otpRequestForm');
  const otpVerifyForm  = document.getElementById('otpVerifyForm');
  const authSection    = document.getElementById('authSection');
  const uploadSection  = document.getElementById('uploadSection');
  const gallery        = document.getElementById('gallery');
  let sessionToken     = null;

  // 1) Solicitar OTP
  otpRequestForm.onsubmit = async e => {
    e.preventDefault();
    const name    = document.getElementById('nameInput').value.trim();
    const contact = document.getElementById('contact').value.trim();

    try {
      const res = await fetch(`${backendURL}/api/otp/request`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ name, contact })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Código enviado a tu correo');
        otpRequestForm.style.display = 'none';
        otpVerifyForm.style.display  = 'block';
      } else {
        alert(data.error || 'Error al solicitar código');
      }
    } catch (err) {
      console.error('Error al solicitar OTP:', err);
      alert('Error de conexión');
    }
  };

  // 2) Verificar OTP
  otpVerifyForm.onsubmit = async e => {
    e.preventDefault();
    const code = document.getElementById('otpCode').value.trim();

    try {
      const res = await fetch(`${backendURL}/api/otp/verify`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        sessionToken = data.token;
        alert('Autenticación exitosa');
        authSection.style.display   = 'none';
        uploadSection.style.display = 'block';
        loadImages();
      } else {
        alert(data.error || 'Código inválido');
      }
    } catch (err) {
      console.error('Error al verificar OTP:', err);
      alert('Error de conexión');
    }
  };

  // 3) Subir imagen
  document.getElementById('uploadForm').onsubmit = async e => {
    e.preventDefault();
    const file = document.getElementById('imageInput').files[0];
    if (!file) return alert('Selecciona una imagen');
    const fd = new FormData();
    fd.append('image', file);

    try {
      const res = await fetch(`${backendURL}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${sessionToken}` },
        body: fd
      });
      const data = await res.json();
      if (res.ok) {
        alert('Imagen subida con éxito');
        loadImages();
        e.target.reset();
      } else {
        alert(data.error || 'Error al subir imagen');
      }
    } catch (err) {
      console.error('Error al subir:', err);
      alert('Error de conexión al subir');
    }
  };

  // 4) Cargar galería
  async function loadImages() {
    try {
      const res = await fetch(`${backendURL}/images`);
      const imgs = await res.json();
      gallery.innerHTML = '';
      imgs.forEach(img => {
        const div = document.createElement('div');
        div.className = 'gallery-item';
        div.innerHTML = `
          <img src="${img.image_url}" alt="moment" />
          <p><strong>${img.username}</strong></p>
          <p>❤️ ${img.likes}</p>
          <button class="like-btn" data-id="${img.id}">Me gusta</button>
        `;
        gallery.appendChild(div);
      });
      attachLikeHandlers();
    } catch (err) {
      console.error('Error al cargar la galería:', err);
    }
  }

  // 5) Likes
  function attachLikeHandlers() {
    document.querySelectorAll('.like-btn').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.dataset.id;
        try {
          const res = await fetch(`${backendURL}/api/like/${id}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${sessionToken}` }
          });
          const data = await res.json();
          if (res.ok) {
            loadImages();
          } else {
            alert(data.error || 'Error al dar like');
          }
        } catch (err) {
          console.error('Error en like:', err);
          alert('Error de conexión al dar like');
        }
      };
    });
  }
});

// Inicio
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('uploadSection').style.display = 'none';
  loadImages();
});
