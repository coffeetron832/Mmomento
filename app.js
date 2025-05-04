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

// Configuración de Firebase (usa variables de entorno para ocultar credenciales)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Elementos HTML
const loginButton = document.getElementById('login');
const logoutButton = document.getElementById('logout');
const perfilUsuarioDiv = document.getElementById('perfil-usuario');
const momentosDiv = document.getElementById('momentos');

// Iniciar sesión con Google
loginButton.addEventListener('click', () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then((result) => {
      console.log('Usuario autenticado');
      mostrarUsuario(result.user);
    })
    .catch((error) => console.error('Error al iniciar sesión:', error));
});

// Cerrar sesión
logoutButton.addEventListener('click', () => {
  auth.signOut()
    .then(() => {
      console.log('Sesión cerrada');
      perfilUsuarioDiv.style.display = 'none';
      logoutButton.style.display = 'none';
      loginButton.style.display = 'block';
    });
});

// Mostrar la información del usuario
function mostrarUsuario(user) {
  perfilUsuarioDiv.style.display = 'block';
  document.getElementById('foto-perfil').src = user.photoURL || 'default-avatar.jpg';
  document.getElementById('nombre-usuario').textContent = user.displayName || 'Sin nombre';
  document.getElementById('bio-usuario').textContent = 'Bienvenido a Momento';
  loginButton.style.display = 'none';
  logoutButton.style.display = 'block';
}

// Mostrar momentos
function mostrarMomentos() {
  momentosDiv.innerHTML = '<p>Cargando momentos...</p>';
  db.collection('momentos').orderBy('timestamp', 'desc').limit(10)
    .get()
    .then((querySnapshot) => {
      momentosDiv.innerHTML = '';
      querySnapshot.forEach((doc) => {
        const momento = doc.data();
        const momentoElement = document.createElement('div');
        momentoElement.innerHTML = `
          <img src="${momento.foto}" alt="Momento">
          <p>${momento.descripcion}</p>
        `;
        momentosDiv.appendChild(momentoElement);
      });
    })
    .catch((error) => console.error('Error cargando momentos:', error));
}

// Estado de autenticación
auth.onAuthStateChanged((user) => {
  if (user) {
    mostrarUsuario(user);
    mostrarMomentos();
  } else {
    console.log('Usuario no autenticado');
    perfilUsuarioDiv.style.display = 'none';
    mostrarMomentos();
  }
});
