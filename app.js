document.addEventListener('DOMContentLoaded', () => {
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";
  
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
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

// Referencias a servicios de Firebase
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Resto de tu código...
console.log("Firebase inicializado correctamente");
  
// Referencias a los elementos HTML
const loginButton = document.getElementById('login');
const logoutButton = document.getElementById('logout');
const nuevoMomentoButton = document.getElementById('nuevo-momento');
const perfilUsuarioDiv = document.getElementById('perfil-usuario');
const nombreUsuario = document.getElementById('nombre-usuario');

// Función para iniciar sesión
loginButton.addEventListener('click', () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then((result) => {
      console.log('Usuario autenticado:', result.user);
      mostrarUsuario(result.user);
    })
    .catch((error) => {
      console.error('Error al iniciar sesión:', error);
      alert('No se pudo iniciar sesión. Revisa la consola para más detalles.');
    });
});

// Función para mostrar los datos del usuario
function mostrarUsuario(user) {
  perfilUsuarioDiv.style.display = 'block';
  nombreUsuario.textContent = user.displayName || 'Sin nombre';
  loginButton.style.display = 'none';
  logoutButton.style.display = 'block';
}

// Función para subir un momento (prototipo)
nuevoMomentoButton.addEventListener('click', () => {
  const descripcion = prompt('Describe tu momento:');
  if (!descripcion) {
    alert('Por favor, escribe una descripción para tu momento.');
    return;
  }

  const momento = {
    descripcion,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  };

  db.collection('momentos').add(momento)
    .then(() => {
      alert('Momento subido con éxito.');
    })
    .catch((error) => {
      console.error('Error al subir el momento:', error);
      alert('No se pudo subir el momento. Revisa la consola para más detalles.');
    });
});

// Verificar el estado de autenticación
auth.onAuthStateChanged((user) => {
  if (user) {
    mostrarUsuario(user);
  } else {
    perfilUsuarioDiv.style.display = 'none';
    loginButton.style.display = 'block';
    logoutButton.style.display = 'none';
  }
});
