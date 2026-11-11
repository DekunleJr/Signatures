import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import ToastContainer from "../components/Toast/Toast";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = useCallback((newToken, userData) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }, []);

  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useMemo(() => {
    const push = (type) => (message, description) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, type, message, description }]);
      setTimeout(() => dismiss(id), 3000);
    };
    return {
      success: push("success"),
      info: push("info"),
      warning: push("warning"),
      error: push("error"),
    };
  }, [dismiss]);

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      logout,
      toast,
    }),
    [user, token, login, logout, toast]
  );

  return (
    <AuthContext.Provider value={value}>
      <ToastContainer toasts={toasts} onClose={dismiss} />
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
