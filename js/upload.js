document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("uploadForm");
  const imagesContainer = document.getElementById("imagesContainer");

  const token = localStorage.getItem("token");

  // ✅ Obtener el ID del usuario desde el objeto 'user' guardado en localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = user._id || user.id || null;

  function createImageCard(image) {
    const div = document.createElement("div");
    div.className = "image-card";

    const img = document.createElement("img");
    img.src = image.imageUrl || image.url || "";
    img.alt = image.description || "Imagen subida";

    const desc = document.createElement("p");
    desc.className = "image-description";
    desc.textContent = image.description || "";

    const userInfo = document.createElement("p");
    userInfo.className = "image-user";

    // Mostrar email o "Anónimo"
    const uploader = image.userId;
    if (uploader && uploader.email) {
      userInfo.textContent = `Subido por: ${uploader.email}`;
    } else {
      userInfo.textContent = "Subido por: Anónimo";
    }

    div.appendChild(img);
    div.appendChild(desc);
    div.appendChild(userInfo);

    // ✅ Verificar si el usuario logueado es el dueño de la imagen
    const imageOwnerId = uploader ? uploader._id || uploader : null;
    if (currentUserId && imageOwnerId && currentUserId === imageOwnerId.toString()) {
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "🗑 Eliminar";
      deleteBtn.className = "delete-btn";
      deleteBtn.addEventListener("click", () => deleteImage(image._id, div));
      div.appendChild(deleteBtn);
    }

    return div;
  }

  async function loadImages() {
    try {
      const res = await fetch("https://momento-backend-production.up.railway.app/api/images");
      if (!res.ok) throw new Error("Error al obtener imágenes");
      const images = await res.json();
      imagesContainer.innerHTML = "";
      images.forEach(image => {
        const card = createImageCard(image);
        imagesContainer.appendChild(card);
      });
    } catch (error) {
      console.error("Error al cargar imágenes:", error);
      imagesContainer.innerHTML = "<p style='color: red;'>Error al cargar imágenes.</p>";
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

    const imageInput = document.getElementById("image");
    if (!imageInput.files.length) {
      alert("Por favor selecciona una imagen para subir.");
      return;
    }
    const image = imageInput.files[0];
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


