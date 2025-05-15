const backendURL = 'https://calm-aback-vacuum.glitch.me';

const otpRequestForm = document.getElementById('otp-request-form');
const otpVerifyForm = document.getElementById('otp-verify-form');

otpRequestForm.onsubmit = async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;

  try {
    const res = await fetch(`${backendURL}/api/otp/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Error enviando OTP');
    }

    alert('OTP enviado a tu correo');
  } catch (err) {
    console.error('Error al solicitar OTP:', err);
  }
};

otpVerifyForm.onsubmit = async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const otp = document.getElementById('otp').value;

  try {
    const res = await fetch(`${backendURL}/api/otp/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, otp })
    });

    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Respuesta no-JSON');
    }

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'OTP incorrecto');
    }

    alert('OTP verificado correctamente');
  } catch (err) {
    console.error('Error al verificar OTP:', err);
  }
};

