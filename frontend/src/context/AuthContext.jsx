import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { notification } from "antd";

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

  const [api, toastContextHolder] = notification.useNotification();

  const toast = useMemo(
    () => ({
      success: (message, description) => {
        api.success({
          message,
          description,
          placement: "topRight",
          duration: 3,
        });
      },
      info: (message, description) => {
        api.info({
          message,
          description,
          placement: "topRight",
          duration: 3,
        });
      },
      warning: (message, description) => {
        api.warning({
          message,
          description,
          placement: "topRight",
          duration: 3,
        });
      },
      error: (message, description) => {
        api.error({
          message,
          description,
          placement: "topRight",
          duration: 3,
        });
      },
    }),
    [api]
  );

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
      {toastContextHolder}
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
