document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      const result = await apiRequest("/auth/login", "POST", { email, password });
      if (result.token) {
        localStorage.setItem("token", result.token);
        alert("Sesión iniciada");
        window.location.href = "upload.html";
      } else {
        alert(result.message || "Error al iniciar sesión");
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      const result = await apiRequest("/auth/register", "POST", { name, email, password });
      if (result.token) {
        localStorage.setItem("token", result.token);
        alert("Registro exitoso");
        window.location.href = "upload.html";
      } else {
  alert(result.message || "Error al registrarse");
  console.error("Error al registrarse:", result);
}
    });
  }
});

