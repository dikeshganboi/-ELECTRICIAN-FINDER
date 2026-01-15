"use client";

import { AlertTriangle, Search, Filter, MessageSquare, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";

interface Dispute {
  _id: string;
  bookingId: string;
  userName: string;
  electricianName: string;
  reason: string;
  status: "open" | "resolved" | "rejected";
  createdAt: string;
  priority: "low" | "medium" | "high";
}

export default function DisputesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "open" | "resolved" | "rejected">("open");

  // Mock data
  const disputes: Dispute[] = [];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dispute Management</h2>
        <p className="text-gray-600 text-sm mt-1">Handle customer and electrician disputes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="card-body text-center">
            <p className="text-gray-600 text-sm">Open Disputes</p>
            <p className="text-3xl font-bold text-red-600 mt-2">0</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <p className="text-gray-600 text-sm">Resolved This Month</p>
            <p className="text-3xl font-bold text-green-600 mt-2">0</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <p className="text-gray-600 text-sm">Avg Resolution Time</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">0h</p>
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
                placeholder="Search disputes..."
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
              <option value="all">All Disputes</option>
              <option value="open">Open</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {disputes.length === 0 && (
        <div className="card text-center py-12">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No disputes found</p>
        </div>
      )}

      {/* Table */}
      {disputes.length > 0 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Booking</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">User</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {disputes.map((dispute) => (
                  <tr key={dispute._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{dispute.bookingId}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{dispute.userName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 max-w-xs truncate">{dispute.reason}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(dispute.priority)}`}>
                        {dispute.priority.charAt(0).toUpperCase() + dispute.priority.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(dispute.status)}`}>
                        {dispute.status.charAt(0).toUpperCase() + dispute.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-2 hover:bg-blue-100 rounded-lg text-blue-600">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
