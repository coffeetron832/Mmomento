const API = 'https://momento-backend-production.up.railway.app';

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const loginMessage = document.getElementById('login-message');
  loginMessage.textContent = '';

  if (!email || !password) {
    loginMessage.textContent = 'Por favor, completa todos los campos.';
    loginMessage.style.color = 'red';
    return;
  }

  try {
    const res = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const contentType = res.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await res.json() : {};

    if (res.status === 401) {
      loginMessage.textContent = data.error || 'Correo o contraseña incorrectos.';
      loginMessage.style.color = 'red';
      return;
    }

    if (!res.ok) {
      loginMessage.textContent = data.error || 'Error al iniciar sesión.';
      loginMessage.style.color = 'red';
      return;
    }

    if (data.token) {
      localStorage.setItem('momento_token', data.token);
      loginMessage.textContent = 'Inicio de sesión exitoso. Redirigiendo...';
      loginMessage.style.color = 'green';

      setTimeout(() => {
        window.location.replace('main.html');
      }, 1000);
    } else {
      loginMessage.textContent = 'Respuesta inesperada del servidor.';
      loginMessage.style.color = 'red';
    }
  } catch (err) {
    console.error('Error al intentar iniciar sesión:', err);
    loginMessage.textContent = 'Ocurrió un error de red o del servidor.';
    loginMessage.style.color = 'red';
  }
});

