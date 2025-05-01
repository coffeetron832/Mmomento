// 1. Configuración de Firebase
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_MESSAGING_ID",
  appId: "TU_APP_ID"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const storage = firebase.storage();
const db = firebase.firestore();

// 2. Elementos del DOM
const subirBtn = document.getElementById('subir');
const imagenInput = document.getElementById('imagen');
const descripcionInput = document.getElementById('descripcion');
const momentosContainer = document.getElementById('momentos');
const destacadoContainer = document.getElementById('momento-destacado');
const logoutBtn = document.getElementById('logout');
const userInfo = document.getElementById('user-info');

const nombreInput = document.getElementById('nombre');
const fotoPerfilInput = document.getElementById('fotoPerfil');
const guardarPerfilBtn = document.getElementById('guardarPerfil');
const registroExtra = document.getElementById('registro-extra');

// 3. Subir imagen y guardar momento
subirBtn.addEventListener('click', async () => {
  const file = imagenInput.files[0];
  const descripcion = descripcionInput.value;
  const user = auth.currentUser;
  if (!file || !descripcion || !user) return alert("Faltan campos o no has iniciado sesión.");

  const ref = storage.ref(`momentos/${Date.now()}_${file.name}`);
  await ref.put(file);
  const url = await ref.getDownloadURL();

  await db.collection('momentos').add({
    url,
    descripcion,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    uid: user.uid
  });

  descripcionInput.value = '';
  imagenInput.value = '';
  cargarMomentos();
});

// 4. Cargar momentos y momento destacado
async function cargarMomentos() {
  momentosContainer.innerHTML = '';
  destacadoContainer.innerHTML = '';

  const snapshot = await db.collection('momentos').orderBy('timestamp', 'desc').get();

  snapshot.forEach((doc, i) => {
    const data = doc.data();
    const contenedor = document.createElement('div');
    contenedor.className = 'momento';

    contenedor.innerHTML = `
      <img src="${data.url}" />
      <p>${data.descripcion}</p>
      <div class="reacciones">
        <button class="ilumina">✨ Me ilumina</button>
        <button class="revivir" onclick="retarme('${doc.id}')">🔁 Lo reviviría</button>
      </div>
    `;

    if (i === 0) {
      destacadoContainer.appendChild(contenedor.cloneNode(true));
    }

    momentosContainer.appendChild(contenedor);
  });
}

// 5. Reacción tipo reto
function retarme(id) {
  alert(`¡Has elegido revivir este momento! Sube algo similar y etiquétalo.`);
}

// 6. Autenticación
auth.onAuthStateChanged(async user => {
  if (user) {
    logoutBtn.style.display = 'inline-block';
    userInfo.innerHTML = `Conectado como: ${user.email}`;
    mostrarRegistroExtra(user.uid);
    cargarMomentos();
  } else {
    logoutBtn.style.display = 'none';
    userInfo.innerHTML = 'No has iniciado sesión.';
    registroExtra.style.display = 'none';
  }
});

logoutBtn.addEventListener('click', () => auth.signOut());

// 7. Mostrar campos extra para nombre y foto de perfil
function mostrarRegistroExtra(uid) {
  registroExtra.style.display = 'block';
  guardarPerfilBtn.onclick = () => guardarPerfil(uid);
}

// 8. Guardar nombre y foto de perfil
async function guardarPerfil(uid) {
  const nombre = nombreInput.value;
  const archivo = fotoPerfilInput.files[0];
  let urlFoto = '';

  if (!nombre || !archivo) return alert("Completa todos los campos.");

  const ref = storage.ref(`perfiles/${uid}_${archivo.name}`);
  await ref.put(archivo);
  urlFoto = await ref.getDownloadURL();

  await db.collection('usuarios').doc(uid).set({
    nombre,
    urlFoto
  });

  alert("Perfil guardado exitosamente.");
  registroExtra.style.display = 'none';
}

// Función para guardar los datos del perfil en Firestore
function guardarPerfil(usuarioId, nombre, bio, foto) {
  const db = firebase.firestore();
  const usuarioRef = db.collection('usuarios').doc(usuarioId);

  usuarioRef.set({
    nombre: nombre,
    bio: bio,
    foto: foto,
  }, { merge: true }) // merge: true asegura que solo se actualicen los datos, sin sobrescribir todo
  .then(() => {
    console.log('Perfil actualizado correctamente');
  })
  .catch((error) => {
    console.error('Error actualizando el perfil: ', error);
  });
}

// Función para obtener los datos del perfil y mostrarlos
function cargarPerfil(usuarioId) {
  const db = firebase.firestore();
  const usuarioRef = db.collection('usuarios').doc(usuarioId);

  usuarioRef.get().then((doc) => {
    if (doc.exists) {
      const usuario = doc.data();
      // Mostrar datos del perfil
      document.getElementById('foto-perfil').src = usuario.foto || 'default-avatar.jpg'; // Foto por defecto
      document.getElementById('nombre-usuario').textContent = usuario.nombre || 'Sin nombre';
      document.getElementById('bio-usuario').textContent = usuario.bio || 'No hay descripción';

      // Mostrar el perfil
      document.getElementById('perfil-usuario').style.display = 'block';
    } else {
      console.log("No se encontró el perfil");
    }
  }).catch((error) => {
    console.error("Error obteniendo el perfil:", error);
  });
}

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // Usuario está autenticado, cargar su perfil
    cargarPerfil(user.uid);
  } else {
    // No está autenticado
    console.log('Usuario no autenticado');
  }
});

<!-- Formulario para editar el perfil (nombre, bio, foto) -->
<section id="registro-extra" style="display: none;">
  <h3>Editar Perfil</h3>
  <input type="text" id="nombre" placeholder="Tu nombre">
  <input type="text" id="bio" placeholder="Tu biografía">
  <input type="file" id="foto-perfil-input" accept="image/*">
  <button id="guardar-perfil">Guardar perfil</button>
</section>

// Subir la foto de perfil al Storage
function subirFotoPerfil(file) {
  const storageRef = firebase.storage().ref();
  const fotoRef = storageRef.child('fotos-perfil/' + file.name);
  const uploadTask = fotoRef.put(file);

  uploadTask.on('state_changed', function(snapshot) {
    // Progreso de la carga (opcional)
    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    console.log('Progreso: ' + progress + '%');
  }, function(error) {
    console.error("Error al subir la foto: ", error);
  }, function() {
    // La foto fue subida exitosamente
    uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
      console.log('Foto subida a: ', downloadURL);
      // Actualiza la URL de la foto en Firestore
      guardarPerfil(firebase.auth().currentUser.uid, document.getElementById('nombre').value, document.getElementById('bio').value, downloadURL);
    });
  });
}

// Llamar a esta función cuando el usuario haga clic en "Guardar perfil"
document.getElementById('guardar-perfil').addEventListener('click', function() {
  const fotoInput = document.getElementById('foto-perfil-input');
  const nombre = document.getElementById('nombre').value;
  const bio = document.getElementById('bio').value;
  
  if (fotoInput.files[0]) {
    subirFotoPerfil(fotoInput.files[0]);
  } else {
    // Si no sube foto, solo actualizar los datos
    guardarPerfil(firebase.auth().currentUser.uid, nombre, bio, 'default-avatar.jpg');
  }
});

