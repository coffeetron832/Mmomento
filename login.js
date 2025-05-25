document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('login-form');
  const messageEl = document.getElementById('login-message');

  // 1) Comprobación de sesión al cargar
  try {
    const sessionRes = await fetch(
      'https://momento-backend-production.up.railway.app/api/auth/session',
      {
        method: 'GET',
        credentials: 'include'
      }
    );

    if (sessionRes.ok) {
      // Sesión válida: redirige YA y no inicializa el formulario
      return window.location.replace('main.html');
    }
  } catch (err) {
    console.error('Error comprobando sesión:', err);
    // Si hay error de conexión, dejamos seguir al formulario
  }

  // 2) Listener de submit de login
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
      const res = await fetch(
        'https://momento-backend-production.up.railway.app/api/auth/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password })
        }
      );
      const data = await res.json();

      if (res.ok) {
        // Redirige inmediatamente con replace
        return window.location.replace('main.html');
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
