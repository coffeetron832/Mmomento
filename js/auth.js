const API_BASE = 'https://themural-backend-production.up.railway.app/api/auth';

// 🔐 REGISTRO
export async function registrarUsuario(email, username, password) {
  try {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Error en el registro');

    alert('✅ Registro exitoso');
    return true;
  } catch (err) {
    alert(`⛔ ${err.message}`);
    return false;
  }
}

// 🔐 LOGIN
export async function iniciarSesion(email, password) {
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

    alert('🎉 Sesión iniciada con éxito');
    return true;
  } catch (err) {
    alert(`⛔ ${err.message}`);
    return false;
  }
}

// ✅ UTILIDADES

export function cerrarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  alert('👋 Has cerrado sesión');
}

export function obtenerUsuarioActual() {
  return {
    username: localStorage.getItem('username'),
    token: localStorage.getItem('token'),
  };
}
