const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message: string, readonly status: number, readonly code?: string, readonly email?: string) {
    super(message);
    this.name = "ApiError";
  }
}

let unauthorizedHandler: (() => void) | null = null;

export function onUnauthorized(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

type ApiOptions = Omit<RequestInit, "body"> & { body?: unknown; skipUnauthorizedHandler?: boolean };

export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { body, skipUnauthorizedHandler, ...init } = options;
  const headers = new Headers(init.headers);
  if (body !== undefined) headers.set("Content-Type", "application/json");
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      credentials: "include",
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError("Could not reach CafeQ. Please try again.", 0);
  }

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401 && !skipUnauthorizedHandler) unauthorizedHandler?.();
    const errorPayload = payload && typeof payload === "object" ? payload as Record<string, unknown> : null;
    const backendMessage = typeof errorPayload?.message === "string" ? errorPayload.message : null;
    throw new ApiError(
      backendMessage || `Request failed (${response.status}).`,
      response.status,
      typeof errorPayload?.code === "string" ? errorPayload.code : undefined,
      typeof errorPayload?.email === "string" ? errorPayload.email : undefined,
    );
  }
  return payload as T;
}
