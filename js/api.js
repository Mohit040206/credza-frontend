const BASE_URL = "https://credza-backend.onrender.com";

export const api = async (endpoint, method = "GET", body = null) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: body ? JSON.stringify(body) : null
  });

  return res.json();
};