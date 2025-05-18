document.addEventListener('DOMContentLoaded', () => {
  const backendURL     = 'https://calm-aback-vacuum.glitch.me';
  const otpRequestForm = document.getElementById('otp-request-form');
  const otpVerifyForm  = document.getElementById('otp-verify-form');
  const uploadForm     = document.getElementById('image-upload-form');
  const galleryDiv     = document.getElementById('gallery');
  const logoutBtn      = document.getElementById('logout-btn');
  const mensajeDiv     = document.getElementById('mensaje');
  let jwtToken         = localStorage.getItem('token') || null;

  // ===== Login =====
  if (otpRequestForm && otpVerifyForm) {
    otpVerifyForm.style.display = 'none';

    otpRequestForm.onsubmit = async e => {
      e.preventDefault();
      const username = document.getElementById('username').value.trim();
      const email    = document.getElementById('email').value.trim();
      mensajeDiv.textContent = '';

      if (!username || !email) {
        mensajeDiv.textContent = 'Por favor, ingresa usuario y correo';
        return;
      }

      try {
        const res = await fetch(`${backendURL}/api/otp/request`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email })
        });
        const data = await res.json();
        mensajeDiv.textContent = data.message || data.error || 'Error inesperado';
        if (res.ok) {
          otpRequestForm.style.display = 'none';
          otpVerifyForm.style.display  = 'block';
        }
      } catch (err) {
        mensajeDiv.textContent = 'Error de conexión al solicitar OTP';
        console.error(err);
      }
    };

    otpVerifyForm.onsubmit = async e => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const otp   = document.getElementById('otp').value;
      mensajeDiv.textContent = '';
      try {
        const res = await fetch(`${backendURL}/api/otp/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp })
        });
        const data = await res.json();
        if (res.ok && data.token) {
          localStorage.setItem('token', data.token);
          window.location.href = 'main.html';
        } else {
          mensajeDiv.textContent = data.error || 'Código incorrecto';
        }
      } catch {
        mensajeDiv.textContent = 'Error de conexión';
      }
    };
    return;
  }

  // ===== Main =====
  if (uploadForm && galleryDiv) {
    if (!jwtToken) return window.location.href = 'index.html';

    uploadForm.style.display = 'block';
    if (logoutBtn) logoutBtn.style.display = 'block';
    loadGallery();

    uploadForm.onsubmit = async e => {
      e.preventDefault();
      mensajeDiv.textContent = '';
      const file = document.getElementById('image').files[0];
      if (!file) return mensajeDiv.textContent = 'Selecciona una imagen';
      const formData = new FormData();
      formData.append('imagen', file);
      try {
        const res = await fetch(`${backendURL}/api/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${jwtToken}` },
          body: formData
        });
        const data = await res.json();
        mensajeDiv.textContent = data.mensaje || data.error;
        if (res.ok) loadGallery();
      } catch {
        mensajeDiv.textContent = 'Error de conexión';
      }
    };

    logoutBtn.onclick = () => {
      localStorage.removeItem('token');
      window.location.href = 'index.html';
    };

    async function loadGallery() {
      try {
        const res = await fetch(`${backendURL}/api/imagenes`);
        const imgs = await res.json();
        galleryDiv.innerHTML = '';
        imgs.forEach(img => {
          const card = document.createElement('div');
          card.className = 'image-card';

          const image = document.createElement('img');
          image.src = `${backendURL}/uploads/${img.filename}`;
          image.alt = img.filename;

          const info = document.createElement('div');
          info.className = 'image-info';
          info.innerHTML = `
            <strong>${img.usuario}</strong><br>
            <span>Subida: ${new Date(img.fechaSubida).toLocaleString()}</span><br>
            <span>Expira: ${new Date(img.expiraEn).toLocaleString()}</span>
          `;

          // Botón Eliminar
          const delBtn = document.createElement('button');
          delBtn.textContent = '🗑️ Eliminar';
          delBtn.disabled = false;
          delBtn.onclick = () => {
            if (!confirm(`¿Eliminar esta imagen de ${img.usuario}?`)) return;
            delBtn.disabled = true;
            eliminarImagen(img.filename, delBtn);
          };

          // Botón Reportar
          const reportBtn = document.createElement('button');
          reportBtn.textContent = '🚩 Reportar';
          reportBtn.disabled = false;
          reportBtn.onclick = () => {
            if (!confirm(`¿Reportar esta imagen de ${img.usuario}?`)) return;
            reportBtn.disabled = true;
            reportarImagen(img.filename, reportBtn);
          };

          card.append(image, info, delBtn, reportBtn);
          galleryDiv.appendChild(card);
        });
      } catch (err) {
        console.error('Error cargando galería:', err);
      }
    }

    /**
     * Elimina una imagen y refresca la galería.
     * @param {string} filename 
     * @param {HTMLButtonElement} btn 
     */
    async function eliminarImagen(filename, btn) {
      try {
        const res = await fetch(`${backendURL}/api/eliminar/${filename}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${jwtToken}` }
        });
        const data = await res.json();
        mensajeDiv.textContent = data.mensaje || data.error;
        if (res.ok) {
          setTimeout(() => loadGallery(), 300);
        } else {
          btn.disabled = false;
        }
      } catch (err) {
        mensajeDiv.textContent = 'Error de conexión';
        console.error(err);
        btn.disabled = false;
      }
    }

    /**
     * Reporta una imagen al backend.
     * @param {string} filename 
     * @param {HTMLButtonElement} btn 
     */
    async function reportarImagen(filename, btn) {
      try {
        const res = await fetch(`${backendURL}/api/reportar`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ filename })
        });
        const data = await res.json();
        mensajeDiv.textContent = data.message || data.error || 'Respuesta inesperada';
        if (!res.ok) btn.disabled = false;
      } catch (err) {
        mensajeDiv.textContent = 'Error de conexión al reportar';
        console.error(err);
        btn.disabled = false;
      }
    }
  }
});
