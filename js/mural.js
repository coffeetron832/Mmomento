const tipo = document.getElementById('tipo');
const contenido = document.getElementById('contenido');
const imagenInput = document.getElementById('imagenInput');
const preview = document.getElementById('preview');
const previewImg = document.getElementById('previewImg');

tipo.addEventListener('change', () => {
  const selected = tipo.value;
  contenido.style.display = selected === 'frase' || selected === 'emoji' ? 'block' : 'none';
  imagenInput.style.display = selected === 'imagen' ? 'block' : 'none';
  doodleControls.style.display = selected === 'doodle' ? 'block' : 'none';
  canvas.style.display = selected === 'doodle' ? 'block' : 'none';
  preview.style.display = selected === 'imagen' ? 'block' : 'none';
});

imagenInput.addEventListener('change', () => {
  const file = imagenInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = e => {
      previewImg.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

function agregarAlMural() {
  const tipoSeleccionado = tipo.value;
  const mural = document.getElementById('mural');
  const elemento = document.createElement('div');
  elemento.classList.add('aporte');

  if (tipoSeleccionado === 'frase' || tipoSeleccionado === 'emoji') {
    elemento.textContent = contenido.value;
  } else if (tipoSeleccionado === 'imagen') {
    const img = document.createElement('img');
    img.src = previewImg.src;
    img.style.maxWidth = '100px';
    img.style.maxHeight = '100px';
    elemento.appendChild(img);
  } else if (tipoSeleccionado === 'doodle') {
    const img = document.createElement('img');
    img.src = canvas.toDataURL();
    img.style.maxWidth = '100px';
    img.style.maxHeight = '100px';
    elemento.appendChild(img);
  }

  mural.appendChild(elemento);
}
