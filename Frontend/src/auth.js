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
export async function authFetch(url, options = {}) {
  const token = getToken();

  // MERGE HEADERS SAFELY
  const mergedHeaders = {
    ...(options.headers || {}),              // keep user headers
    ...(token ? { Authorization: `Bearer ${token}` } : {}), // add token
  };

  // AUTO JSON STRINGIFY
  if (
    options.body &&
    typeof options.body === "object" &&
    !(options.body instanceof FormData)
  ) {
    mergedHeaders["Content-Type"] = mergedHeaders["Content-Type"] || "application/json";
    options.body = JSON.stringify(options.body);
  }

  return fetch(url, {
    ...options,
    headers: mergedHeaders,
    credentials: "include",   // required for CORS if cookies ever used
  });
}

export function getUser() {
  const token = getToken();
  const payload = decodeToken(token);
  return payload || null;
}
