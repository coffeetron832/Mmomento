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
      alert("Por favor selecciona una imagen");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);
    formData.append("description", description);

    try {
      const res = await fetch("momento-backend-production.up.railway.app/api/images/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // ¡No agregues 'Content-Type'! Fetch lo maneja automáticamente con FormData
        },
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        alert("Imagen subida con éxito");
        form.reset(); // Limpia el formulario después de subir
      } else {
        alert(result.error || "Error al subir la imagen");
      }
    } catch (error) {
      console.error("Error en la subida:", error);
      alert("Error de red o del servidor al subir la imagen");
    }
  });
});

