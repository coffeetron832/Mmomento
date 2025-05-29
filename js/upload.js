document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("uploadForm");
  const imagesContainer = document.getElementById("imagesContainer");

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  function createImageCard(image) {
    const div = document.createElement("div");
    div.className = "image-card";

    const img = document.createElement("img");
    img.src = image.imageUrl;
    img.alt = image.description || "Imagen subida";

    const desc = document.createElement("p");
    desc.className = "image-description";
    desc.textContent = image.description || "";

    const user = document.createElement("p");
    user.className = "image-user";

    // Para evitar error, chequea si userId viene con username o email
    if (image.userId) {
      if (typeof image.userId === "object") {
        user.textContent = `Subido por: ${image.userId.username || image.userId.email || "Anon"}`;
      } else {
        // Si solo es string (id), poner algo genérico
        user.textContent = "Subido por: Usuario";
      }
    } else {
      user.textContent = "Subido por: Anónimo";
    }

    div.appendChild(img);
    div.appendChild(desc);
    div.appendChild(user);

    // Botón eliminar solo si el usuario logueado es el dueño
    if (userId && image.userId && ((image.userId._id && image.userId._id === userId) || image.userId === userId)) {
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Eliminar";
      deleteBtn.addEventListener("click", () => deleteImage(image._id, div));
      div.appendChild(deleteBtn);
    }

    return div;
  }

  async function loadImages() {
    try {
      const res = await fetch("https://momento-backend-production.up.railway.app/api/images");
      const images = await res.json();
      imagesContainer.innerHTML = "";
      images.forEach(image => {
        const card = createImageCard(image);
        imagesContainer.appendChild(card);
      });
    } catch (error) {
      console.error("Error al cargar imágenes:", error);
    }
  }

  async function deleteImage(imageId, element) {
    try {
      const res = await fetch(`https://momento-backend-production.up.railway.app/api/images/${imageId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        alert("Imagen eliminada exitosamente");
        element.remove();
      } else {
        const data = await res.json();
        alert(data.error || "Error al eliminar la imagen");
      }
    } catch (err) {
      console.error("Error al eliminar imagen:", err);
      alert("Error al eliminar la imagen");
    }
  }

  // Verificar token antes de cargar imágenes
  if (!token) {
    alert("Debes iniciar sesión");
    window.location.href = "login.html";
    return;
  }

  loadImages();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!token) {
      alert("Debes iniciar sesión");
      window.location.href = "login.html";
      return;
    }

    const image = document.getElementById("image").files[0];
    const description = document.getElementById("description").value;

    const formData = new FormData();
    formData.append("image", image);
    formData.append("description", description);

    try {
      const res = await fetch("https://momento-backend-production.up.railway.app/api/images/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        alert("Imagen subida con éxito");
        form.reset();
        const newCard = createImageCard(result);
        imagesContainer.prepend(newCard);
      } else {
        alert(result.error || "Error al subir la imagen");
      }
    } catch (err) {
      console.error("Error en la subida:", err);
      alert("Error en la subida de la imagen");
    }
  });
});

