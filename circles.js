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
    const res = await fetch(`${API_URL}/patches`, {  // ← ACTUALIZADO
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
      currentPatchId = data._id;  // Guardamos ID del parche para invitar usuarios
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

userSearchInput.addEventListener('input', async () => {
  const query = userSearchInput.value.trim();
  searchResults.innerHTML = '';

  if (query.length < 3) return;

  const token = localStorage.getItem('token');
  if (!token) {
    alert('Debes iniciar sesión');
    return window.location.href = 'login.html';
  }

  try {
    const res = await fetch(`${API_URL}/users/search?query=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const users = await res.json();

    if (!res.ok || !Array.isArray(users)) {
      searchResults.textContent = '❌ Error al buscar usuarios';
      return;
    }

    if (users.length === 0) {
      searchResults.textContent = '🔍 No se encontraron usuarios';
      return;
    }

    users.forEach(user => {
      const li = document.createElement('li');
      li.textContent = `${user.name} (${user.email})`;
      li.dataset.userId = user._id;
      li.style.cursor = 'pointer';

      li.addEventListener('click', () => {
        if (!currentPatchId) {
          alert('Crea un parche primero antes de invitar usuarios.');
          return;
        }

        inviteUserToPatch(user._id, user.name);
      });

      searchResults.appendChild(li);
    });

  } catch (err) {
    console.error(err);
    searchResults.textContent = 'Error de conexión';
  }
});

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
