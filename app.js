// Configuración Firebase
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

const imagenInput = document.getElementById("imagen");
const descripcionInput = document.getElementById("descripcion");
const subirBtn = document.getElementById("subir");
const momentosDiv = document.getElementById("momentos");
const userInfo = document.getElementById("user-info");
const logoutBtn = document.getElementById("logout");
const destacadoDiv = document.getElementById("momento-destacado");

let currentUser = null;

// Autenticación anónima automática
auth.onAuthStateChanged(user => {
  if (!user) {
    auth.signInAnonymously();
  } else {
    currentUser = user;
    userInfo.textContent = `Usuario: ${user.uid}`;
    logoutBtn.style.display = "inline";
    cargarMomentos();
  }
});

logoutBtn.addEventListener("click", () => {
  auth.signOut();
});

// Subir momento
subirBtn.addEventListener("click", async () => {
  const file = imagenInput.files[0];
  const descripcion = descripcionInput.value.trim().slice(0, 30);
  if (!file || !descripcion) return alert("Imagen y descripción requeridas");

  const storageRef = storage.ref(`momentos/${Date.now()}_${file.name}`);
  await storageRef.put(file);
  const url = await storageRef.getDownloadURL();

  const timestamp = firebase.firestore.FieldValue.serverTimestamp();

  await db.collection("momentos").add({
    uid: currentUser.uid,
    url,
    descripcion,
    timestamp,
    reacciones: {
      ilumina: 0,
      reviviria: 0
    },
    duracion: 12
  });

  imagenInput.value = "";
  descripcionInput.value = "";
  cargarMomentos();
});

// Cargar momentos
function cargarMomentos() {
  db.collection("momentos").orderBy("timestamp", "desc").get().then(snapshot => {
    momentosDiv.innerHTML = "";
    let destacado = null;
    snapshot.forEach(doc => {
      const momento = doc.data();
      const tiempoTranscurrido = (Date.now() - momento.timestamp?.toDate()?.getTime()) / 3600000;
      if (tiempoTranscurrido > momento.duracion) {
        doc.ref.delete(); // Borrar si venció
        return;
      }

      const div = document.createElement("div");
      div.className = "momento";
      div.innerHTML = `
        <img src="${momento.url}" alt="momento" />
        <p>${momento.descripcion}</p>
        <div class="reacciones">
          <button class="reaccion-btn" onclick="reaccionar('${doc.id}', 'ilumina')">✨ Me ilumina (${momento.reacciones.ilumina})</button>
          <button class="reaccion-btn" onclick="retoRevivir('${doc.id}', ${momento.reacciones.reviviria})">⏳ Lo reviviría (${momento.reacciones.reviviria})</button>
        </div>
      `;
      momentosDiv.appendChild(div);
      if (!destacado) destacado = div.cloneNode(true);
    });

    destacadoDiv.innerHTML = "";
    if (destacado) destacadoDiv.appendChild(destacado);
  });
}

// Reaccionar
function reaccionar(id, tipo) {
  const ref = db.collection("momentos").doc(id);
  ref.update({ [`reacciones.${tipo}`]: firebase.firestore.FieldValue.increment(1) });
  cargarMomentos();
}

// Reto de “Lo reviviría”
function retoRevivir(id, cantidad) {
  alert("¡Reto activado! Si te vuelve a pasar algo así, debes subirlo nuevamente 🌀");
  reaccionar(id, 'reviviria');
}
