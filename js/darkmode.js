document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('darkModeToggle');
  const body = document.body;
  if (!toggle) return;

  if (localStorage.getItem('darkMode') === 'true') {
    body.classList.add('dark-mode');
    toggle.textContent = '☀️';
  } else {
    toggle.textContent = '🌙';
  }

  toggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    toggle.textContent = isDark ? '☀️' : '🌙';
  });
});
