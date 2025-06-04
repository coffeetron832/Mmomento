document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        const result = await apiRequest("/auth/login", "POST", { email, password });
        if (result.token) {
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
      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        const result = await apiRequest("/auth/register", "POST", { name, email, password });
        if (result.token) {
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
