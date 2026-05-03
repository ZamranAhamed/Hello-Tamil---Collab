import axios, { AxiosInstance, AxiosError } from "axios";

// Fixed backend URL - update this to match your backend server
const BASE_URL = "http://172.27.26.232:8001/api";

// Create Axios instance with fixed configuration
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // 15 seconds timeout
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error("[API] Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`[API] Response ${response.status} for ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error: AxiosError) => {
    console.error("[API] Response error:", {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
    });

    // Handle specific error types
    if (error.code === "NETWORK_ERROR" || error.message?.includes("Network Error")) {
      console.error("[API] Network connectivity issue. Check:");
      console.error("  - Backend server is running at:", BASE_URL);
      console.error("  - Device is on same network as backend");
      console.error("  - Firewall allows connections to backend");
    }

    if (error.code === "ECONNREFUSED") {
      console.error("[API] Connection refused. Backend may not be running.");
    }

    if (error.response?.status === 404) {
      console.error("[API] Endpoint not found. Check API routes.");
    }

    return Promise.reject(error);
  }
);

// Type definitions
export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
}

// Generic API request function
export async function apiRequest<T = any>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  url: string,
  data?: any,
  config?: any
): Promise<ApiResponse<T>> {
  try {
    const response = await api.request({
      method,
      url,
      data,
      ...config,
    });

    return {
      data: response.data,
      success: true,
    };
  } catch (error) {
    const axiosError = error as AxiosError;

    return {
      data: null as T,
      success: false,
      message: axiosError.message || "Unknown error occurred",
    };
  }
}

// Specific API functions
export async function getCategories(): Promise<any> {
  const response = await apiRequest("GET", "/categories");
  if (response.success) {
    return response.data;
  }
  throw new Error(response.message || "Failed to fetch categories");
}

export async function getWords(category: string): Promise<any> {
  const response = await apiRequest("GET", `/categories/${category}`);
  if (response.success) {
    return response.data;
  }
  throw new Error(response.message || "Failed to fetch words");
}

// Utility function to test connection
export async function testApiConnection(): Promise<boolean> {
  try {
    await api.get("/health"); // Assuming backend has a health endpoint
    console.log("[API] Connection test successful");
    return true;
  } catch (error) {
    console.error("[API] Connection test failed:", error);
    return false;
  }
}

// Export the axios instance as default for backward compatibility
export default api;

