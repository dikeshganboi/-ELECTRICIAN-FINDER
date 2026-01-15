"use client";

import { Clock, MapPin, AlertCircle, X, CheckCircle, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getEtaMinutes } from "@/lib/maps";
import { getDistance, formatDistance } from "@/lib/distance";

interface LiveTrackingHUDProps {
  status: "requested" | "accepted" | "in_progress" | "completed";
  electricianName: string;
  electricianLocation?: { lat: number; lng: number };
  userLocation: { lat: number; lng: number };
  timedOut?: boolean;
  onCancel?: () => void;
  onCompleteClick?: () => void;
}

export function LiveTrackingHUD({
  status,
  electricianName,
  electricianLocation,
  userLocation,
  timedOut,
  onCancel,
  onCompleteClick,
}: LiveTrackingHUDProps) {
  const [eta, setEta] = useState<number | null>(null);
  const [distance, setDistance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status !== "accepted" && status !== "in_progress") return;
    if (!electricianLocation) return;

    const fetchEta = async () => {
      setLoading(true);
      const minutes = await getEtaMinutes(electricianLocation, userLocation);
      setEta(minutes);
      
      // Calculate distance
      const distanceKm = getDistance(
        electricianLocation.lat,
        electricianLocation.lng,
        userLocation.lat,
        userLocation.lng
      );
      setDistance(formatDistance(distanceKm));
      setLoading(false);
    };

    fetchEta();
    const interval = setInterval(fetchEta, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [status, electricianLocation, userLocation]);

  if (timedOut) {
    return (
      <div className="fixed bottom-6 left-6 right-6 z-50 bg-red-50 border-2 border-red-300 rounded-2xl shadow-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span className="font-semibold">Request expired or declined</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={onCancel}
            className="text-red-600 hover:bg-red-100"
          >
            Close
          </Button>
        </div>
      </div>
    );
  }

  // Instamart-style bottom card for active tracking (ONLY show when accepted or in progress)
  if ((status === "accepted" || status === "in_progress") && electricianLocation) {
    return (
      <div className="fixed bottom-6 left-6 right-6 z-50 bg-white rounded-2xl shadow-2xl border-2 border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-green-500 h-1.5"></div>
        <div className="p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {status === "in_progress" ? "Service in Progress" : "Electrician on the way"}
              </h3>
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-800">{electricianName}</span> is {status === "in_progress" ? "working on your issue" : "coming to your location"}
              </p>
            </div>
            {eta !== null && (
              <div className="flex-shrink-0 ml-4">
                <div className="bg-green-500 text-white rounded-2xl px-6 py-3 text-center shadow-lg">
                  <div className="text-3xl font-bold">{loading ? "..." : eta}</div>
                  <div className="text-xs font-medium opacity-90">mins</div>
                </div>
              </div>
            )}
          </div>

          {/* Distance & Live Tracking Indicator */}
          {distance && status === "accepted" && (
            <div className="flex items-center gap-2 mb-4 bg-blue-50 px-3 py-2 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-900">
                📍 {distance} away • Live tracking active
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {status === "in_progress" && (
              <Button
                onClick={onCompleteClick}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl shadow-lg"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Complete Service
              </Button>
            )}
            <Button
              variant="outline"
              className="px-6 py-3 rounded-xl border-2 hover:bg-gray-50"
            >
              <Phone className="w-5 h-5" />
            </Button>
            {status === "accepted" && onCancel && (
              <Button
                variant="outline"
                onClick={onCancel}
                className="px-6 py-3 rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Simple status bar for other states
  return (
    <div className="fixed top-0 left-0 right-0 z-30 bg-white border-b shadow-lg p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {status === "requested" && (
          <div className="flex items-center gap-2 text-blue-600">
            <div className="animate-spin">
              <Clock className="w-5 h-5" />
            </div>
            <span className="font-semibold">Waiting for {electricianName} to accept...</span>
          </div>
        )}
        {status === "completed" && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Service completed! Thank you.</span>
          </div>
        )}
        {status === "requested" && onCancel && (
          <Button size="sm" variant="outline" onClick={onCancel} className="text-red-600 hover:bg-red-50 ml-auto">
            <X className="w-4 h-4 mr-1" />
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
