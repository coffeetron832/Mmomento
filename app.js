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
const loginBtn = document.getElementById('login');
const logoutBtn = document.getElementById('logout');
const nombreUsuario = document.getElementById('nombre-usuario');
const perfil = document.getElementById('perfil');
const nuevoMomentoBtn = document.getElementById('nuevo-momento');
const momentosDiv = document.getElementById('momentos');

// Iniciar sesión con Google
loginBtn.addEventListener('click', () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then(result => {
      const user = result.user;
      nombreUsuario.textContent = user.displayName;
      perfil.style.display = 'block';
      loginBtn.style.display = 'none';
      logoutBtn.style.display = 'inline-block';
      cargarMomentos(); // Cargar momentos al iniciar sesión
    })
    .catch(err => {
      console.error('Error al iniciar sesión:', err);
      alert('Error al iniciar sesión.');
    });
});

// Cerrar sesión
logoutBtn.addEventListener('click', () => {
  auth.signOut();
});

// Escuchar cambios de estado
auth.onAuthStateChanged(user => {
  if (user) {
    nombreUsuario.textContent = user.displayName;
    perfil.style.display = 'block';
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    cargarMomentos(); // Cargar momentos si ya hay sesión iniciada
  } else {
    perfil.style.display = 'none';
    loginBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    momentosDiv.innerHTML = ''; // Limpiar momentos si se cierra sesión
  }
});

// Agregar momento
nuevoMomentoBtn.addEventListener('click', () => {
  const descripcion = prompt('Escribe tu momento:');
  if (!descripcion) return;

  db.collection('momentos').add({
    descripcion,
    fecha: new Date()
  }).then(() => {
    alert('Momento guardado.');
    cargarMomentos();
  }).catch(err => {
    console.error('Error guardando momento:', err);
  });
});

// Mostrar momentos
function cargarMomentos() {
  momentosDiv.innerHTML = '';
  db.collection('momentos').orderBy('fecha', 'desc').limit(10).get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        const momento = doc.data();
        const div = document.createElement('div');
        div.textContent = `${momento.descripcion} (${momento.fecha.toDate().toLocaleString()})`;
        momentosDiv.appendChild(div);
      });
    });
}
