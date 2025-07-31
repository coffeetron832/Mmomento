// auth.js
export function iniciarTemporizadorDeSesion(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const tiempoExpiracion = payload.exp * 1000;
    const ahora = Date.now();
    const tiempoRestante = tiempoExpiracion - ahora;

    if (tiempoRestante <= 0) {
      cerrarSesionAutomatica();
      return;
    }

    setTimeout(() => alert('⚠️ Tu sesión expira en 1 minuto.'), tiempoRestante - 60000);
    setTimeout(cerrarSesionAutomatica, tiempoRestante);

  } catch (err) {
    console.warn('⚠️ Error al iniciar temporizador:', err);
  }
}

export function cerrarSesionAutomatica() {
  const token = localStorage.getItem('userToken');
  const username = localStorage.getItem('username');

  if (!token || !username) return;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiraEn = payload.exp - payload.iat;

    if (expiraEn <= 10800) {
      fetch('https://themural-backend-production.up.railway.app/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    }
  } catch (err) {
    console.warn('❌ Error al detectar expiración de sesión:', err);
  }

  localStorage.clear();
  alert('Tu sesión ha expirado. Si eras un usuario temporal, tus aportes fueron eliminados.');
  window.location.href = 'index.html';
}

export async function logout() {
  const token = localStorage.getItem('userToken');
  if (!token) {
    localStorage.clear();
    window.location.href = 'index.html';
    return;
  }

  try {
    await fetch('https://themural-backend-production.up.railway.app/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  } catch (err) {
    console.error('❌ Error al cerrar sesión:', err);
  }

  localStorage.clear();
  window.location.href = 'index.html';
}
