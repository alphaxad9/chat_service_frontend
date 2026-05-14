// src/api/client.ts
import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosError,
} from "axios";

// const API_BASE_URL = "http://127.0.0.1:8000/zedvye_one";
const API_BASE_URL = "http://localhost:8000/zedvye_one";
const CHAT_API_BASE_URL = "http://127.0.0.1:8005/api";

// In-memory token storage (NO localStorage)
let accessToken: string | null = null;
let csrfToken: string | null = null;

export const client: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Chat microservice client - uses same accessToken, no CSRF required
export const chatClient: AxiosInstance = axios.create({
  baseURL: CHAT_API_BASE_URL,
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

// Request interceptor for main client
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

// Request interceptor for chat client (accessToken only, no CSRF)
chatClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    // ✅ VERY IMPORTANT for multipart uploads - let browser generate boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    
    // Chat microservice does not require CSRF tokens
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Shared response interceptor logic for token refresh
const handleAuthError = async (
  error: AxiosError,
  axiosInstance: AxiosInstance,
  originalReq: InternalAxiosRequestConfig & { _retry?: boolean }
) => {
  const status = error.response?.status;
  if ((status === 401 || status === 403) && !originalReq._retry) {
    originalReq._retry = true;

    if (isRefreshing) {
      return new Promise((resolve) => {
        refreshQueue.push((newToken: string) => {
          if (originalReq.headers) {
            originalReq.headers.Authorization = `Bearer ${newToken}`;
          }
          resolve(axiosInstance(originalReq));
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
      if (originalReq.headers) {
        originalReq.headers.Authorization = `Bearer ${newToken}`;
      }
      return axiosInstance(originalReq);
    } catch (refreshErr) {
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
  return Promise.reject(error);
};

// Response interceptor: handle BOTH 401 and 403 for auth failures (main client)
client.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: AxiosError) => {
    const originalReq = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    return handleAuthError(error, client, originalReq);
  }
);

// Response interceptor for chat client (reuses same auth refresh logic)
chatClient.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: AxiosError) => {
    const originalReq = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    return handleAuthError(error, chatClient, originalReq);
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

// ============================================
// Chat Service Functions (microservice: /api/rooms)
// ============================================

export interface CreateDirectRoomRequest {
  friend_id: string;
}

export interface Room {
  id: string;
  name?: string;
  is_direct: boolean;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

// Create a direct room/chat with a friend
export const createDirectRoom = async (
  data: CreateDirectRoomRequest
): Promise<Room> => {
  const res = await chatClient.post<Room>("/direct", data);
  return res.data;
};

// Get all rooms for the authenticated user
export const getRooms = async (): Promise<Room[]> => {
  const res = await chatClient.get<Room[]>("/");
  return res.data;
};

// Get a specific room by ID
export const getRoom = async (roomId: string): Promise<Room> => {
  const res = await chatClient.get<Room>(`/${roomId}`);
  return res.data;
};

// Update a room
export const updateRoom = async (
  roomId: string,
  data: Partial<Room>
): Promise<Room> => {
  const res = await chatClient.patch<Room>(`/${roomId}`, data);
  return res.data;
};

// Delete a room
export const deleteRoom = async (roomId: string): Promise<void> => {
  await chatClient.delete(`/${roomId}`);
};