"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "@/lib/context/AdminContext";
import { Users, Zap, TrendingUp, Calendar, DollarSign, Activity } from "lucide-react";

interface Stats {
  totalUsers: number;
  totalElectricians: number;
  onlineElectricians: number;
  todayBookings: number;
  revenueToday: number;
  activeBookings: number;
}

export default function DashboardPage() {
  const { token } = useAdmin();
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalElectricians: 0,
    onlineElectricians: 0,
    todayBookings: 0,
    revenueToday: 0,
    activeBookings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${apiBase}/api/admin/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchStats();
      const interval = setInterval(fetchStats, 30000); // Refresh every 30s
      return () => clearInterval(interval);
    }
  }, [token]);

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-blue-500",
      change: "All time",
    },
    {
      title: "Total Electricians",
      value: stats.totalElectricians,
      icon: Zap,
      color: "bg-yellow-500",
      change: "Registered",
    },
    {
      title: "Online Now",
      value: stats.onlineElectricians,
      icon: Activity,
      color: "bg-green-500",
      change: "Live",
    },
    {
      title: "Today's Bookings",
      value: stats.todayBookings,
      icon: Calendar,
      color: "bg-purple-500",
      change: "Today",
    },
    {
      title: "Revenue Today",
      value: `₹${stats.revenueToday.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-orange-500",
      change: "Today",
    },
    {
      title: "Active Bookings",
      value: stats.activeBookings,
      icon: TrendingUp,
      color: "bg-indigo-500",
      change: "Real-time",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-600 text-sm mt-1">Welcome back! Here's your platform overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="card">
              <div className="card-body">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-600 text-sm font-medium">{card.title}</h3>
                  <div className={`${card.color} p-2 rounded-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <p className={`text-3xl font-bold ${loading ? "animate-pulse" : ""}`}>
                      {loading ? "..." : card.value}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{card.change}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h3>
            <div className="space-y-3">
              {stats.todayBookings === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  <p>No bookings today</p>
                  <p className="text-xs mt-1">Bookings will appear here once created</p>
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  <p>View all bookings in Bookings section</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pending Verifications */}
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Verifications</h3>
            <div className="space-y-3">
              <div className="py-8 text-center text-gray-500">
                <p>No pending verifications</p>
                <p className="text-xs mt-1">Check Verification section for details</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
