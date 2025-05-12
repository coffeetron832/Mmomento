const backendURL = "https://calm-aback-vacuum.glitch.me/"; // ← Pega tu URL aquí

// Helper para token
function getAuthToken() {
  return localStorage.getItem("token");
}

// Inicializa visibilidad de auth/upload
function initAuthenticatedUI() {
  const token = getAuthToken();
  document.getElementById("authForms").style.display = token ? "none" : "flex";
  document.getElementById("uploadForm").style.display = token ? "flex" : "none";
}

// Modal de términos
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("termsAccepted")) {
    document.body.classList.add("terms-accepted");
  } else {
    document.body.classList.remove("terms-accepted");
  }
  document.getElementById("acceptTerms").onclick = () => {
    localStorage.setItem("termsAccepted", "true");
    document.body.classList.add("terms-accepted");
  };

  initAuthenticatedUI();
  loadImages();
});

// Registro
document.getElementById("registerForm").addEventListener("submit", async e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const res = await fetch(`${backendURL}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: fd.get("username"), password: fd.get("password") })
  });
  const data = await res.json();
  alert(res.ok ? "Registro exitoso" : data.message || "Error al registrar");
  if (res.ok) e.target.reset();
});

// Login
document.getElementById("loginForm").addEventListener("submit", async e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const res = await fetch(`${backendURL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: fd.get("username"), password: fd.get("password") })
  });
  const data = await res.json();
  if (res.ok) {
    localStorage.setItem("token", data.token);
    alert("Sesión iniciada");
    initAuthenticatedUI();
    loadImages();
  } else {
    alert(data.message || "Error al iniciar sesión");
  }
});

// Subir imagen
document.getElementById("uploadForm").addEventListener("submit", async e => {
  e.preventDefault();
  const token = getAuthToken();
  if (!token) return alert("Debes iniciar sesión");
  const formData = new FormData(e.target);
  const res = await fetch(`${backendURL}/upload`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` },
    body: formData
  });
  if (res.ok) {
    const { id } = await res.json();
    let arr = JSON.parse(localStorage.getItem("myImages")||"[]");
    arr.push(id);
    localStorage.setItem("myImages", JSON.stringify(arr));
    alert("Imagen subida");
    e.target.reset();
    loadImages();
  } else {
    const d=await res.json();
    alert(d.error||"Error al subir");
  }
});

// Cargar galería
async function loadImages() {
  const res = await fetch(`${backendURL}/images`);
  const imgs = await res.json();
  const gallery = document.getElementById("gallery");
  gallery.innerHTML = "";
  const myImgs = JSON.parse(localStorage.getItem("myImages")||"[]");
  const token = getAuthToken();

  imgs.forEach(img => {
    const div = document.createElement("div");
    div.className = "gallery-item";
    div.innerHTML = `
      <img src="${img.image_url}" alt="${img.username}" />
      <p style="text-align:center">@${img.username}</p>
      <div class="button-row"></div>
    `;
    const row = div.querySelector(".button-row");

    // Like
    const key = `likes_${img.id}`;
    let likes = parseInt(localStorage.getItem(key)||"0",10);
    const btnL = document.createElement("button");
    btnL.className="like-btn";
    btnL.textContent="🔥";
    const cnt = document.createElement("span");
    cnt.className="like-count";
    cnt.textContent=likes;
    btnL.onclick = () => {
      if (!token) return alert("Inicia sesión");
      likes++;
      localStorage.setItem(key, likes);
      cnt.textContent = likes;
    };
    row.appendChild(btnL);
    row.appendChild(cnt);

    // Eliminar
    if (token && myImgs.includes(img.id)) {
      const btnD = document.createElement("button");
      btnD.className="delete-btn";
      btnD.textContent="Eliminar";
      btnD.onclick = async () => {
        const resD = await fetch(`${backendURL}/delete/${img.id}`, {
          method:"DELETE",
          headers:{"Authorization":`Bearer ${token}`}
        });
        if (resD.ok) {
          let upd = myImgs.filter(x=>x!==img.id);
          localStorage.setItem("myImages", JSON.stringify(upd));
          loadImages();
        } else {
          const d=await resD.json();
          alert(d.error||"Error al eliminar");
        }
      };
      row.appendChild(btnD);
    }

    gallery.appendChild(div);
  });
}

// Dark mode toggle
document.getElementById("toggleDarkMode").onclick = () => {
  document.body.classList.toggle("dark-mode");
};

