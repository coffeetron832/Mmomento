const API_BASE_URL = 'https://momento-backend-production.up.railway.app';

// Función auxiliar para hacer peticiones al backend con fetch
async function apiRequest(endpoint, method = 'GET', body = null) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

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

// Función para mostrar mensajes en el contenedor con estilos
function showMessage(message, type = 'success') {
  const messageBox = document.getElementById('messageBox');
  if (!messageBox) return;

  messageBox.textContent = message;
  messageBox.className = ''; // limpia clases
  messageBox.classList.add(type);
  messageBox.style.display = 'block';

  // Opcional: que el mensaje desaparezca después de 5 segundos
  setTimeout(() => {
    messageBox.style.display = 'none';
  }, 5000);
}

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;

      try {
        const result = await apiRequest(`${API_BASE_URL}/api/auth/login`, "POST", { email, password });

        if (result.token) {
          localStorage.clear();
          localStorage.setItem("token", result.token);
          localStorage.setItem("user", JSON.stringify(result.user));

          // Mostrar mensaje con el nombre del usuario y mensaje personalizado
          showMessage(`¡Hola, ${result.user.username}! Nos alegra verte de nuevo. 👋`, 'success');

          // Redirigir después de mostrar mensaje (puedes cambiar el tiempo aquí)
          setTimeout(() => {
            window.location.href = "upload.html";
          }, 1800);
        } else {
          showMessage(result.error || result.message || "Error al iniciar sesión", 'error');
          console.error("⚠️ Error en login:", result);
        }
      } catch (err) {
        showMessage("No se pudo iniciar sesión. Revisa tus datos o intenta más tarde.", 'error');
        console.error("❌ Error en fetch (login):", err);
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;

      try {
        const result = await apiRequest(`${API_BASE_URL}/api/auth/register`, "POST", { name, email, password });

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
          console.error("⚠️ Error en registro:", result);
        }
      } catch (err) {
        showMessage("No se pudo registrar. Intenta más tarde.", 'error');
        console.error("❌ Error en fetch (registro):", err);
      }
    });
  }
});


