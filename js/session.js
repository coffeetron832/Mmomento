// js/session.js
export function tokenExpirado(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const ahora = Math.floor(Date.now() / 1000);
    return payload.exp < ahora;
  } catch {
    return true;
  }
}

export async function verificarSesion() {
  const token = localStorage.getItem('token');
  let username = localStorage.getItem('username');

  if (!token || !username || tokenExpirado(token)) {
    throw new Error('local');
  }

  const res = await fetch('https://themural-backend-production.up.railway.app/api/auth/verificar', {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('remote');

  const data = await res.json();
  username = data.username || data.usuario?.username;
  if (!username) throw new Error('remote');

  localStorage.setItem('username', username);
  return { token, username };
}
