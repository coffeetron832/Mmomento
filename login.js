document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const messageEl = document.getElementById('login-message');

  // Al cargar, verificamos si hay sesión activa preguntando al backend
  fetch('https://momento-backend-production.up.railway.app/api/auth/session', {
    method: 'GET',
    credentials: 'include'  // para enviar cookie con la petición
  }).then(res => {
    if (res.ok) {
      // Si sesión válida, redirige directo a main.html
      window.location.replace('main.html');
    }
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    if (!email || !password) {
      messageEl.textContent = 'Ingresa correo y contraseña';
      messageEl.style.color = 'orange';
      return;
    }
    messageEl.textContent = 'Procesando...';

    try {
      const res = await fetch('https://momento-backend-production.up.railway.app/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // importante para que el navegador guarde cookie
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (res.ok) {
        messageEl.textContent = data.message || 'Login exitoso';
        messageEl.style.color = 'lightgreen';
        setTimeout(() => {
          window.location.replace('main.html');
        }, 1000);
      } else {
        messageEl.textContent = data.error || 'Credenciales inválidas';
        messageEl.style.color = 'salmon';
      }
    } catch (err) {
      console.error('Error en login:', err);
      messageEl.textContent = 'Error de conexión';
      messageEl.style.color = 'red';
    }
  });
});
