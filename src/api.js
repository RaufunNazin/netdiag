import axios from "axios";

// Your backend's base URL
const API_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
});

// 1. Request Interceptor: Adds the token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      // Set the authorization header
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. Response Interceptor: Handles 401 (Unauthorized) errors
api.interceptors.response.use(
  (response) => {
    // If the request was successful, just return the response
    return response;
  },
  (error) => {
    // Check if the error is a 401 Unauthorized
    if (error.response && error.response.status === 401) {
      console.error("Authentication Error: Token is invalid or expired.");

      // Remove the bad token from storage
      localStorage.removeItem("access_token");

      // Redirect the user to the login page
      // We use window.location to force a full page reload, clearing any app state.
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    // Return the error so it can be caught by the calling function (e.g., in toast messages)
    return Promise.reject(error);
  }
);

export default api;
