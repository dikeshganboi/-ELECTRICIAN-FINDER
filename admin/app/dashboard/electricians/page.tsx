"use client";

import { Users, Search, Filter, Phone, MapPin, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { useAdmin } from "@/lib/context/AdminContext";

interface Electrician {
  _id: string;
  name: string;
  phone: string;
  email: string;
  location?: string;
  skills: string[];
  rating: number;
  isVerified: boolean;
  availabilityStatus: string;
  verificationStatus: string;
}

export default function ElectriciansPage() {
  const { token } = useAdmin();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterVerified, setFilterVerified] = useState<"all" | "verified" | "unverified">("all");
  const [electricians, setElectricians] = useState<Electrician[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchElectricians();
  }, [token]);

  const fetchElectricians = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/admin/electricians?status=all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setElectricians(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch electricians:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: electricians.length,
    online: electricians.filter(e => e.availabilityStatus === "online").length,
    verified: electricians.filter(e => e.isVerified).length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Electrician Management</h2>
        <p className="text-gray-600 text-sm mt-1">View and manage electricians on the platform</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="card-body text-center">
            <p className="text-gray-600 text-sm">Total Electricians</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <p className="text-gray-600 text-sm">Online Now</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.online}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <p className="text-gray-600 text-sm">Verified</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.verified}</p>
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
                placeholder="Search electricians..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterVerified}
              onChange={(e) => setFilterVerified(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Electricians</option>
              <option value="verified">Verified Only</option>
              <option value="unverified">Unverified Only</option>
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
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Electrician</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Location</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Jobs</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Loading electricians...
                  </td>
                </tr>
              ) : electricians.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No electricians found. Register new electrician at http://localhost:3000
                  </td>
                </tr>
              ) : (
                electricians.map((elec) => (
                  <tr key={elec._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{elec.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                        <Phone className="w-4 h-4" />
                        {elec.phone}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        {elec.location || "Not set"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium">{elec.rating || 0}⭐</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        elec.isVerified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {elec.isVerified ? "Verified" : elec.verificationStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium">-</span>
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
