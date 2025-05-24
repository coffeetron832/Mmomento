// login.js

/**
 * Maneja el formulario de inicio de sesión.
 * Envía email y password al backend, guarda el token y redirige a main.html.
 */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const messageEl = document.getElementById('login-message');

  // Si ya hay token, evitar mostrar login y redirigir directo a main.html
  const existingToken = localStorage.getItem('token');
  if (existingToken) {
    window.location.replace('main.html'); // Reemplaza la página actual para evitar volver a login con flecha atrás
    return;
  }

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
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        messageEl.textContent = data.message || 'Login exitoso';
        messageEl.style.color = 'lightgreen';
        setTimeout(() => {
          window.location.replace('main.html'); // Reemplaza para evitar que vuelva a login con "atrás"
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
