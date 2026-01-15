"use client";

import { Users, Search, Filter, Ban, PhoneCall, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { useAdmin } from "@/lib/context/AdminContext";

interface User {
  _id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function UsersPage() {
  const { token } = useAdmin();
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "blocked">("all");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${apiBase}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(Array.isArray(data) ? data : data.users || []);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <p className="text-gray-600 text-sm mt-1">Manage and monitor platform users</p>
      </div>

      {/* Controls */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
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
              <option value="all">All Users</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
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
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Bookings</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Spent</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No users found. Register new user at http://localhost:3000
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-900">{user.phone}</p>
                        <p className="text-gray-500">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">-</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">₹0</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        Active ({user.role})
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-blue-100 rounded-lg text-blue-600">
                          <PhoneCall className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-gray-200 rounded-lg text-gray-600">
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-red-100 rounded-lg text-red-600">
                          <Ban className="w-4 h-4" />
                        </button>
                      </div>
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
