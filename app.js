const backendURL = "https://calm-aback-vacuum.glitch.me/"; // ← Pega tu URL aquí

// Helper para token
enfunction getAuthToken() {
  return localStorage.getItem("token");
}

// Inicializa la UI de auth/upload
function initAuthenticatedUI() {
  const token = getAuthToken();
  document.getElementById("authForms").style.display = token ? "none" : "flex";
  document.getElementById("uploadForm").style.display = token ? "flex" : "none";
}

// Inicializa el modal de términos
function initTermsModal() {
  const termsModal = document.getElementById("termsModal");
  const acceptBtn = document.getElementById("acceptTerms");
  const accepted = localStorage.getItem("termsAccepted") === "true";
  termsModal.style.display = accepted ? "none" : "flex";
  acceptBtn.addEventListener("click", () => {
    console.log("Términos aceptados");
    localStorage.setItem("termsAccepted", "true");
    termsModal.style.display = "none";
  });
}

// Registro de usuario
document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const res = await fetch(`${backendURL}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: fd.get("username"), password: fd.get("password") })
  });
  const data = await res.json();
  if (res.ok) {
    alert("Registro exitoso. Ahora inicia sesión.");
    e.target.reset();
  } else {
    alert(data.message || "Error al registrar");
  }
});

// Login de usuario
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const res = await fetch(`${backendURL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: fd.get("username"), password: fd.get("password") })
  });
  const data = await res.json();
  if (res.ok && data.token) {
    localStorage.setItem("token", data.token);
    alert("Sesión iniciada correctamente");
    e.target.reset();
    initAuthenticatedUI();
    loadImages();
  } else {
    alert(data.message || "Error al iniciar sesión");
  }
});

// Subir imagen
document.getElementById("uploadForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const token = getAuthToken();
  if (!token) return alert("Debes iniciar sesión para subir imágenes");

  const formData = new FormData(e.target);
  const res = await fetch(`${backendURL}/upload`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` },
    body: formData
  });
  if (res.ok) {
    const { id } = await res.json();
    const myImgs = JSON.parse(localStorage.getItem("myImages") || "[]");
    myImgs.push(id);
    localStorage.setItem("myImages", JSON.stringify(myImgs));
    alert("Imagen subida con éxito");
    e.target.reset();
    loadImages();
  } else {
    const err = await res.json();
    alert(err.error || "Error al subir");
  }
});

// Cargar galería\async function loadImages() {
  const res = await fetch(`${backendURL}/images`);
  const imgs = await res.json();
  const gallery = document.getElementById("gallery");
  gallery.innerHTML = "";

  const myImgs = JSON.parse(localStorage.getItem("myImages") || "[]");
  const token = getAuthToken();

  imgs.forEach(img => {
    const div = document.createElement("div");
    div.className = "gallery-item";
    div.innerHTML = `
      <img src="${img.image_url}" alt="${img.username}" />
      <p style="text-align:center;">@${img.username}</p>
      <div class="button-row"></div>
    `;
    const row = div.querySelector(".button-row");

    // Like button
    const likeKey = `likes_${img.id}`;
    let likes = parseInt(localStorage.getItem(likeKey) || "0", 10);
    const likeBtn = document.createElement("button");
    likeBtn.className = "like-btn";
    likeBtn.textContent = "🔥";
    const likeCount = document.createElement("span");
    likeCount.className = "like-count";
    likeCount.textContent = likes;
    likeBtn.onclick = () => {
      if (!token) return alert("Debes iniciar sesión para dar like");
      likes++;
      localStorage.setItem(likeKey, likes);
      likeCount.textContent = likes;
    };
    row.appendChild(likeBtn);
    row.appendChild(likeCount);

    // Delete button
    if (token && myImgs.includes(img.id)) {
      const delBtn = document.createElement("button");
      delBtn.className = "delete-btn";
      delBtn.textContent = "Eliminar";
      delBtn.onclick = async () => {
        const resD = await fetch(`${backendURL}/delete/${img.id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (resD.ok) {
          const updated = myImgs.filter(i => i !== img.id);
          localStorage.setItem("myImages", JSON.stringify(updated));
          loadImages();
        } else {
          const err = await resD.json();
          alert(err.error || "Error al eliminar");
        }
      };
      row.appendChild(delBtn);
    }

    gallery.appendChild(div);
  });
}

// Toggle modo oscuro
document.getElementById("toggleDarkMode").onclick = () => {
  document.body.classList.toggle("dark-mode");
};

// Events on DOM load
document.addEventListener("DOMContentLoaded", () => {
  initTermsModal();
  initAuthenticatedUI();
  loadImages();
});


// Toggle modo oscuro
document.getElementById("toggleDarkMode").onclick = () => {
  document.body.classList.toggle("dark-mode");
};
