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

// Variables de elementos HTML
const loginButton = document.getElementById('login');
const logoutButton = document.getElementById('logout');
const userInfoDiv = document.getElementById('user-info');
const perfilUsuarioDiv = document.getElementById('perfil-usuario');
const momentosDiv = document.getElementById('momentos');

// Función para gestionar el inicio de sesión de Google
loginButton.addEventListener('click', function () {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then((result) => {
      const user = result.user;
      console.log("Usuario autenticado:", user);
      mostrarUsuario(user);
    })
    .catch((error) => {
      console.error("Error al iniciar sesión:", error);
    });
});

// Función para mostrar la información del usuario después del login
function mostrarUsuario(user) {
  userInfoDiv.innerHTML = `
    <p>Bienvenido, ${user.displayName}!</p>
    <p>Email: ${user.email}</p>
  `;
  loginButton.style.display = 'none';
  logoutButton.style.display = 'block';

  cargarPerfil(user.uid);
}

// Función para cargar el perfil del usuario desde Firestore
function cargarPerfil(usuarioId) {
  const db = firebase.firestore();
  const usuarioRef = db.collection('usuarios').doc(usuarioId);

  usuarioRef.get().then((doc) => {
    if (doc.exists) {
      const usuario = doc.data();
      document.getElementById('foto-perfil').src = usuario.foto || 'default-avatar.jpg';
      document.getElementById('nombre-usuario').textContent = usuario.nombre || 'Sin nombre';
      document.getElementById('bio-usuario').textContent = usuario.bio || 'No hay descripción';
      perfilUsuarioDiv.style.display = 'block';
    } else {
      console.log("No se encontró el perfil");
    }
  }).catch((error) => {
    console.error("Error obteniendo el perfil:", error);
  });
}

// Función para subir un nuevo momento
document.getElementById('subir').addEventListener('click', function () {
  const imagenInput = document.getElementById('imagen');
  const descripcionInput = document.getElementById('descripcion');

  if (imagenInput.files[0] && descripcionInput.value.trim() !== '') {
    const file = imagenInput.files[0];
    const descripcion = descripcionInput.value;

    const storageRef = firebase.storage().ref();
    const fotoRef = storageRef.child('momentos/' + file.name);
    const uploadTask = fotoRef.put(file);

    uploadTask.on('state_changed', function (snapshot) {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log('Progreso de la carga: ' + progress + '%');
    }, function (error) {
      console.error('Error al subir el momento:', error);
    }, function () {
      uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
        const db = firebase.firestore();
        db.collection('momentos').add({
          foto: downloadURL,
          descripcion: descripcion,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
          console.log('Momento guardado exitosamente');
          mostrarMomentos();
        }).catch((error) => {
          console.error('Error guardando el momento:', error);
        });
      });
    });
  } else {
    alert('Por favor, selecciona una imagen y escribe una descripción.');
  }
});

// Función para mostrar los momentos en el feed
function mostrarMomentos() {
  const db = firebase.firestore();
  const momentosRef = db.collection('momentos').orderBy('timestamp', 'desc').limit(10);

  momentosRef.get().then((querySnapshot) => {
    momentosDiv.innerHTML = '';
    querySnapshot.forEach((doc) => {
      const momento = doc.data();
      const momentoElement = document.createElement('div');
      momentoElement.classList.add('momento');
      momentoElement.innerHTML = `
        <img src="${momento.foto}" alt="Momento" />
        <p>${momento.descripcion}</p>
      `;
      momentosDiv.appendChild(momentoElement);
    });
  }).catch((error) => {
    console.error("Error obteniendo los momentos:", error);
  });
}

// Función para cerrar sesión
logoutButton.addEventListener('click', function () {
  firebase.auth().signOut().then(() => {
    console.log('Sesión cerrada');
    loginButton.style.display = 'block';
    logoutButton.style.display = 'none';
    userInfoDiv.innerHTML = '';
    perfilUsuarioDiv.style.display = 'none';
  }).catch((error) => {
    console.error('Error cerrando sesión:', error);
  });
});

// Comprobación de estado de autenticación al cargar la página
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    mostrarUsuario(user);
    mostrarMomentos();
  } else {
    console.log('No autenticado');
  }
});
