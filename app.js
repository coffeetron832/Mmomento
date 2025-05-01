// Configura Firebase
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
auth.onAuthStateChanged(user => {
  if (user) {
    document.getElementById("user-info").innerText = `Hola, usuario #${user.uid.slice(0, 6)}`;
    document.getElementById("logout").style.display = "inline-block";
    cargarMomentos();
  } else {
    auth.signInAnonymously();
  }
});

document.getElementById("logout").onclick = () => auth.signOut();

// Subir imagen
document.getElementById("subir").addEventListener("click", async () => {
  const archivo = document.getElementById("imagen").files[0];
  const descripcion = document.getElementById("descripcion").value.trim();

  if (!archivo || !descripcion) return alert("Sube una imagen y agrega descripción.");

  const id = Date.now();
  const ref = storage.ref(`momentos/${id}-${archivo.name}`);
  await ref.put(archivo);
  const url = await ref.getDownloadURL();

  await db.collection("momentos").add({
    url,
    descripcion,
    usuario: auth.currentUser.uid,
    creado: firebase.firestore.FieldValue.serverTimestamp(),
    expira: Date.now() + 12 * 60 * 60 * 1000,
    reacciones: { ilumina: 0, reviviria: 0 }
  });

  document.getElementById("descripcion").value = "";
  document.getElementById("imagen").value = "";
});

// Cargar momentos
async function cargarMomentos() {
  const contenedor = document.getElementById("momentos");
  contenedor.innerHTML = "";
  const snap = await db.collection("momentos").orderBy("creado", "desc").get();

  let destacado = null;
  let másLikes = 0;

  snap.forEach(doc => {
    const data = doc.data();
    if (Date.now() > data.expira) return;

    const div = document.createElement("div");
    div.className = "momento";
    div.innerHTML = `
      <img src="${data.url}" />
      <p>${data.descripcion}</p>
      <div class="reacciones">
        <button onclick="reaccionar('${doc.id}', 'ilumina')">🌟 Me ilumina (${data.reacciones?.ilumina || 0})</button>
        <button onclick="reaccionar('${doc.id}', 'reviviria')">🔁 Lo reviviría (${data.reacciones?.reviviria || 0})</button>
      </div>
    `;
    contenedor.appendChild(div);

    const total = (data.reacciones?.ilumina || 0) + (data.reacciones?.reviviria || 0);
    if (total > másLikes) {
      másLikes = total;
      destacado = div.cloneNode(true);
    }
  });

  const dest = document.getElementById("momento-destacado");
  dest.innerHTML = destacado ? destacado.outerHTML : "<p>Aún no hay uno destacado.</p>";
}

// Reaccionar
window.reaccionar = async (id, tipo) => {
  const ref = db.collection("momentos").doc(id);
  const doc = await ref.get();
  const data = doc.data();

  const nuevas = {
    ...data.reacciones,
    [tipo]: (data.reacciones?.[tipo] || 0) + 1
  };

  await ref.update({ reacciones: nuevas });
  cargarMomentos();
};
