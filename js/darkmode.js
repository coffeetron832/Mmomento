document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('darkModeToggle');
  const body = document.body;
  if (!toggle) return;

  // Inicializa modo oscuro y emoji según localStorage
  if (localStorage.getItem('darkMode') === 'true') {
    body.classList.add('dark-mode');
    toggle.textContent = '☀️'; // Sol cuando está en modo oscuro
  } else {
    toggle.textContent = '🌙'; // Luna cuando está en modo claro
  }

  // Cambia modo oscuro y emoji al hacer clic
  toggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    toggle.textContent = isDark ? '☀️' : '🌙';
  });
});
