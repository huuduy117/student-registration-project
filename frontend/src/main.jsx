import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import axios from "axios";

// Global interceptor to unwrap the new structured JSON response format
axios.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data.success !== "undefined") {
      if (response.data.success) {
        response.data = response.data.data;
      } else {
        return Promise.reject(new Error(response.data.message));
      }
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.data && typeof error.response.data.success !== "undefined") {
      error.response.data.message = error.response.data.message || "Lỗi server";
    }
    return Promise.reject(error);
  }
);
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
