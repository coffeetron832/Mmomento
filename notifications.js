document.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'https://momento-backend-production.up.railway.app/api';
  const notifList = document.getElementById('notifList');

  const token = localStorage.getItem('token');
  if (!token || !notifList) return;

  async function fetchNotifications() {
    try {
      const res = await fetch(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const notifications = await res.json();
      notifList.innerHTML = '';

      if (!Array.isArray(notifications) || notifications.length === 0) {
        notifList.innerHTML = '<li style="padding: 0.5rem;">📭 No tienes notificaciones nuevas</li>';
        return;
      }

      notifications.forEach(noti => {
        const li = document.createElement('li');
        li.style.borderBottom = '1px solid #ddd';
        li.style.padding = '0.5rem';

        const content = document.createElement('div');
        content.innerHTML = `🦋 ${noti.message}`;

        li.appendChild(content);
        notifList.appendChild(li);
      });
    } catch (err) {
      console.error('Error cargando notificaciones:', err);
      notifList.innerHTML = '<li style="padding: 0.5rem;">❌ Error al cargar notificaciones</li>';
    }
  }

  fetchNotifications();
});
