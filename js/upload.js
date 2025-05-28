document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("uploadForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Debes iniciar sesión");
      window.location.href = "login.html";
      return;
    }

    const image = document.getElementById("image").files[0];
    const description = document.getElementById("description").value;

    if (!image) {
      alert("Por favor selecciona una imagen.");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);
    formData.append("description", description);

    try {
      const res = await fetch("https://momento-backend-production.up.railway.app/api/images/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // No pongas 'Content-Type' aquí para que el navegador lo maneje con FormData
        },
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        alert("Imagen subida con éxito");
        // Opcional: limpiar formulario o redirigir
        form.reset();
      } else {
        alert(result.error || "Error al subir la imagen");
      }
    } catch (error) {
      console.error("Error en la subida:", error);
      alert("Error al subir la imagen");
    }
  });
});


