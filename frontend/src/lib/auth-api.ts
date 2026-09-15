import { apiRequest } from "./api";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "CUSTOMER" | "ADMIN";
  isVerified?: boolean;
}

interface AuthResponse { message: string; user: AuthUser; }

export const authApi = {
  register: (details: { name: string; email: string; phone: string; password: string }) =>
    apiRequest<AuthResponse>("/api/auth/register", { method: "POST", body: details }),
  login: (credentials: { email?: string; phone?: string; password: string }) =>
    apiRequest<AuthResponse>("/api/auth/login", { method: "POST", body: credentials }),
  logout: () => apiRequest<{ message: string }>("/api/auth/logout", { method: "POST" }),
  me: () => apiRequest<AuthResponse>("/api/auth/me", { skipUnauthorizedHandler: true }),
};
