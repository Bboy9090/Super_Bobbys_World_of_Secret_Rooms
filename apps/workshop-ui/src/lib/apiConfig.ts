const getDefaultAPIUrl = (): string => {
  try {
    if (typeof window !== "undefined") {
      const w = window as unknown as { __TAURI__?: { invoke?: () => void } };
      if (w.__TAURI__?.invoke) {
        return "http://localhost:3001";
      }
    }
  } catch {
    // Fall through to default.
  }
  return "http://localhost:3001";
};

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || getDefaultAPIUrl(),
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || "30000", 10),
};

export function getAPIUrl(endpoint: string): string {
  if (endpoint.startsWith("http")) {
    return endpoint;
  }
  const normalized = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${API_CONFIG.BASE_URL}${normalized}`;
}

export interface ApiRequestOptions extends RequestInit {
  timeout?: number;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { timeout = API_CONFIG.TIMEOUT, headers, body, ...rest } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers || {}),
  };

  const requestInit: RequestInit = {
    ...rest,
    headers: requestHeaders,
    signal: controller.signal,
  };

  if (body !== undefined) {
    if (body instanceof FormData) {
      requestInit.body = body;
      delete requestHeaders["Content-Type"];
    } else if (typeof body === "string") {
      requestInit.body = body;
    } else {
      requestInit.body = JSON.stringify(body);
    }
  }

  try {
    const response = await fetch(getAPIUrl(endpoint), requestInit);
    clearTimeout(timeoutId);

    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const message =
        typeof payload === "string"
          ? payload
          : payload?.error || payload?.message || `HTTP ${response.status}`;
      throw new Error(message);
    }

    return payload as T;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}
