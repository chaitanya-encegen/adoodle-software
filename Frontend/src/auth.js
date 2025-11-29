// auth.js
export const TOKEN_KEY = "ADOODLE_TOKEN";

// Save token
export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

// Get token
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

// Clear token
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// Check login
export function isLoggedIn() {
  return !!getToken();
}

// Decode token payload safely
export function decodeToken(token) {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch (err) {
    return null;
  }
}

// Get user role (admin/user)
export function getRole() {
  const token = getToken();
  const payload = decodeToken(token);
  return payload?.role || null;
}

// Optional: Get entire user info (email, id, role)

// Auth fetch with Authorization header
export async function authFetch(url, opts = {}) {
  opts.headers = opts.headers || {};
  const token = getToken();

  if (token) opts.headers["Authorization"] = "Bearer " + token;

  if (
    opts.body &&
    typeof opts.body === "object" &&
    !(opts.body instanceof FormData) &&
    !opts.headers["Content-Type"]
  ) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(opts.body);
  }

  return fetch(url, opts);
}
export function getUser() {
  const token = getToken();
  const payload = decodeToken(token);
  return payload || null;
}
