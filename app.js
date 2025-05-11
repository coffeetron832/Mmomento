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
    const result = await res.json(); // Esperamos: { success: true, id: <número>, image_url: "..." }
    alert("Imagen subida con éxito");

    // Guardar el ID de la imagen subida en localStorage
    let myImages = JSON.parse(localStorage.getItem("myImages") || "[]");
    myImages.push(result.id);
    localStorage.setItem("myImages", JSON.stringify(myImages));

    e.target.reset();
    loadImages();
  } else {
    alert("Error al subir la imagen");
  }
});

// Carga la galería, muestra likes y botón Eliminar
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
      <p style="text-align:center;">@${img.username}</p>
      <div class="button-row"></div>
    `;

    const row = div.querySelector('.button-row');

    // — Botón 🔥 de like —
    const likeKey = `likes_${img.id}`;
    let likes = parseInt(localStorage.getItem(likeKey) || "0", 10);

    const likeBtn = document.createElement('button');
    likeBtn.className = 'like-btn';
    likeBtn.textContent = "🔥";

    const likeCount = document.createElement('span');
    likeCount.className = 'like-count';
    likeCount.textContent = likes;

    likeBtn.addEventListener('click', () => {
      likes++;
      localStorage.setItem(likeKey, likes);
      likeCount.textContent = likes;
    });

    row.appendChild(likeBtn);
    row.appendChild(likeCount);

    // — Botón Eliminar (solo para tus imágenes) —
    if (myImages.includes(img.id)) {
      const delBtn = document.createElement("button");
      delBtn.className = 'delete-btn';
      delBtn.textContent = "Eliminar";
      delBtn.addEventListener('click', async () => {
        const resDelete = await fetch(`${backendURL}/delete/${img.id}`, {
          method: "DELETE"
        });
        if (resDelete.ok) {
          const updated = myImages.filter(id => id !== img.id);
          localStorage.setItem("myImages", JSON.stringify(updated));
          loadImages();
        } else {
          alert("Error al eliminar la imagen");
        }
      });
      row.appendChild(delBtn);
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

// Toggle Modo Oscuro
document.getElementById('toggleDarkMode').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const btn = document.getElementById('toggleDarkMode');
  btn.classList.toggle('dark-mode');
  btn.textContent = document.body.classList.contains('dark-mode')
    ? '🌞 Modo claro'
    : '🌓 Modo oscuro';
});

// Modal de términos
window.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("termsAccepted")) {
    document.body.classList.add("terms-accepted");
  } else {
    document.body.classList.remove("terms-accepted");
  }
  document.getElementById("acceptTerms").addEventListener("click", () => {
    localStorage.setItem("termsAccepted", "true");
    document.body.classList.add("terms-accepted");
  });
});
