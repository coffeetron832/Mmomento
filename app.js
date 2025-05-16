document.addEventListener('DOMContentLoaded', () => {
  const backendURL     = 'https://calm-aback-vacuum.glitch.me';
  const otpRequestForm = document.getElementById('otp-request-form');
  const otpVerifyForm  = document.getElementById('otp-verify-form');
  const uploadForm     = document.getElementById('image-upload-form');
  const galleryDiv     = document.getElementById('gallery');
  let jwtToken         = localStorage.getItem('token') || null;

  // Oculta los formularios secundarios al cargar
  if (otpVerifyForm) otpVerifyForm.style.display = 'none';
  if (uploadForm)     uploadForm.style.display   = 'none';

  // Solicitar OTP
  if (otpRequestForm) {
    otpRequestForm.onsubmit = async e => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      try {
        const res = await fetch(`${backendURL}/api/otp/request`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        alert(data.message || data.error);
        if (res.ok) {
          otpRequestForm.style.display = 'none';
          if (otpVerifyForm) otpVerifyForm.style.display = 'block';
        }
      } catch (err) {
        alert('Error de conexión al solicitar OTP');
      }
    };
  }

  // Verificar OTP
  if (otpVerifyForm) {
    otpVerifyForm.onsubmit = async e => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const otp   = document.getElementById('otp').value;
      try {
        const res = await fetch(`${backendURL}/api/otp/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp })
        });
        const data = await res.json();
        if (res.ok && data.token) {
          localStorage.setItem('token', data.token);
          alert('Autenticado correctamente');
          window.location.href = 'main.html';  // Redirige a la página principal
        } else {
          alert(data.error || 'Código incorrecto');
        }
      } catch (err) {
        alert('Error al verificar OTP');
      }
    };
  }

  // Subida de imagen
  if (uploadForm) {
    uploadForm.onsubmit = async e => {
      e.preventDefault();
      const file = document.getElementById('image').files[0];
      if (!file) return alert('Selecciona una imagen');
      const formData = new FormData();
      formData.append('imagen', file);
      try {
        const res = await fetch(`${backendURL}/api/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${jwtToken}` },
          body: formData
        });
        const data = await res.json();
        alert(data.mensaje || data.error);
        if (res.ok) loadGallery();
      } catch (err) {
        console.error('Error subiendo imagen:', err);
        alert('Error de conexión al subir imagen');
      }
    };
  }

  // Cargar galería
  async function loadGallery() {
    if (!galleryDiv) return;
    try {
      const res = await fetch(`${backendURL}/api/imagenes`);
      const imgs = await res.json();
      galleryDiv.innerHTML = '';
      imgs.forEach(file => {
        const imgEl = document.createElement('img');
        imgEl.src = `${backendURL}/uploads/${file}`;
        imgEl.alt = file;
        galleryDiv.appendChild(imgEl);
      });
    } catch (err) {
      console.error('Error cargando galería:', err);
    }
  }

});

