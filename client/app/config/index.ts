import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

// Base URL for the backend (Update with your actual backend URL)
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
// Create a default Axios instance for normal JSON requests
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 20000, // Timeout after 10 seconds
  headers: {
    "Content-Type": "application/json",
  },
});


const addHeaders = (headers: Record<string, string>) => {
  if (api && api.defaults && api.defaults.headers && api.defaults.headers.common) {
    Object.assign(api.defaults.headers.common, headers);
  }
};

// Function to make a post request with dynamically added headers.
const postWithHeaders = async (
  url: string,
  data: any,
  headers: Record<string, string> = {}
) => {
  const config: AxiosRequestConfig = {
    headers: {
      ...api.defaults.headers.common,
      ...headers,
    },
  };
  return api.post(url, data, config);
};

const getWithHeaders = async (
  url: string,
  headers: Record<string, string> = {}
) => {
  const config: AxiosRequestConfig = {
    headers: {
      ...api.defaults.headers.common,
      ...headers,
    },
  };
  return api.get(url, config);
};

export { api,postWithHeaders,addHeaders,getWithHeaders };