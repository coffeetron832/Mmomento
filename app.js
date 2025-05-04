/ Importar funciones desde Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBAAPW2_kuwfNLV3hI1FzhaOUGfJpvv7vQ",
  authDomain: "momento-40bd7.firebaseapp.com",
  projectId: "momento-40bd7",
  storageBucket: "momento-40bd7.firebasestorage.app",
  messagingSenderId: "576930270515",
  appId: "1:576930270515:web:1fa7ce310ff577ec5ec246"
};


 // Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Referencias a elementos del DOM
const loginButton = document.getElementById('login');
const logoutButton = document.getElementById('logout');
const nuevoMomentoButton = document.getElementById('nuevo-momento');
const perfilUsuarioDiv = document.getElementById('perfil-usuario');
const nombreUsuario = document.getElementById('nombre-usuario');

// Iniciar sesión con Google
loginButton.addEventListener('click', () => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then((result) => {
      mostrarUsuario(result.user);
    })
    .catch((error) => {
      console.error('Error al iniciar sesión:', error);
      alert('No se pudo iniciar sesión.');
    });
});

// Cerrar sesión
logoutButton.addEventListener('click', () => {
  signOut(auth)
    .then(() => {
      perfilUsuarioDiv.style.display = 'none';
      loginButton.style.display = 'block';
      logoutButton.style.display = 'none';
    });
});

// Mostrar perfil
function mostrarUsuario(user) {
  perfilUsuarioDiv.style.display = 'block';
  nombreUsuario.textContent = user.displayName || 'Sin nombre';
  loginButton.style.display = 'none';
  logoutButton.style.display = 'block';
}

// Escuchar cambios en autenticación
onAuthStateChanged(auth, (user) => {
  if (user) {
    mostrarUsuario(user);
  } else {
    perfilUsuarioDiv.style.display = 'none';
    loginButton.style.display = 'block';
    logoutButton.style.display = 'none';
  }
});

// Subir nuevo momento
nuevoMomentoButton.addEventListener('click', async () => {
  const descripcion = prompt('Describe tu momento:');
  if (!descripcion) return alert('Debes escribir una descripción.');

  try {
    await addDoc(collection(db, 'momentos'), {
      descripcion,
      timestamp: serverTimestamp()
    });
    alert('Momento subido con éxito.');
  } catch (error) {
    console.error('Error al subir el momento:', error);
    alert('No se pudo subir el momento.');
  }
});
