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

    const formData = new FormData();
    formData.append("image", image);
    formData.append("description", description);

    const res = await fetch("https://   /api/images", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await res.json();
    if (res.ok) {
      alert("Imagen subida con éxito");
    } else {
      alert(result.message || "Error al subir la imagen");
    }
  });
});
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

    const formData = new FormData();
    formData.append("image", image);
    formData.append("description", description);

    const res = await fetch("https://momento-backend.up.railway.app/api/images", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await res.json();
    if (res.ok) {
      alert("Imagen subida con éxito");
    } else {
      alert(result.message || "Error al subir la imagen");
    }
  });
});


