const API_URL = "https://momento-backend-production.up.railway.app/api";

const createPatchForm = document.getElementById('createPatchForm');
const patchNameInput = document.getElementById('patchName');
const patchMessageDiv = document.getElementById('patchMessage');

const userSearchInput = document.getElementById('userSearch');
const searchResults = document.getElementById('searchResults');

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
    const res = await fetch(`${API_URL}/circles`, {  // La API sigue usando /circles, ok?
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
      patchMessageDiv.textContent = `Parche "${data.name}" creado con éxito. ID: ${data._id}`;
      createPatchForm.reset();
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

    if (!res.ok) {
      searchResults.textContent = 'Error al buscar usuarios';
      return;
    }

    const users = await res.json();

    if (users.length === 0) {
      searchResults.textContent = 'No se encontraron usuarios';
      return;
    }

    users.forEach(user => {
      const li = document.createElement('li');
      li.textContent = `${user.name} (${user.email})`;
      li.dataset.userId = user._id;
      li.style.cursor = 'pointer';

      li.addEventListener('click', () => {
        alert(`Invitar usuario: ${user.name} (ID: ${user._id})`);
        // Aquí puedes agregar la función para enviar invitación al parche
      });

      searchResults.appendChild(li);
    });

  } catch (err) {
    console.error(err);
    searchResults.textContent = 'Error de conexión';
  }
});
