import { createContext, useContext, useState, useEffect } from "react";
import { getToken, saveToken, clearToken, decodeToken } from "../auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getToken());
  const [role, setRole] = useState(null);

  useEffect(() => {
    if (token) {
      const payload = decodeToken(token);
      setRole(payload?.role || null);
    } else {
      setRole(null);
    }
  }, [token]);

  const login = (newToken) => {
    saveToken(newToken);
    setToken(newToken);
  };

  const logout = () => {
    clearToken();
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
