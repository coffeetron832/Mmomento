document.addEventListener('DOMContentLoaded', () => {
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

  const auth = firebase.auth();
  const db = firebase.firestore();
  const storage = firebase.storage();

  // Elementos HTML
  const loginButton = document.getElementById('login');
  const logoutButton = document.getElementById('logout');
  const perfilUsuarioDiv = document.getElementById('perfil-usuario');
  const momentosDiv = document.getElementById('momentos');
  const editarPerfilButton = document.getElementById('editar-perfil');
  const nuevoMomentoButton = document.getElementById('nuevo-momento');

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

  // Funcionalidad para "Editar Perfil"
  editarPerfilButton.addEventListener('click', () => {
    const nuevoNombre = prompt("Introduce tu nuevo nombre:");
    const nuevaBio = prompt("Introduce tu nueva biografía:");

    if (nuevoNombre && nuevaBio) {
      const user = auth.currentUser;
      db.collection('usuarios').doc(user.uid).set({
        nombre: nuevoNombre,
        bio: nuevaBio
      }, { merge: true })
      .then(() => {
        console.log('Perfil actualizado');
        mostrarUsuario(user); // Actualiza el perfil en pantalla
      })
      .catch((error) => console.error('Error actualizando el perfil:', error));
    } else {
      alert("Por favor, completa ambos campos.");
    }
  });

  // Funcionalidad para "Nuevo Momento"
  nuevoMomentoButton.addEventListener('click', () => {
    const descripcion = prompt("Escribe una descripción para tu momento:");
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    fileInput.onchange = (event) => {
      const file = event.target.files[0];
      if (file && descripcion) {
        const storageRef = storage.ref(`momentos/${file.name}`);
        const uploadTask = storageRef.put(file);

        uploadTask.on('state_changed', null, (error) => {
          console.error('Error subiendo la imagen:', error);
        }, () => {
          uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
            db.collection('momentos').add({
              foto: downloadURL,
              descripcion: descripcion,
              timestamp: firebase.firestore.FieldValue.serverTimestamp()
            })
            .then(() => {
              console.log('Nuevo momento agregado');
              mostrarMomentos(); // Actualiza el feed
            })
            .catch((error) => console.error('Error guardando el momento:', error));
          });
        });
      } else {
        alert("Por favor, selecciona una imagen y escribe una descripción.");
      }
    };

    fileInput.click();
  });
});
