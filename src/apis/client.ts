// src/api/client.ts
import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosError,
} from "axios";

// const API_BASE_URL = "http://127.0.0.1:8000/zedvye_one";
const API_BASE_URL = "http://localhost:8000/zedvye_one";
// In-memory token storage (NO localStorage)
let accessToken: string | null = null;
let csrfToken: string | null = null;

export const client: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Refresh queue
let isRefreshing = false;
let refreshQueue: ((token: string) => void)[] = [];

const processRefreshQueue = (token: string) => {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
};

// Fetch CSRF token via API
export const fetchCsrfToken = async (): Promise<string | null> => {
  if (csrfToken) return csrfToken;
  try {
    const res = await axios.get(`${API_BASE_URL}/users/csrf/`, {
      withCredentials: true,
    });
    csrfToken = res.data.csrfToken;
    return csrfToken;
  } catch (e) {
    console.error("Failed to fetch CSRF token:", e);
    return null;
  }
};

// Refresh access token via API (matches your curl)
export const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const res = await axios.post(
      `${API_BASE_URL}/users/token/refresh/`,
      {},
      { withCredentials: true }
    );
    accessToken = res.data.access;
    return res.data.access;
  } catch (e) {
    console.error("Failed to refresh access token:", e);
    accessToken = null;
    return null;
  }
};

// ✅ Initialize auth on app startup (fixes token loss after reload)
export const initializeAuth = async (): Promise<boolean> => {
  const token = await refreshAccessToken();
  return !!token;
};

// Request interceptor
client.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    const method = config.method?.toLowerCase();
    if (method && ["post", "patch", "put", "delete"].includes(method)) {
      const token = csrfToken || (await fetchCsrfToken());
      if (token) {
        config.headers["X-CSRFToken"] = token;
      }
    }

    // ✅ Remove Content-Type for FormData (let browser set boundary)
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor: handle BOTH 401 and 403 for auth failures
client.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: AxiosError) => {
    const originalReq = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // ✅ Handle both 401 (Unauthorized) and 403 (Forbidden) for auth issues
    const status = error.response?.status;
    if ((status === 401 || status === 403) && !originalReq._retry) {
      originalReq._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((newToken: string) => {
            originalReq.headers.Authorization = `Bearer ${newToken}`;
            resolve(client(originalReq));
          });
        });
      }

      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        if (!newToken) {
          return Promise.reject(new Error("Token refresh failed"));
        }

        processRefreshQueue(newToken);
        originalReq.headers.Authorization = `Bearer ${newToken}`;
        return client(originalReq);
        
      } catch (refreshErr) {
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Login
export const login = async (identifier: string, password: string) => {
  await fetchCsrfToken();
  const res = await client.post("/users/token/", {
    identifier,
    password,
  });
  accessToken = res.data.access;
  return res.data;
};

// Logout
export const logout = async () => {
  try {
    await client.post("/users/logout/");
  } catch (e) {
    console.error("Logout error (non-critical):", e);
  } finally {
    accessToken = null;
  }
};

// Helpers
export const setAccessToken = (token: string) => { accessToken = token; };
export const isAuthenticated = (): boolean => !!accessToken;
export const getAccessToken = (): string | null => accessToken;