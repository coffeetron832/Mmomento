document.getElementById("registerForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("registerName").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;

  // Enviar a backend
  console.log("Registrando:", name, email, password);
  // Simulamos éxito
  window.location.href = "mural.html";
});

document.getElementById("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  // Enviar a backend
  console.log("Iniciando sesión:", email, password);
  // Simulamos éxito
  window.location.href = "mural.html";
});
