const API_BASE_URL = 'https://momento-backend-production.up.railway.app';

// Función para peticiones con fetch
async function apiRequest(endpoint, method = 'GET', body = null) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  try {
    const response = await fetch(endpoint, options);
    const contentType = response.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");

    if (!response.ok) {
      const errorMessage = isJson ? await response.json() : { message: `Error ${response.status}` };
      throw new Error(errorMessage.message || "Error en la solicitud");
    }

    return isJson ? response.json() : {};
  } catch (error) {
    console.error('❌ Error en fetch:', error);
    throw error;
  }
}

// Función para mostrar mensajes
function showMessage(message, type = 'success') {
  const box = document.getElementById('messageBox');
  if (!box) return;

  box.textContent = message;
  box.className = ''; // Reset
  box.classList.add(type);
  box.style.display = 'block';

  setTimeout(() => {
    box.style.display = 'none';
  }, 5000);
}

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  if (loginForm) {
  const emailInput = loginForm.querySelector("input[type='email']");
  const passwordInput = loginForm.querySelector("input[type='password']");
  const spinner = document.getElementById("emotionalSpinner");

  if (!emailInput || !passwordInput) {
    console.warn("⛔ Campos de login no encontrados.");
    return;
  }

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (spinner) spinner.style.display = "flex";

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    try {
      const result = await apiRequest(`${API_BASE_URL}/api/auth/login`, "POST", { email, password });

      if (result.token) {
        localStorage.clear();
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));

        const userName = result.user.username || result.user.name || 'viajero';
        localStorage.setItem("welcomeBackMessage", `🫂 ¡Hola, ${userName}! Nos alegra verte de nuevo 💫`);

        // ✨ Pequeña pausa para mostrar el spinner
        setTimeout(() => {
          window.location.href = "upload.html";
        }, 700);
      } else {
        showMessage(result.error || result.message || "Error al iniciar sesión", 'error');
        if (spinner) spinner.style.display = "none";
      }
    } catch (err) {
      showMessage("No se pudo iniciar sesión. Intenta más tarde.", 'error');
      if (spinner) spinner.style.display = "none";
    }
  });
}



  if (registerForm) {
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    if (!nameInput || !emailInput || !passwordInput) {
      console.warn("⛔ Campos de registro no encontrados.");
      return;
    }

    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const password = passwordInput.value;

      try {
        const result = await apiRequest(`${API_BASE_URL}/api/users/register`, "POST", { name, email, password });

        if (result.token) {
          localStorage.clear();
          localStorage.setItem("token", result.token);
          localStorage.setItem("user", JSON.stringify(result.user));
          showMessage("Registro exitoso", 'success');
          setTimeout(() => {
            window.location.href = "upload.html";
          }, 1800);
        } else {
          showMessage(result.error || result.message || "Error al registrarse", 'error');
        }
      } catch (err) {
        showMessage("No se pudo registrar. Intenta más tarde.", 'error');
      }
    });
  }
});
