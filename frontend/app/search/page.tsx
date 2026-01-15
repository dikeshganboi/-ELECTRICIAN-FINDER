"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Search, MapPin, Star, Zap, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoogleMap } from "@/components/features/GoogleMap";
import { useNearbyElectricians } from "@/hooks/useNearbyElectricians";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useBookings } from "@/hooks/useBookings";
import { BookingModal } from "@/components/features/BookingModal";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useBookingTracking } from "@/hooks/useBookingTracking";
import { ElectricianProfileDrawer } from "@/components/features/ElectricianProfileDrawer";
import { LiveTrackingHUD } from "@/components/features/LiveTrackingHUD";
import { CompletionModal } from "@/components/features/CompletionModal";
import { getDistance, formatDistance } from "@/lib/distance";
import { getRoutePolyline } from "@/lib/maps";

type ElectricianFromApi = {
  _id: string;
  userId: { _id: string; name: string; ratingsAverage?: number; ratingsCount?: number };
  skills?: string[];
  experienceYears?: number;
  baseRate?: number;
  availabilityStatus?: string;
  currentLocation?: { coordinates?: [number, number] };
};

export default function SearchPage() {
  const router = useRouter();
  const { userId, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    router.push("/");
  };
  
  // Default to Pune (where seeded electricians are located)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>({
    lat: 18.5401344,
    lng: 73.8557952
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "online" | "verified">("all");
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(undefined);
  const { location: geoLoc, error: geoError, status: geoStatus, requestCurrent } = useGeolocation();
  const [profileDrawer, setProfileDrawer] = useState<{ electricianId: string; electricianName: string; rating: number; reviews: number; skills: string[]; baseRate: number; distance?: number } | null>(null);
  const [bookingModal, setBookingModal] = useState<{
    electricianId: string;
    name: string;
    baseRate: number;
  } | null>(null);
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
  const [polylinePoints, setPolylinePoints] = useState<Array<{ lat: number; lng: number }>>([]);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const { status: bookingStatus, liveLocation: electricianLiveLocation, timedOut } = useBookingTracking(activeBookingId || undefined);

  const { electricians: liveElectricians, isConnected } = useNearbyElectricians({
    userId: userId || undefined,
    userLat: userLocation?.lat,
    userLng: userLocation?.lng
  });

  // Auto-request geolocation on mount
  useEffect(() => {
    if (geoStatus === "idle" || geoStatus === "prompt") {
      requestCurrent();
    }
  }, [geoStatus, requestCurrent]);

  // Update user location from geolocation
  useEffect(() => {
    if (geoLoc) {
      console.log("[Geolocation] Detected user location:", geoLoc);
      console.log("[Geolocation] Updating map center to:", geoLoc);
      setUserLocation(geoLoc);
    }
  }, [geoLoc]);

  // Debug: Log live location updates
  useEffect(() => {
    if (bookingStatus === "accepted" || bookingStatus === "in_progress") {
      console.log("[LiveTracking] Electrician live location:", electricianLiveLocation);
    }
  }, [bookingStatus, electricianLiveLocation]);

  // Fetch polyline when electrician accepted and live location available
  useEffect(() => {
    if (bookingStatus !== "accepted" && bookingStatus !== "in_progress") {
      setPolylinePoints([]);
      return;
    }
    if (!electricianLiveLocation || !userLocation) return;

    const fetchPolyline = async () => {
      const points = await getRoutePolyline(electricianLiveLocation, userLocation);
      if (points) {
        setPolylinePoints(points);
      }
    };

    fetchPolyline();
    const interval = setInterval(fetchPolyline, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [bookingStatus, electricianLiveLocation, userLocation]);

  // Handle completion
  const handleCompleteBooking = async () => {
    if (!activeBookingId) return;
    try {
      await api.updateBookingStatus(activeBookingId, { status: "completed" });
      setShowCompletionModal(false);
      setActiveBookingId(null);
    } catch (err) {
      console.error("Failed to complete booking:", err);
    }
  };

  const { data: nearbyData, isLoading, refetch } = useQuery({
    queryKey: ["nearby-electricians", userLocation?.lat, userLocation?.lng, selectedFilter, searchQuery],
    queryFn: async () => {
      if (!userLocation) return { electricians: [] } as { electricians: ElectricianFromApi[] };
      const params: Record<string, any> = {
        lat: userLocation.lat,
        lng: userLocation.lng,
        radiusKm: 5
      };
      if (selectedFilter === "online") params.status = "online";
      if (selectedFilter === "verified") params.verified = "true";
      if (searchQuery) params.skill = searchQuery;
      
      console.log("[Search] Fetching electricians with params:", params);
      const result = await api.searchNearby(params) as Promise<{ electricians: ElectricianFromApi[] }>;
      console.log("[Search] Found electricians:", result.electricians.length);
      return result;
    },
    enabled: Boolean(userLocation),
    refetchInterval: 3000, // Auto-refresh every 3 seconds
    refetchIntervalInBackground: true, // Keep refreshing even when tab is not focused
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Always refetch on mount
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Don't keep unused data in cache
  });

  const { data: services } = useQuery({
    queryKey: ["services"],
    queryFn: async () => api.getServices() as Promise<Array<{ _id: string; title: string; category: string }>>,
  });

  // Store last valid electrician list to prevent flickering
  const lastValidListRef = useRef<any[]>([]);

  const listElectricians = useMemo(() => {
    // If we have electrician data, process it
    if (nearbyData?.electricians && nearbyData.electricians.length > 0) {
      const result = nearbyData.electricians.map((e) => {
        const markerId = e.userId?._id || e._id;
        const coords = e.currentLocation?.coordinates;
        const baseLat = coords ? coords[1] : undefined;
        const baseLng = coords ? coords[0] : undefined;
        const live = liveElectricians.find((live) => live.electricianId === markerId);
        const lat = live?.lat ?? baseLat;
        const lng = live?.lng ?? baseLng;
        const distance = lat && lng && userLocation ? formatDistance(getDistance(userLocation.lat, userLocation.lng, lat, lng)) : undefined;

        return {
          id: e._id,
          name: e.userId?.name || "Electrician",
          rating: e.userId?.ratingsAverage || 0,
          reviews: e.userId?.ratingsCount || 0,
          skills: e.skills || [],
          baseRate: e.baseRate,
          lat,
          lng,
          isOnline: e.availabilityStatus === "online",
          distance,
        };
      });
      
      // Store as last valid list
      lastValidListRef.current = result;
      console.log("[DEBUG] Total electricians processed:", result.length);
      return result;
    }
    
    // If no data but we have last valid list, return it to prevent flickering
    if (lastValidListRef.current.length > 0) {
      console.log("[DEBUG] Using cached list:", lastValidListRef.current.length);
      return lastValidListRef.current;
    }
    
    // No data at all
    console.log("[DEBUG] No electricians found");
    return [];
  }, [nearbyData?.electricians, liveElectricians, userLocation]);

  const markers = listElectricians
    .filter((e) => e.lat && e.lng)
    .map((e) => ({
      id: e.id,
      lat: e.lat as number,
      lng: e.lng as number,
      title: e.name,
      icon: "/electrician-marker.png"
    }));

  console.log("[DEBUG] Markers for map:", markers.length, markers);

  const filters = [
    { key: "all" as const, label: "All" },
    { key: "online" as const, label: "Online Now" },
    { key: "verified" as const, label: "Verified" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <Zap className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">ElectricianFinder</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/user" className="text-gray-600 hover:text-gray-900 font-medium">
              Dashboard
            </Link>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleLogout}
              className="text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Search Header */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by skill, name, or area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setSelectedFilter(filter.key)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedFilter === filter.key
                      ? "bg-blue-500 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            {services && services.length > 0 && (
              <div className="w-full sm:w-64">
                <label className="block text-xs text-slate-500 mb-1">Service</label>
                <select
                  value={selectedServiceId || ""}
                  onChange={(e) => setSelectedServiceId(e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm"
                >
                  <option value="">Any service</option>
                  {services.map((s) => (
                    <option key={s._id} value={s._id}>{s.title}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-yellow-500"}`} />
            <span className="text-slate-600">
              {isConnected ? `Live tracking ${liveElectricians.length} electricians` : "Auto-refreshing every 3 seconds"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg overflow-hidden relative min-h-[40vh] lg:h-[70vh]">
            {userLocation && (
              <GoogleMap
                center={
                  (bookingStatus === "accepted" || bookingStatus === "in_progress") && electricianLiveLocation
                    ? {
                        lat: (electricianLiveLocation.lat + userLocation.lat) / 2,
                        lng: (electricianLiveLocation.lng + userLocation.lng) / 2
                      }
                    : userLocation
                }
                zoom={(bookingStatus === "accepted" || bookingStatus === "in_progress") && electricianLiveLocation ? 13 : 14}
                markers={[
                  // User location marker (always visible)
                  {
                    id: "user-location",
                    lat: userLocation.lat,
                    lng: userLocation.lng,
                    title: "Your Location",
                    icon: "/user-marker.png"
                  },
                  // Electrician markers when browsing
                  ...((bookingStatus !== "accepted" && bookingStatus !== "in_progress") ? markers : []),
                  // Electrician live location when booking accepted
                  ...((bookingStatus === "accepted" || bookingStatus === "in_progress") && electricianLiveLocation
                    ? [{
                        id: "electrician-live",
                        lat: electricianLiveLocation.lat,
                        lng: electricianLiveLocation.lng,
                        title: "Electrician is on the way",
                        icon: "/electrician-live-marker.png"
                      }]
                    : [])
                ]}
                onMarkerClick={(id) => console.log("Clicked marker:", id)}
                polylinePoints={polylinePoints}
                polylineColor="#3B82F6"
                polylineWidth={8}
                showLiveLocation={bookingStatus === "accepted" || bookingStatus === "in_progress"}
              />
            )}

            {/* Location Permission Alert */}
            {!geoLoc && geoStatus === "prompt" && (
              <div className="absolute bottom-4 left-4 right-4 bg-blue-100 border-2 border-blue-500 text-blue-900 px-4 py-3 rounded-lg text-sm z-10 shadow-lg">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-bold mb-1">📍 Allow Location Access</h4>
                    <p className="mb-2">
                      To show nearby electricians and your exact location on the map, please allow location access.
                    </p>
                    <Button size="sm" onClick={requestCurrent} className="bg-blue-600 hover:bg-blue-700">
                      Enable Location
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {(geoError || geoStatus === "denied") && (
              <div className="absolute bottom-4 left-4 right-4 bg-amber-100 border border-amber-300 text-amber-800 px-4 py-3 rounded-lg text-sm z-10">
                ⚠️ {geoError || "Location access denied. Using default location (Pune, India)."}
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="outline" onClick={requestCurrent}>
                    Retry Location
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setUserLocation({ lat: 18.5401344, lng: 73.8557952 })}>
                    Use Default
                  </Button>
                </div>
              </div>
            )}

            {/* Show current location confirmation */}
            {geoLoc && (
              <div className="absolute bottom-4 left-4 bg-green-100 border border-green-500 text-green-900 px-3 py-2 rounded-lg text-xs z-10 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">
                    📍 Your location: {geoLoc.lat.toFixed(4)}, {geoLoc.lng.toFixed(4)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Electricians List */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg p-6 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              Nearby Electricians ({listElectricians.length})
            </h2>
            <div className="space-y-4">
              {isLoading && <p className="text-sm text-slate-500">Loading nearby electricians...</p>}
              {!isLoading && listElectricians.length === 0 && (
                <p className="text-sm text-slate-500">No electricians found nearby.</p>
              )}
              {listElectricians.map((electrician) => (
                <div
                  key={electrician.id}
                  className="border border-slate-200 rounded-xl p-4 hover:border-blue-500 transition-colors"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {electrician.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold">{electrician.name}</h3>
                        {electrician.isOnline && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                            Online
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{electrician.rating.toFixed(1)}</span>
                        <span className="text-sm text-slate-500">({electrician.reviews})</span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{electrician.skills.join(", ") || "General electrician"}</p>
                      <div className="flex items-center justify-between text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {electrician.distance || "No location"}
                        </span>
                        {electrician.baseRate && (
                          <span className="font-semibold text-blue-600">₹{electrician.baseRate}/hr</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() =>
                        setProfileDrawer({
                          electricianId: electrician.id,
                          electricianName: electrician.name,
                          rating: electrician.rating,
                          reviews: electrician.reviews,
                          skills: electrician.skills,
                          baseRate: electrician.baseRate || 500,
                          distance: electrician.distance ? parseFloat(electrician.distance) : undefined,
                        })
                      }
                      variant="outline"
                      className="flex-1"
                    >
                      View Profile
                    </Button>
                    <Button
                      onClick={() =>
                        setBookingModal({
                          electricianId: electrician.id,
                          name: electrician.name,
                          baseRate: electrician.baseRate || 500,
                        })
                      }
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Book Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Drawer */}
      {profileDrawer && (
        <ElectricianProfileDrawer
          electricianId={profileDrawer.electricianId}
          electricianName={profileDrawer.electricianName}
          rating={profileDrawer.rating}
          reviews={profileDrawer.reviews}
          skills={profileDrawer.skills}
          baseRate={profileDrawer.baseRate}
          distance={profileDrawer.distance}
          onClose={() => setProfileDrawer(null)}
          onBook={() => {
            setBookingModal({
              electricianId: profileDrawer.electricianId,
              name: profileDrawer.electricianName,
              baseRate: profileDrawer.baseRate,
            });
            setProfileDrawer(null);
          }}
        />
      )}

      {/* Booking Modal */}
      {bookingModal && (
        <BookingModal
          electricianId={bookingModal.electricianId}
          electricianName={bookingModal.name}
          baseRate={bookingModal.baseRate}
          userLocation={userLocation}
          serviceId={selectedServiceId}
          onClose={() => setBookingModal(null)}
          onBookingCreated={(bookingId) => {
            setActiveBookingId(bookingId);
            setBookingModal(null);
          }}
        />
      )}

      {/* Live Tracking HUD - Only show when booking is accepted and electrician has sent location */}
      {activeBookingId && bookingStatus === "accepted" && electricianLiveLocation && (
        <LiveTrackingHUD
          status={bookingStatus}
          electricianName={bookingModal?.name || "Electrician"}
          electricianLocation={electricianLiveLocation}
          userLocation={userLocation || { lat: 0, lng: 0 }}
          timedOut={timedOut}
          onCancel={() => setActiveBookingId(null)}
          onCompleteClick={() => setShowCompletionModal(true)}
        />
      )}

      {/* Completion Modal */}
      {showCompletionModal && activeBookingId && (
        <CompletionModal
          bookingId={activeBookingId}
          electricianName={bookingModal?.name || "Electrician"}
          onCompleted={handleCompleteBooking}
          onCancel={() => setShowCompletionModal(false)}
        />
      )}
    </div>
  );
}
