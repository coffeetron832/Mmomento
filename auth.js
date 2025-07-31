const API_URL = "https://themural-backend-production.up.railway.app/api/auth";

// Registro
document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("registerName").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;

  try {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.msg || "Error al registrar");
      return;
    }

    // Guardar token
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", data.name);
    window.location.href = "mural.html";
  } catch (err) {
    alert("Error de conexión.");
    console.error(err);
  }
});

// Login
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.msg || "Error al iniciar sesión");
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", data.name);
    window.location.href = "mural.html";
  } catch (err) {
    alert("Error de conexión.");
    console.error(err);
  }
});
