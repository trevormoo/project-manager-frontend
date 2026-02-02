export const API = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8080";

// Storage keys
export const ACCESS_TOKEN_KEY = "pm_jwt";
export const REFRESH_TOKEN_KEY = "pm_refresh";

// Event for token refresh
export const TOKEN_REFRESH_EVENT = "auth:token-refreshed";
export const TOKEN_EXPIRED_EVENT = "auth:token-expired";

/**
 * API Error class with status code
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Get stored tokens
 */
export function getTokens() {
  if (typeof window === "undefined") return { accessToken: undefined, refreshToken: undefined };
  return {
    accessToken: localStorage.getItem(ACCESS_TOKEN_KEY) || undefined,
    refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY) || undefined,
  };
}

/**
 * Store tokens
 */
export function setTokens(accessToken: string, refreshToken: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

/**
 * Clear tokens
 */
export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * Refresh access token using refresh token
 */
let refreshPromise: Promise<string> | null = null;

export async function refreshAccessToken(): Promise<string> {
  // Prevent multiple simultaneous refresh requests
  if (refreshPromise) return refreshPromise;

  const { refreshToken } = getTokens();
  if (!refreshToken) {
    throw new ApiError(401, "No refresh token available", "NO_REFRESH_TOKEN");
  }

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        clearTokens();
        window.dispatchEvent(new CustomEvent(TOKEN_EXPIRED_EVENT));
        throw new ApiError(res.status, "Session expired", "SESSION_EXPIRED");
      }

      const data = await res.json();
      setTokens(data.accessToken, data.refreshToken);
      window.dispatchEvent(new CustomEvent(TOKEN_REFRESH_EVENT, { detail: data }));
      return data.accessToken;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Enhanced API fetch with automatic token refresh
 */
export async function apiFetch(
  path: string,
  opts: RequestInit = {},
  token?: string
): Promise<any> {
  const headers = new Headers(opts.headers || {});
  headers.set("Content-Type", headers.get("Content-Type") || "application/json");

  // Use provided token or get from storage
  const accessToken = token || getTokens().accessToken;
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const res = await fetch(`${API}${path}`, { ...opts, headers });

  // Handle token expiration
  if (res.status === 401) {
    const errorData = await res.json().catch(() => ({}));

    // If token expired, try to refresh
    if (errorData.code === "TOKEN_EXPIRED" || errorData.message?.includes("expired")) {
      try {
        const newToken = await refreshAccessToken();
        // Retry the request with new token
        headers.set("Authorization", `Bearer ${newToken}`);
        const retryRes = await fetch(`${API}${path}`, { ...opts, headers });
        if (!retryRes.ok) {
          const retryError = await retryRes.text();
          throw new ApiError(retryRes.status, retryError);
        }
        return retryRes.json();
      } catch (refreshError) {
        // Refresh failed, propagate the error
        throw refreshError;
      }
    }

    throw new ApiError(401, errorData.message || "Unauthorized", errorData.code);
  }

  if (!res.ok) {
    const errorText = await res.text();
    let errorMessage = errorText;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorJson.error || errorText;
    } catch {
      // Keep original error text
    }
    throw new ApiError(res.status, errorMessage);
  }

  // Handle empty responses
  const text = await res.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string) =>
    apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),

  logout: () =>
    apiFetch("/api/auth/logout", { method: "POST" }),

  getProfile: () =>
    apiFetch("/api/auth/profile"),

  forgotPassword: (email: string) =>
    apiFetch("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, password: string) =>
    apiFetch(`/api/auth/reset-password/${token}`, {
      method: "POST",
      body: JSON.stringify({ password }),
    }),

  verifyEmail: (token: string) =>
    apiFetch(`/api/auth/verify-email/${token}`),
};

// Projects API
export const projectsApi = {
  list: () => apiFetch("/api/projects"),

  get: (id: string) => apiFetch(`/api/projects/${id}`),

  create: (data: { name: string; description?: string }) =>
    apiFetch("/api/projects", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<{ name: string; description: string; status: string }>) =>
    apiFetch(`/api/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch(`/api/projects/${id}`, { method: "DELETE" }),

  getMembers: (id: string) =>
    apiFetch(`/api/projects/${id}/members`),

  addMember: (id: string, email: string, role?: string) =>
    apiFetch(`/api/projects/${id}/members`, {
      method: "POST",
      body: JSON.stringify({ email, role }),
    }),

  removeMember: (projectId: string, memberId: string) =>
    apiFetch(`/api/projects/${projectId}/members/${memberId}`, {
      method: "DELETE",
    }),

  getActivity: (id: string) =>
    apiFetch(`/api/projects/${id}/activity`),
};

// Tasks API
export const tasksApi = {
  list: (projectId: string) =>
    apiFetch(`/api/projects/${projectId}/tasks`),

  get: (projectId: string, taskId: string) =>
    apiFetch(`/api/projects/${projectId}/tasks/${taskId}`),

  create: (projectId: string, data: {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    dueDate?: string;
  }) =>
    apiFetch(`/api/projects/${projectId}/tasks`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (projectId: string, taskId: string, data: Partial<{
    title: string;
    description: string;
    status: string;
    priority: string;
    dueDate: string;
  }>) =>
    apiFetch(`/api/projects/${projectId}/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (projectId: string, taskId: string) =>
    apiFetch(`/api/projects/${projectId}/tasks/${taskId}`, {
      method: "DELETE",
    }),

  // Comments
  getComments: (projectId: string, taskId: string) =>
    apiFetch(`/api/projects/${projectId}/tasks/${taskId}/comments`),

  addComment: (projectId: string, taskId: string, content: string) =>
    apiFetch(`/api/projects/${projectId}/tasks/${taskId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),

  // Subtasks
  addSubtask: (projectId: string, taskId: string, title: string) =>
    apiFetch(`/api/tasks/${taskId}/subtasks`, {
      method: "POST",
      body: JSON.stringify({ title }),
    }),

  toggleSubtask: (taskId: string, subtaskId: string) =>
    apiFetch(`/api/tasks/${taskId}/subtasks/${subtaskId}/toggle`, {
      method: "PATCH",
    }),
};

// Notifications API
export const notificationsApi = {
  list: () => apiFetch("/api/notifications"),

  markAsRead: (id: string) =>
    apiFetch(`/api/notifications/${id}/read`, { method: "PATCH" }),

  markAllAsRead: () =>
    apiFetch("/api/notifications/read-all", { method: "PATCH" }),

  getUnreadCount: () =>
    apiFetch("/api/notifications/unread-count"),
};

// Activity API
export const activityApi = {
  getRecent: () => apiFetch("/api/activity"),

  getProjectActivity: (projectId: string) =>
    apiFetch(`/api/projects/${projectId}/activity`),
};
