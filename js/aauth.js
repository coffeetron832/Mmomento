export function verificarToken() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Debes iniciar sesión para usar el mural.');
    window.location.href = '/index.html';
    return false;
  }
  return true;
}

export function obtenerUsuarioDesdeToken() {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.username;
  } catch (err) {
    console.error('Error decodificando token:', err);
    return null;
  }
}
