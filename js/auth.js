let userEmail = '';
let userToken = '';

async function sendVerificationCode() {
  const email = document.getElementById('emailInput').value;
  if (!email) return alert('Por favor ingresa tu correo.');

  userEmail = email;

  const res = await fetch('https://themural-backend-production.up.railway.app/api/auth/send-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });

  const data = await res.json();
  if (res.ok) {
    document.getElementById('step1').style.display = 'none';
    document.getElementById('step2').style.display = 'block';
    alert('Código enviado. Revisa tu correo.');
  } else {
    alert(data.message || 'Error enviando código');
  }
}

async function verifyCode() {
  const code = document.getElementById('codeInput').value;

  const res = await fetch('https://themural-backend-production.up.railway.app/api/auth/verify-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: userEmail, code })
  });

  const data = await res.json();

  if (res.ok) {
    const username = data.username;
    userToken = data.token;

    localStorage.setItem('userToken', userToken);
    localStorage.setItem('username', username);

    // Mostrar el nombre generado
    document.getElementById('step2').innerHTML = `
      <p>¡Bienvenido, <strong>${username}</strong>!</p>
      <button onclick="goToMural()">Entrar al mural</button>
    `;
  } else {
    alert(data.message || 'Código incorrecto');
  }
}


async function logout() {
  const token = localStorage.getItem('userToken');

  await fetch('https://themural-backend-production.up.railway.app/api/auth/logout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  localStorage.clear();
  window.location.href = 'index.html';
}

function goToMural() {
  window.location.href = 'mural.html';
}

