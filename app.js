// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBAAPW2_kuwfNLV3hI1FzhaOUGfJpvv7vQ",
  authDomain: "momento-40bd7.firebaseapp.com",
  projectId: "momento-40bd7",
  storageBucket: "momento-40bd7.firebasestorage.app",
  messagingSenderId: "576930270515",
  appId: "1:576930270515:web:1fa7ce310ff577ec5ec246"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const storage = firebase.storage();
const db = firebase.firestore();

// Autenticación anónima
auth.signInAnonymously().catch(error => {
  console.error("Error de autenticación:", error);
});

// Referencias a elementos
const imagenInput = document.getElementById("imagen");
const descripcionInput = document.getElementById("descripcion");
const subirBtn = document.getElementById("subir");
const momentosContainer = document.getElementById("momentos");
const destacadoContainer = document.getElementById("momento-destacado");

// Subir imagen y descripción
subirBtn.addEventListener("click", async () => {
  const file = imagenInput.files[0];
  const descripcion = descripcionInput.value.trim();

  if (!file || !descripcion) {
    alert("Por favor, selecciona una imagen y escribe una descripción.");
    return;
  }

  try {
    const storageRef = storage.ref("momentos/" + Date.now() + "_" + file.name);
    const snapshot = await storageRef.put(file);
    const url = await snapshot.ref.getDownloadURL();

    await db.collection("momentos").add({
      url,
      descripcion,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    imagenInput.value = "";
    descripcionInput.value = "";
    cargarMomentos();
  } catch (error) {
    console.error("Error al subir el momento:", error);
  }
});

// Cargar momentos en feed y destacado
async function cargarMomentos() {
  momentosContainer.innerHTML = "";
  destacadoContainer.innerHTML = "";

  const snapshot = await db.collection("momentos")
    .orderBy("timestamp", "desc")
    .get();

  const momentos = [];
  snapshot.forEach(doc => momentos.push(doc.data()));

  // Mostrar momento destacado (el más reciente)
  if (momentos.length > 0) {
    const destacado = momentos[0];
    destacadoContainer.innerHTML = `
      <div class="momento destacado">
        <img src="${destacado.url}" alt="momento del día" />
        <p>${destacado.descripcion}</p>
      </div>
    `;
  }

  // Mostrar el resto en el feed
  for (let i = 1; i < momentos.length; i++) {
    const m = momentos[i];
    momentosContainer.innerHTML += `
      <div class="momento">
        <img src="${m.url}" alt="momento" />
        <p>${m.descripcion}</p>
        <div class="reacciones">
          <button class="ilumina">✨ Me ilumina</button>
          <button class="revivir">🔁 Lo reviviría</button>
        </div>
      </div>
    `;
  }
}

// Acciones para los botones de reacción
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("revivir")) {
    alert("🌊 Te comprometiste a revivir este momento cuando te suceda algo similar. ¡Vive con intención!");
  } else if (e.target.classList.contains("ilumina")) {
    alert("✨ ¡Gracias por dejarte iluminar!");
  }
});

// Cargar momentos una vez autenticado
auth.onAuthStateChanged(user => {
  if (user) {
    cargarMomentos();
  }
});
