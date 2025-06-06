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
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
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
        const result = await apiRequest("/auth/login", "POST", { email, password });
        if (result.token) {
          localStorage.clear(); // limpiar sesión previa para evitar conflictos
          localStorage.setItem("token", result.token);
          localStorage.setItem("user", JSON.stringify(result.user));
          alert("Sesión iniciada");
          window.location.href = "upload.html";
        } else {
          alert(result.error || result.message || "Error al iniciar sesión");
          console.error("Error en login:", result);
        }
      } catch (err) {
        alert("Error al conectar con el servidor.");
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
        const result = await apiRequest("/auth/register", "POST", { name, email, password });
        if (result.token) {
          localStorage.clear();
          localStorage.setItem("token", result.token);
          localStorage.setItem("user", JSON.stringify(result.user));
          alert("Registro exitoso");
          window.location.href = "upload.html";
        } else {
          alert(result.error || result.message || "Error al registrarse");
          console.error("Error en registro:", result);
        }
      } catch (err) {
        alert("Error al conectar con el servidor.");
        console.error("❌ Error en fetch (registro):", err);
      }
    });
  }
});
