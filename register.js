// register.js

/**
 * Maneja el formulario de registro de usuario.
 * Envía username, email y password al backend y muestra feedback.
 */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('register-form');
  const messageEl = document.getElementById('register-message');

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const username = document.getElementById('reg-username').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value.trim();

    if (!username || !email || !password) {
      messageEl.textContent = 'Todos los campos son obligatorios';
      messageEl.style.color = 'orange';
      return;
    }
    messageEl.textContent = 'Procesando...';

    try {
      const res = await fetch('https://momento-backend-production.up.railway.app/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();

      if (res.ok) {
        messageEl.textContent = data.message || 'Registro exitoso';
        messageEl.style.color = 'lightgreen';
        form.reset();
      } else {
        messageEl.textContent = data.error || 'Error en el registro';
        messageEl.style.color = 'salmon';
      }
    } catch (err) {
      console.error('Error en registro:', err);
      messageEl.textContent = 'Error de conexión';
      messageEl.style.color = 'red';
    }
  });
});
