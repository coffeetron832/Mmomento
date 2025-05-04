// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
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
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Referencias a elementos HTML
const loginButton = document.getElementById('login');
const logoutButton = document.getElementById('logout');
const nuevoMomentoButton = document.getElementById('nuevo-momento');
const perfilUsuarioDiv = document.getElementById('perfil-usuario');
const nombreUsuario = document.getElementById('nombre-usuario');
const momentosDiv = document.getElementById('momentos');

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
    });
});

// Función para mostrar datos del usuario
function mostrarUsuario(user) {
  perfilUsuarioDiv.style.display = 'block';
  nombreUsuario.textContent = user.displayName || 'Sin nombre';
  loginButton.style.display = 'none';
  logoutButton.style.display = 'block';
}

// Función para cerrar sesión
logoutButton.addEventListener('click', () => {
  auth.signOut().then(() => {
    perfilUsuarioDiv.style.display = 'none';
    loginButton.style.display = 'block';
    logoutButton.style.display = 'none';
  });
});

// Función para agregar un nuevo momento
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
      cargarMomentos();
    })
    .catch((error) => {
      console.error('Error al subir el momento:', error);
    });
});

// Función para cargar momentos
function cargarMomentos() {
  db.collection('momentos').orderBy('timestamp', 'desc').get()
    .then((querySnapshot) => {
      momentosDiv.innerHTML = '';
      querySnapshot.forEach((doc) => {
        const momento = doc.data();
        const momentoDiv = document.createElement('div');
        momentoDiv.classList.add('momento');
        momentoDiv.textContent = momento.descripcion;
        momentosDiv.appendChild(momentoDiv);
      });
    })
    .catch((error) => {
      console.error('Error al cargar momentos:', error);
    });
}

// Verificar el estado de autenticación
auth.onAuthStateChanged((user) => {
  if (user) {
    mostrarUsuario(user);
    cargarMomentos();
  } else {
    perfilUsuarioDiv.style.display = 'none';
    loginButton.style.display = 'block';
    logoutButton.style.display = 'none';
  }
});

