const backendURL = 'https://momento-backend-production.up.railway.app';

// Función para obtener headers con token JWT
function getAuthHeaders(isJson = true) {
  const headers = {};
  if (isJson) headers['Content-Type'] = 'application/json';
  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

// Función para hacer login
async function login(email, password) {
  try {
    const res = await fetch(`${backendURL}/api/auth/login`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email, password }),
      // NO credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error en login');

    // Guardar token y username en localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.username);

    console.log('Login exitoso:', data.username);
    return data;
  } catch (error) {
    console.error('Error en login:', error.message);
    throw error;
  }
}

// Función para registro
async function register(username, email, password) {
  try {
    const res = await fetch(`${backendURL}/api/auth/register`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ username, email, password }),
      // NO credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error en registro');

    // Guardar token y username en localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.username);

    console.log('Registro exitoso:', data.username);
    return data;
  } catch (error) {
    console.error('Error en registro:', error.message);
    throw error;
  }
}

// Ejemplo función para subir imagen protegida con JWT
async function uploadImage(file) {
  try {
    const formData = new FormData();
    formData.append('imagen', file);

    const res = await fetch(`${backendURL}/api/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        // NO poner Content-Type para que fetch lo maneje con FormData
      },
      body: formData,
      // NO credentials: 'include'
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al subir imagen');

    console.log('Imagen subida:', data.filename);
    return data;
  } catch (error) {
    console.error('Error en subida de imagen:', error.message);
    throw error;
  }
}

// Ejemplo función para obtener lista de imágenes
async function fetchImages() {
  try {
    const res = await fetch(`${backendURL}/api/upload`, {
      method: 'GET',
      headers: getAuthHeaders(false),
      // NO credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al obtener imágenes');

    console.log('Imágenes:', data);
    return data;
  } catch (error) {
    console.error('Error al obtener imágenes:', error.message);
    throw error;
  }
}

// Limpieza de sesión
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  console.log('Usuario desconectado');
}

