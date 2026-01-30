// src/api/http.ts
import axios from "axios";

export const API_BASE_URL = "http://localhost:3001/api/v1/";

export const http = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: auth interceptor
http.interceptors.request.use((config) => {
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9maWxlSWQiOiI3MzVmNDBlYS0zYWM2LTRlOGMtOTRlNC1jMzI1OTkzM2IxYjEiLCJuaWNrTmFtZSI6ImFsaWNlNDEiLCJyb2xlIjoiVVNFUiIsImlhdCI6MTc2OTc3ODIzMywiZXhwIjoxNzY5NzgxODMzfQ.WkrY9Z645qXSE-g8EPU8S3ubbF_IHJc-5EQRPTISSJc";
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
