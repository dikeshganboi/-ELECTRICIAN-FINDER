"use client";

import { useEffect, useState } from "react";
import { useElectricianLocation } from "@/hooks/useElectricianLocation";
import { MapPin, Activity, ToggleLeft, ToggleRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function ElectricianDashboard() {
  const { userId, role } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const electricianId = userId || undefined;

  const { currentLocation, isTracking, error } = useElectricianLocation({
    electricianId,
    isOnline,
    intervalMs: 4000
  });

  useEffect(() => {
    if (role !== "electrician") {
      setIsOnline(false);
    }
  }, [role]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">Electrician Dashboard</h1>

          {/* Availability Toggle */}
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">Availability Status</h2>
                <p className="text-slate-600">
                  {isOnline
                    ? "You are online and visible to nearby customers"
                    : "Turn online to start receiving booking requests"}
                </p>
              </div>
              <button
                onClick={() => setIsOnline(!isOnline)}
                className={`p-4 rounded-xl transition-colors ${
                  isOnline
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-slate-300 hover:bg-slate-400"
                }`}
              >
                {isOnline ? (
                  <ToggleRight className="w-12 h-12 text-white" />
                ) : (
                  <ToggleLeft className="w-12 h-12 text-slate-600" />
                )}
              </button>
            </div>
          </div>

          {/* Location Tracking Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-6 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <MapPin className="w-6 h-6 text-blue-500" />
                <h3 className="font-semibold text-lg">Current Location</h3>
              </div>
              {currentLocation ? (
                <div className="text-sm text-slate-600 space-y-1">
                  <p>Latitude: {currentLocation.lat.toFixed(6)}</p>
                  <p>Longitude: {currentLocation.lng.toFixed(6)}</p>
                </div>
              ) : (
                <p className="text-slate-400">No location data</p>
              )}
            </div>

            <div className="p-6 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <Activity className="w-6 h-6 text-green-500" />
                <h3 className="font-semibold text-lg">Tracking Status</h3>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isTracking ? "bg-green-500 animate-pulse" : "bg-red-500"
                  }`}
                />
                <span className="text-sm font-medium">
                  {isTracking ? "Broadcasting location" : "Not tracking"}
                </span>
              </div>
              {error && (
                <p className="text-sm text-red-500 mt-2">Error: {error}</p>
              )}
            </div>
          </div>

          {/* Info Cards */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold mb-3 text-blue-900">
              How Location Tracking Works
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                <span>
                  Your location is shared with nearby customers only when you're online
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                <span>
                  GPS updates are sent every 3-5 seconds for accurate tracking
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                <span>
                  Tracking automatically stops when you go offline or complete a job
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                <span>
                  Your exact location is never stored permanently
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
