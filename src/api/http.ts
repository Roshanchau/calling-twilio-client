// src/api/http.ts
import axios from "axios";

export const API_BASE_URL = "https://ebcbd6d8d74b.ngrok-free.app/api/v1";

export const http = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

// Optional: auth interceptor
http.interceptors.request.use((config) => {
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9maWxlSWQiOiI3MzVmNDBlYS0zYWM2LTRlOGMtOTRlNC1jMzI1OTkzM2IxYjEiLCJuaWNrTmFtZSI6ImFsaWNlNDEiLCJyb2xlIjoiVVNFUiIsImlhdCI6MTc3MDAwOTA3MiwiZXhwIjoxNzcwMDEyNjcyfQ.G5Ra0rltZdB2qDDcwUa7ECS06vAtKcO15tTlDZtHAGk";
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
