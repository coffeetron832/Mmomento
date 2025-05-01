// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBAAPW2_kuwfNLV3hI1FzhaOUGfJpvv7vQ",
  authDomain: "momento-40bd7.firebaseapp.com",
  projectId: "momento-40bd7",
  storageBucket: "momento-40bd7.firebasestorage.app",
  messagingSenderId: "576930270515",
  appId: "1:576930270515:web:1fa7ce310ff577ec5ec246"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const storage = firebase.storage();
const db = firebase.firestore();

// Autenticación anónima
auth.signInAnonymously().catch(console.error);

// Referencias a elementos
const imagenInput = document.getElementById("imagen");
const descripcionInput = document.getElementById("descripcion");
const subirBtn = document.getElementById("subir");
const momentosContainer = document.getElementById("momentos");

// Subir imagen y descripción
subirBtn.addEventListener("click", async () => {
  const file = imagenInput.files[0];
  const descripcion = descripcionInput.value.trim();

  if (!file || !descripcion) {
    alert("Por favor, selecciona una imagen y escribe una descripción.");
    return;
  }

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
});

// Cargar momentos
async function cargarMomentos() {
  momentosContainer.innerHTML = "";
  const snapshot = await db.collection("momentos").orderBy("timestamp", "desc").get();
  snapshot.forEach(doc => {
    const data = doc.data();
    const { url, descripcion } = data;

    momentosContainer.innerHTML += `
      <div class="momento">
        <img src="${url}" alt="momento" />
        <p>${descripcion}</p>
        <div class="reacciones">
          <button class="ilumina">✨ Me ilumina</button>
          <button class="revivir">🔁 Lo reviviría</button>
        </div>
      </div>
    `;
  });
}

// Reto al presionar "Lo reviviría"
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("revivir")) {
    alert("Te comprometiste a subir este momento cuando te suceda algo similar. ¡Aprovecha el ahora!");
  }
});

// Cargar momentos al iniciar
auth.onAuthStateChanged(() => {
  cargarMomentos();
});
