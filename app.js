const backendURL = "https://calm-aback-vacuum.glitch.me/"; // ← Pega tu URL aquí

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
    let stored = JSON.parse(localStorage.getItem("myImages") || "[]");
    stored.push(id);
    localStorage.setItem("myImages", JSON.stringify(stored));
    alert("Imagen subida con éxito");
    e.target.reset();
    loadImages();
  } else {
    const err = await res.json();
    alert(err.error || "Error al subir la imagen");
  }
});

// Cargar galería
async function loadImages() {
  const res = await fetch(`${backendURL}/images`);
  const images = await res.json();
  const gallery = document.getElementById("gallery");
  gallery.innerHTML = "";

  const stored = JSON.parse(localStorage.getItem("myImages") || "[]");

  images.forEach(img => {
    const div = document.createElement("div");
    div.className = "gallery-item";
    div.innerHTML = `
      <img src="${img.image_url}" alt="${img.username}" />
      <p>@${img.username}</p>
      <div class="button-row"></div>
    `;
    const row = div.querySelector(".button-row");

    // Like
    const key = `likes_${img.id}`;
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
    row.append(likeBtn, likeCount);

    // Delete
    if (stored.includes(img.id)) {
      const delBtn = document.createElement("button");
      delBtn.className = "delete-btn";
      delBtn.textContent = "Eliminar";
      delBtn.onclick = async () => {
        const resD = await fetch(`${backendURL}/delete/${img.id}`, {
          method: "DELETE"
        });
        if (resD.ok) {
          const updated = stored.filter(x => x !== img.id);
          localStorage.setItem("myImages", JSON.stringify(updated));
          loadImages();
        } else {
          const err = await resD.json();
          alert(err.error || "Error al eliminar la imagen");
        }
      };
      row.append(delBtn);
    }

    gallery.appendChild(div);
  });
}

// Al cargar la página
window.addEventListener("DOMContentLoaded", loadImages);


// Toggle modo oscuro
document.getElementById("toggleDarkMode").onclick = () => {
  document.body.classList.toggle("dark-mode");
};
