// register.js

async function sha1(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

async function checkPasswordPwned(password) {
  const hash = await sha1(password);
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);

  const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
  const text = await response.text();

  return text.split('\n').some(line => {
    const [hashSuffix] = line.split(':');
    return hashSuffix === suffix;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('register-form');
  const messageEl = document.getElementById('register-message');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('reg-username').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value.trim();

    // Validaciones básicas
    if (!username || !email || !password) {
      messageEl.style.color = 'orange';
      messageEl.textContent = 'Todos los campos son obligatorios';
      return;
    }

    if (password.length < 8) {
      messageEl.style.color = 'orange';
      messageEl.textContent = 'La contraseña debe tener al menos 8 caracteres';
      return;
    }

    messageEl.style.color = '#1A1A1A';
    messageEl.textContent = 'Validando contraseña...';

    try {
      const pwned = await checkPasswordPwned(password);
      if (pwned) {
        messageEl.style.color = 'red';
        messageEl.textContent = 'La contraseña que elegiste ha sido comprometida en filtraciones. Por favor, usa otra.';
        return;
      }
    } catch (error) {
      console.warn('Error al verificar contraseña comprometida:', error);
      // No bloqueamos al usuario si falla la verificación externa
    }

    messageEl.textContent = 'Procesando registro...';

    try {
      const res = await fetch('https://momento-backend-production.up.railway.app/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      const data = await res.json();

      if (res.ok) {
        // Guardar token y usuario en localStorage de forma consistente
        localStorage.setItem('momento_token', data.token);
        localStorage.setItem('momento_user', data.username || username);

        // Redirigir a la página principal
        window.location.href = 'main.html';
      } else {
        messageEl.style.color = 'salmon';
        messageEl.textContent = data.error || 'Error en el registro';
      }
    } catch (err) {
      console.error('Error en registro:', err);
      messageEl.style.color = 'red';
      messageEl.textContent = 'Error de conexión';
    }
  });
});
