"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "@/lib/context/AdminContext";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Download,
  Search,
  Filter,
  AlertCircle,
} from "lucide-react";

interface ElectricianDocument {
  type: "aadhaar" | "certificate" | "photo" | "license";
  url: string;
  verified?: boolean;
}

interface Electrician {
  _id: string;
  name: string;
  phone: string;
  email: string;
  skills: string[];
  rating: number;
  documents: ElectricianDocument[];
  verificationStatus: "pending" | "approved" | "rejected";
  createdAt: string;
  rejectionReason?: string;
}

export default function VerificationPage() {
  const { token } = useAdmin();
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
  const [electricians, setElectricians] = useState<Electrician[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">(
    "pending"
  );
  const [selectedElectrician, setSelectedElectrician] = useState<Electrician | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchElectricians();
  }, [token]);

  const fetchElectricians = async () => {
    try {
      const response = await fetch(
        `${apiBase}/api/admin/electricians?status=${filterStatus}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setElectricians(Array.isArray(data) ? data : data.electricians || []);
      }
    } catch (error) {
      console.error("Failed to fetch electricians:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (electricianId: string) => {
    try {
      const response = await fetch(
        `${apiBase}/api/admin/electricians/${electricianId}/approve`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setElectricians((prev) =>
          prev.map((e) =>
            e._id === electricianId ? { ...e, verificationStatus: "approved" } : e
          )
        );
        setShowModal(false);
      }
    } catch (error) {
      console.error("Failed to approve:", error);
    }
  };

  const handleReject = async (electricianId: string) => {
    try {
      const response = await fetch(
        `${apiBase}/api/admin/electricians/${electricianId}/reject`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason: rejectionReason }),
        }
      );

      if (response.ok) {
        setElectricians((prev) =>
          prev.map((e) =>
            e._id === electricianId
              ? { ...e, verificationStatus: "rejected", rejectionReason }
              : e
          )
        );
        setShowModal(false);
        setRejectionReason("");
      }
    } catch (error) {
      console.error("Failed to reject:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const filtered = electricians.filter(
    (e) =>
      (filterStatus === "all" || e.verificationStatus === filterStatus) &&
      (e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.phone.includes(searchTerm) ||
        e.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Electrician Verification</h2>
        <p className="text-gray-600 text-sm mt-1">Review and verify electrician documents</p>
      </div>

      {/* Controls */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2">
              <Filter className="w-5 h-5 text-gray-400 mt-2" />
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value as any);
                  setLoading(true);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                  Electrician
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                  Skills
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No electricians found
                  </td>
                </tr>
              ) : (
                filtered.map((elec) => (
                  <tr key={elec._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{elec.name}</p>
                        <p className="text-xs text-gray-500">ID: {elec._id.slice(0, 8)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-900">{elec.phone}</p>
                        <p className="text-gray-500">{elec.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1 flex-wrap">
                        {elec.skills.slice(0, 2).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                        {elec.skills.length > 2 && (
                          <span className="px-2 py-1 text-xs text-gray-600">
                            +{elec.skills.length - 2} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-gray-900">{elec.rating}</span>
                        <span className="text-yellow-500">⭐</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(elec.verificationStatus)}`}>
                        {elec.verificationStatus.charAt(0).toUpperCase() +
                          elec.verificationStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedElectrician(elec);
                            setShowModal(true);
                          }}
                          className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
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

      {/* Detail Modal */}
      {showModal && selectedElectrician && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                {selectedElectrician.name}
              </h3>
              <p className="text-sm text-gray-500">{selectedElectrician.email}</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Documents */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedElectrician.documents.map((doc, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900 capitalize">{doc.type}</p>
                        {doc.verified ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-yellow-600" />
                        )}
                      </div>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                      >
                        <Download className="w-4 h-4" />
                        View Document
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rejection Reason */}
              {selectedElectrician.verificationStatus === "rejected" && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-red-700 mb-1">Rejection Reason:</p>
                  <p className="text-sm text-red-600">{selectedElectrician.rejectionReason}</p>
                </div>
              )}

              {/* Rejection Reason Input */}
              {selectedElectrician.verificationStatus === "pending" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason (if needed)
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Specify why you're rejecting this verification..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>

              {selectedElectrician.verificationStatus === "pending" && (
                <>
                  <button
                    onClick={() => handleReject(selectedElectrician._id)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(selectedElectrician._id)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Approve
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
