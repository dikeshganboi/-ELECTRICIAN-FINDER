"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "super_admin";
}

interface AdminContextType {
  admin: AdminUser | null;
  token: string | null;
  loading: boolean;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is already logged in
    const savedToken = localStorage.getItem("adminToken");
    const savedAdmin = localStorage.getItem("admin");

    if (savedToken && savedAdmin) {
      setToken(savedToken);
      setAdmin(JSON.parse(savedAdmin));
    } else {
      router.push("/");
    }
    setLoading(false);
  }, [router]);

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    setAdmin(null);
    setToken(null);
    router.push("/");
  };

  return (
    <AdminContext.Provider value={{ admin, token, loading, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within AdminProvider");
  }
  return context;
}
