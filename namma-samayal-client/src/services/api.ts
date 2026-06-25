import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { clearAuthToken, getAuthToken, setAuthToken } from "@/utils/authToken";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ─── Access-token refresh on 401 (single-flight) ───────────────────────────
 * Access tokens are short-lived (15m). When a request 401s, we hit
 * /users/refresh once (using the httpOnly refresh cookie), store the new access
 * token, and retry. Concurrent 401s share the single in-flight refresh so we
 * don't fire — or rotate — multiple refresh tokens at once.
 */
let isRefreshing = false;
let waiters: Array<(token: string | null) => void> = [];

const notifyWaiters = (token: string | null) => {
  waiters.forEach((cb) => cb(token));
  waiters = [];
};

const refreshAccessToken = async (): Promise<string | null> => {
  try {
    // Plain axios (not `api`) so this call bypasses these interceptors.
    const { data } = await axios.post(
      `${baseURL}/users/refresh`,
      {},
      { withCredentials: true },
    );
    const token: string | null = data?.data?.token ?? null;
    if (token) setAuthToken(token);
    return token;
  } catch {
    clearAuthToken();
    return null;
  }
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;
    const url = original?.url ?? "";
    const isAuthRoute =
      url.includes("/users/login") ||
      url.includes("/users/refresh") ||
      url.includes("/users/register");

    if (error.response?.status === 401 && original && !original._retry && !isAuthRoute) {
      original._retry = true;

      // A refresh is already in progress — wait for its result.
      if (isRefreshing) {
        const token = await new Promise<string | null>((resolve) =>
          waiters.push(resolve),
        );
        if (!token) return Promise.reject(error);
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      }

      isRefreshing = true;
      const token = await refreshAccessToken();
      isRefreshing = false;
      notifyWaiters(token);

      if (!token) return Promise.reject(error);
      original.headers = original.headers ?? {};
      original.headers.Authorization = `Bearer ${token}`;
      return api(original);
    }

    return Promise.reject(error);
  },
);
