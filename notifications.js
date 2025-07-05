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

        // Si es tipo invitación a parche, agregar botones
        if (noti.type === 'invitacion_parche' && noti.patchId) {
          const btns = document.createElement('div');
          btns.style.marginTop = '0.5rem';

          const acceptBtn = document.createElement('button');
          acceptBtn.textContent = 'Aceptar';
          acceptBtn.style.marginRight = '0.5rem';
          acceptBtn.style.cursor = 'pointer';

          const rejectBtn = document.createElement('button');
          rejectBtn.textContent = 'Rechazar';
          rejectBtn.style.cursor = 'pointer';

          acceptBtn.onclick = async () => {
            try {
              const res = await fetch(`${API_URL}/patches/${noti.patchId}/request/${noti.sender._id}/accept`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
              });
              if (res.ok) {
                li.innerHTML = `✅ Te has unido al parche.`;
              } else {
                li.innerHTML = `❌ Error al aceptar.`;
              }
            } catch (err) {
              console.error(err);
            }
          };

          rejectBtn.onclick = async () => {
            try {
              const res = await fetch(`${API_URL}/patches/${noti.patchId}/request/${noti.sender._id}/reject`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
              });
              if (res.ok) {
                li.innerHTML = `🚫 Invitación rechazada.`;
              } else {
                li.innerHTML = `❌ Error al rechazar.`;
              }
            } catch (err) {
              console.error(err);
            }
          };

          btns.appendChild(acceptBtn);
          btns.appendChild(rejectBtn);
          li.appendChild(btns);
        }

        notifList.appendChild(li);
      });
    } catch (err) {
      console.error('Error cargando notificaciones:', err);
      notifList.innerHTML = '<li style="padding: 0.5rem;">❌ Error al cargar notificaciones</li>';
    }
  }

  fetchNotifications();
});
