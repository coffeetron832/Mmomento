const API_BASE = 'https://themural-backend-production.up.railway.app/api/auth';

// 🔐 REGISTRO
document.getElementById('registroBtn').addEventListener('click', async () => {
  const email = document.getElementById('registroEmail').value.trim();
  const username = document.getElementById('usernameInput').value.trim();
  const password = document.getElementById('passwordInput').value.trim();

  if (!email || !username || !password) {
    alert('⛔ Todos los campos son obligatorios');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Error al registrarse');

    alert('✅ Registro exitoso. Ahora puedes iniciar sesión.');
    mostrarLogin();
  } catch (err) {
    alert(`⛔ ${err.message}`);
  }
});

// 🔐 LOGIN
document.getElementById('loginBtn').addEventListener('click', async () => {
  const email = document.getElementById('loginUsername').value.trim(); // 👈 Aquí se está usando `username` como si fuera correo
  const password = document.getElementById('loginPassword').value.trim();

  if (!email || !password) {
    alert('⛔ Correo y contraseña son obligatorios');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión');

    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.username);

    alert(`🎉 Bienvenido, ${data.username}`);
    window.location.href = 'mural.html';
  } catch (err) {
    alert(`⛔ ${err.message}`);
  }
});
