"use client";

import { X, Star, Zap, CheckCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface ElectricianProfileDrawerProps {
  electricianId: string;
  electricianName: string;
  rating: number;
  reviews: number;
  skills: string[];
  baseRate: number;
  distance?: number;
  onClose: () => void;
  onBook: () => void;
}

export function ElectricianProfileDrawer({
  electricianId,
  electricianName,
  rating,
  reviews,
  skills,
  baseRate,
  distance,
  onClose,
  onBook,
}: ElectricianProfileDrawerProps) {
  const { data: stats } = useQuery({
    queryKey: ["electrician-stats", electricianId],
    queryFn: async () => {
      const resp = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/electricians/${electricianId}/stats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
      if (!resp.ok) throw new Error("Failed to fetch stats");
      return resp.json() as Promise<{ completedJobs: number }>;
    },
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-end sm:items-center sm:justify-center p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-xl max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b flex items-center justify-between p-6 rounded-t-3xl sm:rounded-t-2xl">
          <h2 className="text-2xl font-bold">{electricianName}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Profile Content */}
        <div className="p-6 space-y-6">
          {/* Rating & Reviews */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="text-2xl font-bold">{rating.toFixed(1)}</span>
              <span className="text-gray-500">({reviews})</span>
            </div>
            <div className="text-sm text-gray-600">
              <p>Verified electrician</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Completed Jobs</div>
              <div className="text-2xl font-bold text-blue-600">{stats?.completedJobs || 0}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Rate/Hour</div>
              <div className="text-2xl font-bold text-green-600">₹{baseRate}</div>
            </div>
          </div>

          {/* Distance */}
          {distance && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-5 h-5 text-gray-400" />
              <span>{distance}</span>
            </div>
          )}

          {/* Skills */}
          <div>
            <h3 className="font-semibold mb-3">Skills & Services</h3>
            <div className="flex flex-wrap gap-2">
              {skills.length > 0 ? (
                skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-gray-500 text-sm">General electrical work</span>
              )}
            </div>
          </div>

          {/* Price Estimate */}
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-semibold text-amber-900">Price Estimate</span>
            </div>
            <div className="text-sm text-amber-800">
              <p>Base rate: ₹{baseRate}/hour</p>
              <p className="text-xs mt-1">Final price depends on job complexity and time</p>
            </div>
          </div>

          {/* Availability Check */}
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-700">Currently available</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
          <Button onClick={onBook} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
}
