const API_URL = "https://momento-backend-production.up.railway.app/api"; // Cámbialo si es necesario

async function apiRequest(endpoint, method, data, token = null) {
  const config = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  if (data) config.body = JSON.stringify(data);

  const res = await fetch(`${API_URL}${endpoint}`, config);
  return res.json();
}

