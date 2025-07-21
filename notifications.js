document.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'https://momento-backend-production.up.railway.app/api';
  const notifList = document.getElementById('notifList');
  const notifBadge = document.getElementById('notifBadge'); // opcional

  const token = localStorage.getItem('token');
  if (!token || !notifList) return;

  async function marcarComoLeida(id) {
    try {
      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (err) {
      console.warn('Error al marcar notificación como leída:', err);
    }
  }

  async function fetchNotifications() {
    try {
      const res = await fetch(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const notifications = await res.json();
      notifList.innerHTML = '';

      if (!Array.isArray(notifications) || notifications.length === 0) {
        notifList.innerHTML = '<li style="padding: 0.5rem;">📭 No tienes notificaciones nuevas</li>';
        if (notifBadge) notifBadge.textContent = '🔕';
        return;
      }

      // Contador de no leídas
      const noLeidas = notifications.filter(n => !n.isRead).length;
      if (notifBadge) notifBadge.textContent = noLeidas > 0 ? `🔔 ${noLeidas}` : '🔕';

      notifications.forEach(noti => {
        const li = document.createElement('li');
        li.style.borderBottom = '1px solid #ddd';
        li.style.padding = '0.5rem';
        li.style.cursor = 'pointer';
        li.style.backgroundColor = noti.isRead ? '#f9f9f9' : '#fff';

        const autor = noti.sender?.username || 'Alguien';
        const content = document.createElement('div');
        content.innerHTML = `🦋 <strong>${autor}</strong>: ${noti.message}`;

        li.addEventListener('click', async () => {
          await marcarComoLeida(noti._id);
          li.style.backgroundColor = '#f9f9f9';
          content.innerHTML += ' <span style="color: gray;">(leída)</span>';
        });

        li.appendChild(content);
        notifList.appendChild(li);
      });
    } catch (err) {
      console.error('Error cargando notificaciones:', err);
      notifList.innerHTML = '<li style="padding: 0.5rem;">❌ Error al cargar notificaciones</li>';
      if (notifBadge) notifBadge.textContent = '❌';
    }
  }

  fetchNotifications();
});
