// 1. CONFIGURACIÓN DE FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyBAAPW2_kuwfNLV3hI1FzhaOUGfJpvv7vQ",
  authDomain: "momento-40bd7.firebaseapp.com",
  projectId: "momento-40bd7",
  storageBucket: "momento-40bd7.firebasestorage.app",
  messagingSenderId: "576930270515",
  appId: "1:576930270515:web:1fa7ce310ff577ec5ec246"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const storage = firebase.storage();
const firestore = firebase.firestore();

// 2. REFERENCIAS DEL DOM
const imagenInput = document.getElementById('imagen');
const descripcionInput = document.getElementById('descripcion');
const subirButton = document.getElementById('subir');
const momentosDiv = document.getElementById('momentos');
const momentoDestacado = document.getElementById('momento-destacado');
const userInfo = document.getElementById('user-info');
const logoutButton = document.getElementById('logout');

// BOTÓN PARA INICIAR SESIÓN (creado dinámicamente si no existe)
let loginButton = document.getElementById('login');
if (!loginButton) {
  loginButton = document.createElement('button');
  loginButton.id = 'login';
  loginButton.textContent = 'Iniciar sesión';
  document.querySelector('header').appendChild(loginButton);
}

// 3. INICIO DE SESIÓN
loginButton.addEventListener('click', () => {
  const email = prompt("Correo:");
  const password = prompt("Contraseña:");

  auth.signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      const user = userCredential.user;
      userInfo.textContent = `Bienvenido, ${user.email}`;
      loginButton.style.display = 'none';
      logoutButton.style.display = 'block';
    })
    .catch(error => {
      alert("Error al iniciar sesión: " + error.message);
    });
});

// 4. CERRAR SESIÓN
logoutButton.addEventListener('click', () => {
  auth.signOut().then(() => {
    userInfo.textContent = '';
    loginButton.style.display = 'block';
    logoutButton.style.display = 'none';
  });
});

// 5. DETECTAR CAMBIOS EN AUTENTICACIÓN
auth.onAuthStateChanged(user => {
  if (user) {
    userInfo.textContent = `Bienvenido, ${user.email}`;
    loginButton.style.display = 'none';
    logoutButton.style.display = 'block';
  } else {
    userInfo.textContent = '';
    loginButton.style.display = 'block';
    logoutButton.style.display = 'none';
  }
});

// 6. SUBIDA DE MOMENTO
subirButton.addEventListener('click', () => {
  const archivo = imagenInput.files[0];
  const descripcion = descripcionInput.value;

  if (archivo && descripcion) {
    const nombreArchivo = `${Date.now()}-${archivo.name}`;
    const refStorage = storage.ref(`momentos/${nombreArchivo}`);
    const uploadTask = refStorage.put(archivo);

    uploadTask.on('state_changed', null, error => {
      console.error("Error al subir la imagen:", error);
    }, async () => {
      const imagenUrl = await uploadTask.snapshot.ref.getDownloadURL();

      await firestore.collection('momentos').add({
        descripcion,
        imagenUrl,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });

      imagenInput.value = '';
      descripcionInput.value = '';
    });

  } else {
    alert("Debes subir una imagen y escribir una descripción.");
  }
});

// 7. MOSTRAR MOMENTOS EN TIEMPO REAL
firestore.collection('momentos')
  .orderBy('timestamp', 'desc')
  .onSnapshot(snapshot => {
    momentosDiv.innerHTML = '';
    let primero = true;

    snapshot.forEach(doc => {
      const data = doc.data();
      const div = document.createElement('div');
      div.classList.add('momento');
      div.innerHTML = `
        <img src="${data.imagenUrl}" alt="Imagen del momento" />
        <p>${data.descripcion}</p>
      `;

      if (primero) {
        momentoDestacado.innerHTML = div.innerHTML;
        primero = false;
      } else {
        momentosDiv.appendChild(div);
      }
    });
  });
