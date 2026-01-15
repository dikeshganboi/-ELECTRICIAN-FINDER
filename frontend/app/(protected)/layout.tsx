"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { role } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [router]);

  // Redirect to role-appropriate dashboard
  useEffect(() => {
    if (ready && role) {
      const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
      
      // If on generic /dashboard, redirect to role-specific dashboard
      if (currentPath === "/dashboard") {
        const destination = role === "electrician" 
          ? "/dashboard/electrician" 
          : "/dashboard/user";
        router.replace(destination);
      }
    }
  }, [ready, role, router]);

  if (!ready) return null;
  return <>{children}</>;
}
