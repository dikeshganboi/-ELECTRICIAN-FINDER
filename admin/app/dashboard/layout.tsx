"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/lib/context/AdminContext";
import {
  LogOut,
  Menu,
  X,
  BarChart3,
  Users,
  CheckCircle,
  ShoppingBag,
  Settings,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

const Sidebar = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (v: boolean) => void }) => {
  const menuItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: BarChart3,
      badge: undefined,
    },
    {
      label: "Electricians",
      href: "/dashboard/electricians",
      icon: Users,
      badge: undefined,
    },
    {
      label: "Verification",
      href: "/dashboard/verification",
      icon: CheckCircle,
      badge: undefined,
    },
    {
      label: "Users",
      href: "/dashboard/users",
      icon: Users,
      badge: undefined,
    },
    {
      label: "Bookings",
      href: "/dashboard/bookings",
      icon: ShoppingBag,
      badge: undefined,
    },
    {
      label: "Disputes",
      href: "/dashboard/disputes",
      icon: AlertTriangle,
      badge: undefined,
    },
    {
      label: "Analytics",
      href: "/dashboard/analytics",
      icon: TrendingUp,
      badge: undefined,
    },
    {
      label: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      badge: undefined,
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-64 bg-gray-900 text-white transform transition-transform duration-300 z-30 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:relative`}
      >
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold text-blue-400">Electrician</h2>
          <p className="text-xs text-gray-400">Admin Panel</p>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors relative"
              >
                <Icon className="w-5 h-5" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { admin, logout } = useAdmin();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Admin Dashboard</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{admin?.name}</p>
              <p className="text-xs text-gray-500">{admin?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
