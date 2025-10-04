import axios from "axios";

export const customAxios = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api` || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

customAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
