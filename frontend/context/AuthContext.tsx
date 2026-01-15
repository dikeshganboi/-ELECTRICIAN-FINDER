"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Role = "user" | "electrician" | "admin";

interface AuthState {
  userId: string | null;
  role: Role | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setTokens: (access: string, refresh?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

const parseJwt = (token: string) => {
  try {
    const [, payload] = token.split(".");
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as { userId?: string; role?: Role; exp?: number };
  } catch (err) {
    console.error("Failed to decode token", err);
    return {};
  }
};

const isTokenExpired = (token: string): boolean => {
  try {
    const payload = parseJwt(token);
    if (!payload.exp) return true;
    // Check if token expires in less than 5 minutes
    return Date.now() >= payload.exp * 1000 - 5 * 60 * 1000;
  } catch {
    return true;
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedAccess = localStorage.getItem("accessToken");
    const storedRefresh = localStorage.getItem("refreshToken");
    if (storedAccess) {
      // Check if token is expired
      if (isTokenExpired(storedAccess)) {
        console.log("[Auth] Token expired, logging out");
        logout();
        return;
      }
      
      const payload = parseJwt(storedAccess);
      setUserId(payload.userId || null);
      setRole(payload.role || null);
      setAccessToken(storedAccess);
      setRefreshToken(storedRefresh);
    }
    
    // Check token expiration every 5 minutes
    const interval = setInterval(() => {
      const currentToken = localStorage.getItem("accessToken");
      if (currentToken && isTokenExpired(currentToken)) {
        console.log("[Auth] Token expired during session, logging out");
        logout();
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
    
    return () => clearInterval(interval);
  }, []);

  const setTokens = (access: string, refresh?: string) => {
    const payload = parseJwt(access);
    setUserId(payload.userId || null);
    setRole(payload.role || null);
    setAccessToken(access);
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", access);
      if (refresh) {
        localStorage.setItem("refreshToken", refresh);
        setRefreshToken(refresh);
      }
    }
  };

  const logout = () => {
    setUserId(null);
    setRole(null);
    setAccessToken(null);
    setRefreshToken(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  };

  const value = useMemo(
    () => ({ userId, role, accessToken, refreshToken, isAuthenticated: Boolean(userId), setTokens, logout }),
    [userId, role, accessToken, refreshToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
