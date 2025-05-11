const backendURL = "https://calm-aback-vacuum.glitch.me/"; // ← Pega tu URL aquí

// Subida de imágenes y guardado del ID en localStorage
document.getElementById("uploadForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const res = await fetch(`${backendURL}/upload/`, {
    method: "POST",
    body: formData
  });

  if (res.ok) {
    const result = await res.json(); // Esperamos: { success: true, id: <número> }
    alert("Imagen subida con éxito");

    // Guardar el ID de la imagen subida en localStorage
    let myImages = JSON.parse(localStorage.getItem("myImages") || "[]");
    myImages.push(result.id); // Usa result.id
    localStorage.setItem("myImages", JSON.stringify(myImages));

    e.target.reset();
    loadImages();
  } else {
    alert("Error al subir la imagen");
  }
});

// Carga la galería y muestra el botón Eliminar solo para tus imágenes
async function loadImages() {
  const res = await fetch(`${backendURL}/images`);
  console.log("GET /images status:", res.status);
  const data = await res.json();
  console.log("Datos recibidos:", data);

  const gallery = document.getElementById("gallery");
  gallery.innerHTML = "";

  const myImages = JSON.parse(localStorage.getItem("myImages") || "[]");

  data.forEach(img => {
    const div = document.createElement('div');
    div.className = 'gallery-item';
    div.innerHTML = `
      <img src="${img.image_url}" alt="${img.username}" />
      <p style="text-align:center;">${img.username}</p>
    `;

    // Mostrar botón Eliminar solo si incluiste este ID en localStorage
    if (myImages.includes(img.id)) {
      const delButton = document.createElement("button");
      delButton.textContent = "Eliminar";
      delButton.style = "display: block; margin: 0.5rem auto; background-color: red; color: white;";

      delButton.onclick = async () => {
        // Llamada DELETE al backend
        const resDelete = await fetch(`${backendURL}/delete/${img.id}`, {
          method: "DELETE"
        });

        if (resDelete.ok) {
          // Actualizar localStorage sin este ID
          const updatedImages = myImages.filter(imageId => imageId !== img.id);
          localStorage.setItem("myImages", JSON.stringify(updatedImages));
          loadImages();
        } else {
          alert("Error al eliminar la imagen");
        }
      };

      div.appendChild(delButton);
    }

    gallery.appendChild(div);
  });
}

loadImages();

// Prevenir drag & drop sobre inputs de texto
document.querySelectorAll('input[type="text"]').forEach(input => {
  input.addEventListener('dragover', e => e.preventDefault());
  input.addEventListener('drop', e => e.preventDefault());
});
document.getElementById('uploadForm').addEventListener('drop', e => {
  if (e.target.type === 'text') e.preventDefault();
});

// Modo oscuro
document.getElementById('toggleDarkMode').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const button = document.getElementById('toggleDarkMode');
  button.classList.toggle('dark-mode');
  button.textContent = document.body.classList.contains('dark-mode')
    ? '🌞 Modo claro'
    : '🌓 Modo oscuro';
});