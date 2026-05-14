"use client";

import type { CurrentUserResponse, LoginResponse } from "@/lib/api";

export type UserRole = CurrentUserResponse["role"];

export const ROLE_ROUTES: Record<UserRole, "/learner" | "/reviewer" | "/admin"> = {
  LEARNER: "/learner",
  REVIEWER: "/reviewer",
  ADMIN: "/admin"
};

export const DEMO_CREDENTIALS = [
  {
    email: "learner@example.com",
    password: "SecurePass123!",
    role: "Learner",
    href: "/learner"
  },
  {
    email: "reviewer@example.com",
    password: "SecurePass123!",
    role: "Reviewer",
    href: "/reviewer"
  },
  {
    email: "admin.user@example.com",
    password: "SecurePass123!",
    role: "Administrator",
    href: "/admin"
  }
] as const;

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "user";

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
}

function clearCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
}

export function storeAuthSession(tokens: LoginResponse, user: CurrentUserResponse) {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));

  setCookie("auth_access_token", tokens.access_token, tokens.expires_in);
  setCookie("auth_refresh_token", tokens.refresh_token, 60 * 60 * 24 * 30);
  setCookie("auth_user_role", user.role, 60 * 60 * 24 * 30);
}

export function clearAuthSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  clearCookie("auth_access_token");
  clearCookie("auth_refresh_token");
  clearCookie("auth_user_role");
}

export function getStoredAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getStoredRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getStoredUser(): CurrentUserResponse | null {
  const rawUser = localStorage.getItem(USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as CurrentUserResponse;
  } catch {
    clearAuthSession();
    return null;
  }
}
