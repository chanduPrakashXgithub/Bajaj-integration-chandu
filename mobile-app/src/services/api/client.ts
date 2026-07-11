import axios from "axios";
import axiosRetry from "axios-retry";

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api",
  // baseURL: process.env.EXPO_PUBLIC_API_URL || "https://bajaj-backend-skxt.onrender.com/api",
  timeout: 120000,
});

axiosRetry(apiClient, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  shouldResetTimeout: true,
});
