"use client";

import { Search, Filter, MapPin, Clock, DollarSign } from "lucide-react";
import { useState, useEffect } from "react";
import { useAdmin } from "@/lib/context/AdminContext";

interface Booking {
  _id: string;
  user?: { name: string };
  electrician?: { name: string };
  status: "pending" | "accepted" | "in_progress" | "completed" | "cancelled";
  estimatedCost?: number;
  createdAt: string;
}

export default function BookingsPage() {
  const { token } = useAdmin();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "pending" | "cancelled">("all");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, [token]);

  const fetchBookings = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/admin/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setBookings(Array.isArray(data) ? data : data.bookings || []);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: bookings.length,
    completedToday: bookings.filter(b => 
      b.status === "completed" && 
      new Date(b.createdAt).toDateString() === new Date().toDateString()
    ).length,
    revenueToday: bookings
      .filter(b => b.status === "completed" && new Date(b.createdAt).toDateString() === new Date().toDateString())
      .reduce((sum, b) => sum + (b.estimatedCost || 0), 0),
    active: bookings.filter(b => b.status === "in_progress" || b.status === "accepted").length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "in_progress":
        return "bg-blue-100 text-blue-700";
      case "accepted":
        return "bg-yellow-100 text-yellow-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Booking Management</h2>
        <p className="text-gray-600 text-sm mt-1">View and manage all bookings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="card-body text-center">
            <p className="text-gray-600 text-sm">Total Bookings</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <p className="text-gray-600 text-sm">Completed Today</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.completedToday}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <p className="text-gray-600 text-sm">Revenue Today</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">₹{stats.revenueToday}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <p className="text-gray-600 text-sm">Active Now</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">{stats.active}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Bookings</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Booking ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Electrician</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Service</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Loading bookings...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No bookings found. Create a booking to see data here.
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{booking._id.slice(-6)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{booking.user?.name || "N/A"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{booking.electrician?.name || "N/A"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">Electrical Service</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">₹{booking.estimatedCost || 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{new Date(booking.createdAt).toLocaleDateString()}</p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
