const backendURL = "https://calm-aback-vacuum.glitch.me/"; // ← Pega tu URL aquí

// Inicializa UI
function initUI() {
  // Aquí podrías ocultar elementos si es necesario
}

// Función para alternar modo oscuro
define toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

// Subida de imagen
document.getElementById("uploadForm").addEventListener("submit", async e => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const res = await fetch(`${backendURL}/upload`, {
    method: "POST",
    body: formData
  });
  if (res.ok) {
    const { id } = await res.json();
    let arr = JSON.parse(localStorage.getItem("myImages") || "[]");
    arr.push(id);
    localStorage.setItem("myImages", JSON.stringify(arr));
    alert("Imagen subida");
    e.target.reset();
    loadImages();
  } else {
    const d = await res.json();
    alert(d.error || "Error al subir");
  }
});

// Cargar galería
async function loadImages() {
  const res = await fetch(`${backendURL}/images`);
  const imgs = await res.json();
  const gallery = document.getElementById("gallery");
  gallery.innerHTML = "";

  const myImgs = JSON.parse(localStorage.getItem("myImages") || "[]");

  imgs.forEach(img => {
    const div = document.createElement("div");
    div.className = "gallery-item";
    div.innerHTML = `
      <img src="${img.image_url}" alt="${img.username}" />
      <p style="text-align:center">@${img.username}</p>
      <div class="button-row"></div>
    `;

    // Like button\ n    const key = `likes_${img.id}`;
    let likes = parseInt(localStorage.getItem(key) || "0", 10);
    const likeBtn = document.createElement("button");
    likeBtn.className = "like-btn";
    likeBtn.textContent = "🔥";
    const likeCount = document.createElement("span");
    likeCount.className = "like-count";
    likeCount.textContent = likes;
    likeBtn.onclick = () => {
      likes++;
      localStorage.setItem(key, likes);
      likeCount.textContent = likes;
    };

    // Delete button
    if (myImgs.includes(img.id)) {
      const delBtn = document.createElement("button");
      delBtn.className = "delete-btn";
      delBtn.textContent = "Eliminar";
      delBtn.onclick = async () => {
        const resD = await fetch(`${backendURL}/delete/${img.id}`, {
          method: "DELETE"
        });
        if (resD.ok) {
          const updated = myImgs.filter(i => i !== img.id);
          localStorage.setItem("myImages", JSON.stringify(updated));
          loadImages();
        } else {
          const d = await resD.json();
          alert(d.error || "Error al eliminar");
        }
      };
      div.querySelector(".button-row").append(delBtn);
    }

    // Append like controls
    const row = div.querySelector(".button-row");
    row.append(likeBtn, likeCount);

    gallery.appendChild(div);
  });
}

// Inicialización al cargar DOM
window.addEventListener("DOMContentLoaded", () => {
  initUI();
  loadImages();
  // Bind toggleDarkMode al botón
  document.getElementById("toggleDarkMode").addEventListener("click", toggleDarkMode);
});



// Toggle modo oscuro
document.getElementById("toggleDarkMode").onclick = () => {
  document.body.classList.toggle("dark-mode");
};
