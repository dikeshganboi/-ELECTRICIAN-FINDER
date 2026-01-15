"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function AuthNavbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in by checking tokens
    const token = localStorage.getItem("accessToken");
    const role = localStorage.getItem("userRole");
    
    setIsLoggedIn(!!token);
    setUserRole(role);
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    setIsLoggedIn(false);
    setUserRole(null);
    router.push("/");
  };

  if (isLoading) {
    return null;
  }

  if (!isLoggedIn) {
    return (
      <nav className="hidden md:flex gap-8 items-center">
        <Link href="#services" className="text-gray-600 hover:text-gray-900 font-medium">
          Services
        </Link>
        <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900 font-medium">
          How It Works
        </Link>
        <Link href="/login">
          <Button variant="ghost" className="text-gray-600">
            Login
          </Button>
        </Link>
        <Link href="/register">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Sign Up
          </Button>
        </Link>
      </nav>
    );
  }

  return (
    <nav className="hidden md:flex gap-8 items-center">
      <Link href="#services" className="text-gray-600 hover:text-gray-900 font-medium">
        Services
      </Link>
      <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900 font-medium">
        How It Works
      </Link>
      <Link 
        href={userRole === "electrician" ? "/dashboard/electrician" : "/dashboard/user"}
      >
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          {userRole === "electrician" ? "My Earnings" : "My Bookings"}
        </Button>
      </Link>
      <Button
        variant="ghost"
        onClick={handleLogout}
        className="text-red-600 hover:bg-red-50"
      >
        <LogOut className="h-4 w-4 mr-2" />
        Logout
      </Button>
    </nav>
  );
}
