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
    apiRequest<{ message: string; requiresEmailVerification: boolean; email: string }>("/api/auth/register", { method: "POST", body: details }),
  verifyOtp: (details: { email: string; otp: string }) =>
    apiRequest<AuthResponse>("/api/auth/verify-otp", { method: "POST", body: details }),
  resendOtp: (details: { email: string }) =>
    apiRequest<{ message: string }>("/api/auth/resend-otp", { method: "POST", body: details }),
  login: (credentials: { email?: string; phone?: string; password: string }) =>
    apiRequest<AuthResponse>("/api/auth/login", { method: "POST", body: credentials }),
  googleLogin: (credential: string) =>
    apiRequest<AuthResponse>("/api/auth/google", { method: "POST", body: { credential } }),
  logout: () => apiRequest<{ message: string }>("/api/auth/logout", { method: "POST" }),
  me: () => apiRequest<AuthResponse>("/api/auth/me", { skipUnauthorizedHandler: true }),
};
