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

    const data = await res.json();

    if (!res.ok) {
      loginMessage.textContent = data.error || 'Credenciales inválidas.';
      loginMessage.style.color = 'red';
      return;
    }

    // Guardar el token
    localStorage.setItem('momento_token', data.token);

    // Redirigir a main.html
    window.location.replace('main.html');
  } catch (err) {
    console.error(err);
    loginMessage.textContent = 'Ocurrió un error al intentar iniciar sesión.';
    loginMessage.style.color = 'red';
  }
});

