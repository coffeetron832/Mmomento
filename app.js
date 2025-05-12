const backendURL = "https://calm-aback-vacuum.glitch.me/"; // ← Pega tu URL aquí

// Helper para tokenunction getAuthToken() {
  return localStorage.getItem("token");
}

// Inicializa visibilidad de auth/upload
function initAuthenticatedUI() {
  const token = getAuthToken();
  document.getElementById("authForms").style.display = token ? "none" : "flex";
  document.getElementById("uploadForm").style.display = token ? "flex" : "none";
}

// Modal de términos
function initTermsModal() {
  const termsModal = document.getElementById("termsModal");
  const acceptBtn = document.getElementById("acceptTerms");

  // Mostrar u ocultar modal según almacenamiento
  if (localStorage.getItem("termsAccepted") === "true") {
    termsModal.style.display = "none";
  } else {
    termsModal.style.display = "flex";
  }

  // Listener de aceptación
  acceptBtn.addEventListener("click", () => {
    console.log("Términos aceptados");
    localStorage.setItem("termsAccepted", "true");
    termsModal.style.display = "none";
  });
}

// Inicializa visibilidad de auth/upload y modal
function initAuthenticatedUI() {();
  loadImages();
});

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
    // Guarda el token y actualiza UI
    localStorage.setItem("token", data.token);
    alert("Sesión iniciada correctamente");
    e.target.reset();
    initAuthenticatedUI();
    loadImages();
  } else {
    alert(data.message || "Error al iniciar sesión");
  }
});

// Subir imagen (protegido)
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
    let myImgs = JSON.parse(localStorage.getItem("myImages") || "[]");
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

// Cargar galería y botones
async function loadImages() {
  const res = await fetch(`${backendURL}/images`);
  const imgs = await res.json();
  const gallery = document.getElementById("gallery");
  gallery.innerHTML = "";
  const myImgs = JSON.parse(localStorage.getItem("myImages") || "[]");
  const token = getAuthToken();

  imgs.forEach(img => {
    const el = document.createElement("div");
    el.className = "gallery-item";
    el.innerHTML = `
      <img src="${img.image_url}" alt="${img.username}" />
      <p style="text-align:center;">@${img.username}</p>
      <div class="button-row"></div>
    `;
    const row = el.querySelector(".button-row");

    // Botón like
    const key = `likes_${img.id}`;
    let likes = parseInt(localStorage.getItem(key) || "0", 10);
    const likeBtn = document.createElement("button");
    likeBtn.className = "like-btn";
    likeBtn.textContent = "🔥";
    const count = document.createElement("span");
    count.className = "like-count";
    count.textContent = likes;
    likeBtn.onclick = () => {
      if (!token) return alert("Debes iniciar sesión para dar like");
      likes++;
      localStorage.setItem(key, likes);
      count.textContent = likes;
    };
    row.appendChild(likeBtn);
    row.appendChild(count);

    // Botón eliminar
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
          const newArr = myImgs.filter(i => i !== img.id);
          localStorage.setItem("myImages", JSON.stringify(newArr));
          loadImages();
        } else {
          const err = await resD.json();
          alert(err.error || "Error al eliminar");
        }
      };
      row.appendChild(delBtn);
    }

    gallery.appendChild(el);
  });
}

// Toggle modo oscuro
document.getElementById("toggleDarkMode").onclick = () => {
  document.body.classList.toggle("dark-mode");
};
