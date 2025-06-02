// Mostrar año actual en el footer
document.getElementById('currentYear').textContent = new Date().getFullYear();

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("uploadForm");
  const imagesContainer = document.getElementById("imagesContainer");
  const token = localStorage.getItem("token");

  // 🌙 Aplicar modo oscuro si está activado
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
  }

  // 🔘 Botón de alternar modo oscuro
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (darkModeToggle) {
    // Actualizar texto inicial del botón según modo
    darkModeToggle.textContent = document.body.classList.contains('dark-mode') ? "☀️" : "🌓";

    darkModeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const isDark = document.body.classList.contains('dark-mode');
      localStorage.setItem('darkMode', isDark);
      darkModeToggle.textContent = isDark ? "☀️" : "🌓";
    });
  }

  // 👋 Modal de bienvenida (solo una vez por sesión)
  const hasSeenModal = sessionStorage.getItem('hasSeenModal');
  const modal = document.getElementById('welcomeModal');
  const closeModalBtn = document.getElementById('closeModal');

  if (!hasSeenModal && modal) {
    modal.style.display = 'flex';
    sessionStorage.setItem('hasSeenModal', 'true');
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      if (modal) modal.style.display = 'none';
    });
  }

  // 🧠 Obtener usuario del localStorage
  let user = {};
  try {
    const userRaw = localStorage.getItem("user");
    user = userRaw && userRaw !== "undefined" ? JSON.parse(userRaw) : {};
  } catch (e) {
    console.warn("Usuario en localStorage mal formado o ausente");
    user = {};
  }
  const currentUserId = user._id || user.id || null;

  // 🧩 Crear tarjeta de imagen
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

    const uploader = image.userId;
    let imageOwnerId = null;

    if (typeof uploader === "object" && uploader !== null) {
      imageOwnerId = uploader._id || uploader.id || null;
      userInfo.textContent = uploader.username
        ? `Subido por: ${uploader.username}`
        : "Subido por: Anónimo";
    } else if (typeof uploader === "string") {
      imageOwnerId = uploader;
      userInfo.textContent = currentUserId === uploader
        ? "Subido por: Tú"
        : "Subido por: Usuario desconocido";
    } else {
      userInfo.textContent = "Subido por: Anónimo";
    }

    div.appendChild(img);
    div.appendChild(desc);
    div.appendChild(userInfo);

    // 🗑 Botón de eliminar si es del usuario actual
    if (currentUserId && imageOwnerId && currentUserId === imageOwnerId.toString()) {
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "🗑 Eliminar";
      deleteBtn.className = "delete-btn";
      deleteBtn.addEventListener("click", () => deleteImage(image._id, div));
      div.appendChild(deleteBtn);
    }

    return div;
  }

  // 🚫 Redirige si no hay token
  if (!token) {
    alert("Debes iniciar sesión");
    window.location.href = "login.html";
    return;
  }

  // 🚀 Cargar imágenes desde la API
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

  // 🗑 Eliminar imagen
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

  // 📤 Envío del formulario
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

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

  // 🔄 Cargar imágenes existentes al iniciar
  loadImages();
});
