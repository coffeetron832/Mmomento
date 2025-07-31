const API_BASE = 'https://themural-backend-production.up.railway.app/api/auth';

// REGISTRO
const registroBtn = document.getElementById('registroBtn');
if (registroBtn) {
  registroBtn.addEventListener('click', async () => {
    const username = document.getElementById('usernameInput').value.trim();
    const email = document.getElementById('registroEmail').value.trim();
    const password = document.getElementById('passwordInput').value;

    if (!username || !email || !password) {
      alert('Por favor, completa todos los campos');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Error al registrar');
      }

      const data = await res.json();
      localStorage.setItem('token', data.token); // guarda token
      localStorage.setItem('username', data.username); // guarda username
      window.location.href = 'mural.html'; // redirige
    } catch (err) {
      alert(err.message);
    }
  });
}

// LOGIN
const loginBtn = document.getElementById('loginBtn');
if (loginBtn) {
  loginBtn.addEventListener('click', async () => {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!username || !password) {
      alert('Por favor, completa todos los campos');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Credenciales incorrectas');
      }

      const data = await res.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      window.location.href = 'mural.html';
    } catch (err) {
      alert(err.message);
    }
  });
}
