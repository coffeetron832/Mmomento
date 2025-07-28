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
    userToken = data.token;
    localStorage.setItem('userToken', userToken);
    localStorage.setItem('username', data.username);
    window.location.href = 'mural.html';
  } else {
    alert(data.message || 'Código incorrecto');
  }
}
