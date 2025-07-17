// mural-toggle.js

const toggleFormBtn = document.getElementById('toggleFormBtn');
const aporteForm = document.getElementById('aporteForm');
const zoomControls = document.getElementById('zoomControls');

let formVisible = false;

toggleFormBtn?.addEventListener('click', () => {
  formVisible = !formVisible;

  if (formVisible) {
    aporteForm.classList.add('visible');
    zoomControls.classList.add('hide-on-mobile');
    toggleFormBtn.innerText = 'Ocultar';
  } else {
    aporteForm.classList.remove('visible');
    zoomControls.classList.remove('hide-on-mobile');
    toggleFormBtn.innerText = 'Mostrar';
  }
});
