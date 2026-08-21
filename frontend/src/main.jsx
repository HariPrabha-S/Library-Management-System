import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// Global fetch interceptor to automatically attach stored JWT token to all API calls
const originalFetch = window.fetch;
window.fetch = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    if (token) {
        if (!options.headers) {
            options.headers = {};
        }
        if (options.headers instanceof Headers) {
            if (!options.headers.has('Authorization')) {
                options.headers.set('Authorization', `Bearer ${token}`);
            }
        } else {
            options.headers = {
                'Authorization': `Bearer ${token}`,
                ...options.headers,
            };
        }
    }
    return originalFetch(url, options);
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);