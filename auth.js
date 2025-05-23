// auth.js

/**
 * Asegura que exista un token JWT válido en localStorage.
 * Si no, redirige a login.html.
 */
async function asegurarSesion() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return false;
  }
  try {
    const res = await fetch('https://momento-backend-production.up.railway.app/api/auth/verify', {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!res.ok) throw new Error('Token inválido');
    return true;
  } catch (err) {
    console.error('Error al verificar sesión:', err);
    localStorage.removeItem('token');
    window.location.href = 'login.html';
    return false;
  }
}
