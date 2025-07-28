const username = localStorage.getItem('username');
const token = localStorage.getItem('userToken');

if (!token || !username) {
  window.location.href = 'index.html';
}

document.getElementById('username').textContent = username;

// Manejar envío del formulario
document.getElementById('aporteForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const texto = document.getElementById('textoAporte').value;

  const res = await fetch('https://themural-backend-production.up.railway.app/api/aportes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ texto })
  });

  if (res.ok) {
    document.getElementById('textoAporte').value = '';
    cargarAportes();
  } else {
    alert('Error publicando el aporte.');
  }
});

// Cargar aportes
async function cargarAportes() {
  const res = await fetch('https://themural-backend-production.up.railway.app/api/aportes');
  const data = await res.json();

  const container = document.getElementById('aportesContainer');
  container.innerHTML = '';

  data.forEach(aporte => {
    const div = document.createElement('div');
    div.className = 'aporte';

const fecha = new Date(aporte.createdAt).toLocaleString('es-CO', {
  dateStyle: 'medium',
  timeStyle: 'short'
});

div.innerHTML = `
  <div class="autor">${aporte.username}</div>
  <div class="fecha">${fecha}</div>
  <div class="contenido">${aporte.texto}</div>
`;

    container.appendChild(div);
  });
}

cargarAportes();

// Logout
async function logout() {
  await fetch('https://themural-backend-production.up.railway.app/api/auth/logout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  localStorage.clear();
  window.location.href = 'index.html';
}
