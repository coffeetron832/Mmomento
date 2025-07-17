// mural-preview.js

const tipoInput = document.getElementById('tipo');
const imagenInput = document.getElementById('imagenInput');
const preview = document.getElementById('preview');
const previewImg = document.getElementById('previewImg');

// Cuando el usuario cambia el tipo de aporte
tipoInput?.addEventListener('change', () => {
  if (tipoInput.value === 'imagen') {
    preview.classList.remove('hidden');
  } else {
    preview.classList.add('hidden');
    previewImg.src = '';
    imagenInput.value = '';
  }
});

// Cuando el usuario selecciona una imagen
imagenInput?.addEventListener('change', () => {
  const file = imagenInput.files[0];
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = e => {
      previewImg.src = e.target.result;
      preview.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  } else {
    previewImg.src = '';
    preview.classList.add('hidden');
  }
});
