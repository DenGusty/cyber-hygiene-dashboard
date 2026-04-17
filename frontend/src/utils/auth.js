export function saveAuth(data) {
  localStorage.setItem("token", data.access_token);
  localStorage.setItem(
    "user",
    JSON.stringify({
      id: data.user_id,
      email: data.email,
    })
  );
}

export function getToken() {
  return localStorage.getItem("token");
}

export function getCurrentUser() {
  const raw = localStorage.getItem("user");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function isLoggedIn() {
  const token = getToken();
  const user = getCurrentUser();
  return !!token && !!user;
}