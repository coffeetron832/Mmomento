document.addEventListener('DOMContentLoaded', () => {
  const API_URL = "https://momento-backend-production.up.railway.app/api";

  const createPatchForm = document.getElementById('createPatchForm');
  const patchNameInput = document.getElementById('patchName');
  const patchMessageDiv = document.getElementById('patchMessage');

  const userSearchInput = document.getElementById('userSearch');
  const searchResults = document.getElementById('searchResults');

  let currentPatchId = null;

  createPatchForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = patchNameInput.value.trim();
    if (!name) return alert('El nombre es obligatorio');

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Debes iniciar sesión');
      return window.location.href = 'login.html';
    }

    try {
      const res = await fetch(`${API_URL}/patches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name })
      });

      const data = await res.json();

      if (res.ok) {
        patchMessageDiv.style.color = 'green';
        patchMessageDiv.textContent = `✅ Parche "${data.name}" creado con éxito`;
        createPatchForm.reset();
        currentPatchId = data._id;
      } else {
        patchMessageDiv.style.color = 'red';
        patchMessageDiv.textContent = data.error || 'Error creando parche';
      }
    } catch (err) {
      console.error('Error:', err);
      patchMessageDiv.style.color = 'red';
      patchMessageDiv.textContent = 'Error de conexión';
    }
  });

  const userSearchForm = document.getElementById('userSearchForm');
userSearchForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const query = userSearchInput.value.trim();
  if (query.length < 3) return alert('Escribe al menos 3 caracteres');

  const token = localStorage.getItem('token');
  if (!token) return window.location.href = 'login.html';

  try {
    const res = await fetch(`${API_URL}/patches/search/users?q=${encodeURIComponent(query)}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const users = await res.json();
    searchResults.innerHTML = '';

    if (!res.ok || !Array.isArray(users)) {
      return (searchResults.textContent = '❌ Error al buscar usuarios');
    }

    if (users.length === 0) {
      return (searchResults.textContent = '🔍 No se encontraron usuarios');
    }

    users.forEach(user => {
      const li = document.createElement('li');
      li.innerHTML = `
  <strong>@${user.username}</strong><br>
  <span style="color: ${user.soulprint?.soulColor || '#888'}">
    ${user.soulprint?.soulColorName || 'Color del alma'}
  </span><br>
  <em>${user.soulprint?.soulPhrase || 'Sin frase aún'}</em>
`;

      li.style.cursor = 'pointer';

      li.addEventListener('click', () => {
        if (!currentPatchId) return alert('Crea un parche primero');
        inviteUserToPatch(user._id, user.name);
      });

      searchResults.appendChild(li);
    });
  } catch (err) {
    console.error(err);
    searchResults.textContent = 'Error de conexión';
  }
});

async function loadUserPatches() {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch('https://momento-backend-production.up.railway.app/api/patches', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error('No se pudieron cargar los parches');
    const patches = await res.json();

    const ul = document.getElementById('userPatchesList');
    ul.innerHTML = '';

    if (patches.length === 0) {
      ul.innerHTML = '<li>No perteneces a ningún parche todavía 🫠</li>';
      return;
    }

    patches.forEach(patch => {
      const li = document.createElement('li');
      li.style.marginBottom = '15px';

      const title = document.createElement('strong');
      title.textContent = `🌱 ${patch.name}`;
      title.style.cursor = 'pointer';
      title.addEventListener('click', () => {
        const miembros = patch.members.map(m => m.username || 'Usuario').join(', ');
        alert(`👥 Miembros del parche:\n\n${miembros}`);
      });

      li.appendChild(title);

      // Si el usuario NO es el dueño, mostrar botón para salir
      if (patch.owner !== getCurrentUserId()) {
        const leaveBtn = document.createElement('button');
        leaveBtn.textContent = 'Salir';
        leaveBtn.style.marginLeft = '10px';
        leaveBtn.onclick = () => leavePatch(patch._id);
        li.appendChild(leaveBtn);
      }

      ul.appendChild(li);
    });

  } catch (error) {
    console.error('Error al cargar tus parches:', error);
  }
}



  // ✉️ Invitar usuario al parche
  async function inviteUserToPatch(userId, userName) {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/patches/${currentPatchId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      });

      const data = await res.json();

      if (res.ok) {
        alert(`✅ Invitación enviada a ${userName}`);
      } else {
        alert(`❌ ${data.error || 'No se pudo invitar a este usuario'}`);
      }
    } catch (err) {
      console.error(err);
      alert('❌ Error de conexión al invitar');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
  loadUserPatches();
});

});
