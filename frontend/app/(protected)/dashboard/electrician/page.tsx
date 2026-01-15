"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useElectricianLocation } from "@/hooks/useElectricianLocation";
import { useBookingNotifications } from "@/hooks/useBookingNotifications";
import { useElectricianStats } from "@/hooks/useElectricianStats";
import { useVerification } from "@/hooks/useVerification";
import { useAuth } from "@/context/AuthContext";
import { useMarkArrived, useStartWork, useCompleteWork, Booking } from "@/hooks/useBookings";
import { MapPin, Activity, ToggleLeft, ToggleRight, Briefcase, TrendingUp, DollarSign, Clock, Star, Zap, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { env } from "@/lib/env";
import { VerificationStatus } from "@/components/features/VerificationStatus";
import { DocumentUploadForm } from "@/components/features/DocumentUploadForm";
import { ElectricianProfileMenu } from "@/components/features/ElectricianProfileMenu";
import { Electrician } from "@/types";

interface ElectricianProfileData extends Electrician {
  _id: string;
  name: string;
  phone?: string;
  profilePhoto?: string;
}

export default function ElectricianDashboard() {
  const router = useRouter();
  const { userId, role } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [electricianProfile, setElectricianProfile] = useState<ElectricianProfileData | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [activeBookings, setActiveBookings] = useState<Booking[]>([]);
  const [loadingActive, setLoadingActive] = useState(false);

  const { currentLocation, isTracking, error } = useElectricianLocation({
    electricianId: userId || undefined,
    isOnline: isOnline && (electricianProfile?.verificationStatus === "approved"),
    intervalMs: 4000
  });

  const { pendingBookings, removeBooking } = useBookingNotifications({
    electricianId: electricianProfile?._id,
    isOnline
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const hasInProgress = activeBookings.some((b) => b.status === "in_progress");

  const { completedJobs, totalEarnings, rating, ratingCount } = useElectricianStats(electricianProfile?._id);
  const { fetchForm } = useVerification();

  const markArrived = useMarkArrived();
  const startWork = useStartWork();
  const completeWork = useCompleteWork();

  const fetchActiveBookings = async () => {
    if (!electricianProfile?._id) return;
    try {
      setLoadingActive(true);
      const response = await fetch(`${env.apiBaseUrl}/api/bookings/electrician/${electricianProfile._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        }
      });
      if (!response.ok) throw new Error("Failed to load bookings");
      const data = await response.json();
      const filtered = data.filter((b: Booking) => ["accepted", "arrived", "in_progress", "completed"].includes(b.status));
      setActiveBookings(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingActive(false);
    }
  };

  // Fetch electrician profile with verification status
  const fetchProfile = async () => {
    if (!userId || role !== "electrician") return;
    
    try {
      setIsRefreshing(true);
      const token = localStorage.getItem("accessToken");
      
      if (!token) {
        setProfileError("No authentication token. Please log in again.");
        return;
      }

      const response = await fetch(`${env.apiBaseUrl}/api/electricians/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        // Token expired or invalid - redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userId");
        localStorage.removeItem("userRole");
        setProfileError("Session expired. Please log in again.");
        setTimeout(() => router.push("/login"), 2000);
        return;
      }

      if (response.ok) {
        const data = await response.json() as ElectricianProfileData;
        setElectricianProfile(data);
        setProfileError(null);
      } else {
        const error = await response.text();
        setProfileError(`Failed to load profile: ${response.status}`);
        console.error("Profile fetch error:", error);
      }
    } catch (err) {
      console.error("Failed to fetch electrician profile:", err);
      setProfileError("Failed to load profile. Check your connection.");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    const interval = setInterval(fetchProfile, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);

  }, [userId, role]);

  useEffect(() => {
    fetchActiveBookings();
    const interval = setInterval(fetchActiveBookings, 8000);
    return () => clearInterval(interval);
  }, [electricianProfile?._id]);

  useEffect(() => {
    if (role !== "electrician") {
      setIsOnline(false);
    }
  }, [role]);

  // Disable online toggle if not verified
  const handleOnlineToggle = () => {
    if (electricianProfile?.verificationStatus !== "approved") {
      alert("You must be verified before going online");
      return;
    }
    setIsOnline(!isOnline);
  };

  const handleAcceptBooking = async (bookingId: string) => {
    try {
      if (hasInProgress) {
        alert("Finish your current job before accepting a new one.");
        return;
      }
      const response = await fetch(`${env.apiBaseUrl}/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        },
        body: JSON.stringify({ status: "accepted" })
      });
      if (response.ok) {
        removeBooking(bookingId);
        setSelectedBooking(null);
        fetchActiveBookings();
      }
    } catch (err) {
      console.error("Failed to accept booking:", err);
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`${env.apiBaseUrl}/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        },
        body: JSON.stringify({ status: "rejected" })
      });
      if (response.ok) {
        removeBooking(bookingId);
        setSelectedBooking(null);
        fetchActiveBookings();
      }
    } catch (err) {
      console.error("Failed to reject booking:", err);
    }
  };

  const handleArrived = async (bookingId: string) => {
    try {
      await markArrived.mutateAsync({ bookingId });
      fetchActiveBookings();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleStartOtp = async (bookingId: string, otpHint?: string) => {
    const otp = window.prompt(`Enter start OTP${otpHint ? ` (shown to user: ${otpHint})` : ""}`);
    if (!otp) return;
    try {
      await startWork.mutateAsync({ bookingId, otp });
      fetchActiveBookings();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleCompleteOtp = async (bookingId: string, otpHint?: string) => {
    const otp = window.prompt(`Enter completion OTP${otpHint ? ` (user shows: ${otpHint})` : ""}`);
    if (!otp) return;
    try {
      await completeWork.mutateAsync({ bookingId, otp });
      fetchActiveBookings();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handlePhotoUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("photo", file);
    
    try {
      const response = await fetch(`${env.apiBaseUrl}/api/electricians/${userId}/photo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        },
        body: formData
      });

      if (response.ok) {
        await fetchProfile();
      } else {
        throw new Error("Failed to upload photo");
      }
    } catch (error) {
      console.error("Photo upload error:", error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/dashboard/electrician" className="flex items-center gap-2">
            <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            <span className="text-lg sm:text-xl font-bold">ElectricianFinder</span>
          </Link>
          <ElectricianProfileMenu
            electricianData={electricianProfile ? {
              name: electricianProfile.name,
              phone: electricianProfile.phone,
              skills: electricianProfile.skills,
              experienceYears: electricianProfile.experienceYears,
              baseRate: electricianProfile.baseRate,
              verificationStatus: electricianProfile.verificationStatus,
              profilePhoto: electricianProfile.profilePhoto
            } : null}
            onPhotoUpload={handlePhotoUpload}
          />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome, {electricianProfile?.name || "Electrician"}!</h1>
          <p className="text-gray-600">Manage your availability, jobs, and earnings</p>
        </div>

        {/* Verification Status Section */}
        {electricianProfile && (
          <div className="mb-8">
            <VerificationStatus
              status={electricianProfile.verificationStatus}
              currentVerification={electricianProfile.currentVerification}
              verificationExpiresAt={electricianProfile.verificationExpiresAt}
              onUploadClick={() => setShowUploadForm(true)}
            />
          </div>
        )}

        {/* Verification Status Warning */}
        {electricianProfile?.verificationStatus !== "approved" && (
          <div className="mb-8 flex items-start gap-4 rounded-lg bg-amber-50 p-4 border border-amber-200">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900">Verification Required</h3>
              <p className="text-sm text-amber-800 mt-1">
                You must complete verification to go online and receive bookings. Submit your documents now to get started.
              </p>
            </div>
            <button
              onClick={fetchProfile}
              disabled={isRefreshing}
              className="whitespace-nowrap px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50 transition-colors text-sm font-medium"
            >
              {isRefreshing ? "Refreshing..." : "Refresh Status"}
            </button>
          </div>
        )}

        {/* Online Status Toggle - MOST IMPORTANT */}
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Availability Status</h2>
              <p className="text-blue-100">
                {isOnline
                  ? "✅ You are ONLINE and visible to nearby customers"
                  : "⭕ You are OFFLINE. Turn online to receive booking requests"}
              </p>
              {electricianProfile?.verificationStatus !== "approved" && (
                <p className="text-sm text-blue-200 mt-2">
                  ⚠️ You must be verified to go online
                </p>
              )}
            </div>
            <button
              onClick={handleOnlineToggle}
              disabled={electricianProfile?.verificationStatus !== "approved"}
              className={`p-4 rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                isOnline
                  ? "bg-green-500 hover:bg-green-600 shadow-lg"
                  : "bg-gray-400 hover:bg-gray-500"
              }`}
            >
              {isOnline ? (
                <ToggleRight className="w-12 h-12 text-white" />
              ) : (
                <ToggleLeft className="w-12 h-12 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-green-600 text-sm font-semibold">✓ Real</span>
            </div>
            <h3 className="text-2xl font-bold mb-1">{completedJobs}</h3>
            <p className="text-gray-600 text-sm">Jobs Completed</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-green-600 text-sm font-semibold">₹{totalEarnings.toLocaleString()}</span>
            </div>
            <h3 className="text-2xl font-bold mb-1">₹{totalEarnings.toLocaleString()}</h3>
            <p className="text-gray-600 text-sm">Total Earnings</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-gray-600 text-sm font-semibold">Active</span>
            </div>
            <h3 className="text-2xl font-bold mb-1">{pendingBookings.length}</h3>
            <p className="text-gray-600 text-sm">Pending Requests</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <span className="text-gray-600 text-sm font-semibold">({ratingCount})</span>
            </div>
            <h3 className="text-2xl font-bold mb-1">{rating.toFixed(1)}</h3>
            <p className="text-gray-600 text-sm">Customer Rating</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Live Location Tracking */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Live Location</h2>
            </div>
            <div className="p-6">
              {/* Location Permission Alert */}
              {isOnline && !currentLocation && (
                <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-amber-900 mb-1">Location Permission Required</h4>
                      <p className="text-sm text-amber-800 mb-3">
                        To appear in search results, please allow location access when prompted by your browser.
                      </p>
                      <button
                        onClick={() => {
                          navigator.geolocation.getCurrentPosition(
                            () => {
                              window.location.reload();
                            },
                            (err) => {
                              alert("Location permission denied. Please enable it in your browser settings.");
                            }
                          );
                        }}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition"
                      >
                        Enable Location Now
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <MapPin className="w-5 h-5 text-blue-500" />
                    <h3 className="font-semibold">Current Location</h3>
                  </div>
                  {currentLocation ? (
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Lat:</strong> {currentLocation.lat.toFixed(6)}</p>
                      <p><strong>Lng:</strong> {currentLocation.lng.toFixed(6)}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Location not available</p>
                      <p className="text-xs text-gray-500">Toggle online to enable</p>
                    </div>
                  )}
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Activity className="w-5 h-5 text-green-500" />
                    <h3 className="font-semibold">Broadcast Status</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        isTracking && isOnline ? "bg-green-500 animate-pulse" : "bg-red-500"
                      }`}
                    />
                    <span className="text-sm font-medium">
                      {isTracking && isOnline ? "Broadcasting" : "Inactive"}
                    </span>
                  </div>
                  {error && <p className="text-sm text-red-500 mt-2">Error: {error}</p>}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3">How Location Works</h4>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                    <span>Updates sent every 3-5 seconds when online</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                    <span>Customers see your live movement on their map</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                    <span>Stops automatically when you go offline</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-orange-600 to-red-600 text-white p-6 rounded-xl">
              <h3 className="text-lg font-bold mb-2">New Requests</h3>
              <p className="text-sm opacity-90 mb-4">You have {pendingBookings.length} pending booking {pendingBookings.length === 1 ? "request" : "requests"}</p>
              <Button 
                variant="secondary" 
                className="w-full"
                onClick={() => pendingBookings.length > 0 && setSelectedBooking(pendingBookings[0])}
                disabled={pendingBookings.length === 0}
              >
                {pendingBookings.length > 0 ? "View Request" : "No Requests"}
              </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold mb-4">Today's Earnings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completed Jobs</span>
                  <span className="font-semibold">₹1,200</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pending Jobs</span>
                  <span className="font-semibold">₹800</span>
                </div>
                <div className="border-t pt-3 flex items-center justify-between font-semibold">
                  <span>Total Today</span>
                  <span className="text-green-600">₹2,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">Pending Job Requests ({pendingBookings.length})</h2>
          </div>
          <div className="divide-y">
            {pendingBookings.length === 0 ? (
              <div className="p-6 text-center text-gray-600">
                <p>No pending requests. You'll receive notifications when customers book you.</p>
              </div>
            ) : (
              pendingBookings.map((booking) => (
                <div key={booking._id} className="p-6 hover:bg-gray-50 transition cursor-pointer" onClick={() => setSelectedBooking(booking)}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{booking.userId?.name || "Customer"}</h3>
                      <p className="text-gray-600 text-sm mb-3">{booking.issueDescription}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(booking.schedule.date).toLocaleDateString()} at {booking.schedule.time}
                        </span>
                        <span className="font-semibold text-gray-900">₹{booking.amount}</span>
                      </div>
                      {booking.userId?.phone && (
                        <div className="mt-3 text-sm text-gray-600">
                          📞 {booking.userId.phone}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRejectBooking(booking._id);
                        }}
                      >
                        Reject
                      </Button>
                      <Button 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcceptBooking(booking._id);
                        }}
                      >
                        Accept
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Jobs */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="text-xl font-bold">Active Jobs</h2>
            {loadingActive && <span className="text-sm text-gray-500">Refreshing...</span>}
          </div>
          {activeBookings.length === 0 ? (
            <div className="p-6 text-gray-600">No active jobs yet.</div>
          ) : (
            <div className="divide-y">
              {activeBookings.map((job) => (
                <div key={job._id} className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Customer</p>
                      <p className="font-semibold">{(job as any).userId?.name || "Customer"}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
                      {job.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm">{job.issueDescription}</p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Scheduled</p>
                      <p className="font-semibold">{new Date(job.schedule.date).toLocaleDateString()} {job.schedule.time}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Amount</p>
                      <p className="font-semibold">₹{job.amount}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Location</p>
                      <p className="font-semibold">{job.location.coordinates[1].toFixed(2)}, {job.location.coordinates[0].toFixed(2)}</p>
                    </div>
                  </div>

                  {/* OTP hints for electrician */}
                  {(job.status === "accepted" || job.status === "arrived") && job.otpForStart && (
                    <div className="text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      Start OTP from user: <strong>{job.otpForStart}</strong>
                    </div>
                  )}
                  {job.status === "in_progress" && job.otpForComplete && (
                    <div className="text-sm text-purple-700 bg-purple-50 border border-purple-200 rounded-lg p-3">
                      Completion OTP: <strong>{job.otpForComplete}</strong>
                    </div>
                  )}

                  <div className="flex gap-3 flex-wrap">
                    {job.status === "accepted" && (
                      <Button onClick={() => handleArrived(job._id)} disabled={markArrived.isPending}>
                        Mark Arrived
                      </Button>
                    )}
                    {(job.status === "accepted" || job.status === "arrived") && (
                      <Button
                        variant="outline"
                        onClick={() => handleStartOtp(job._id, job.otpForStart)}
                        disabled={startWork.isPending}
                      >
                        Start Work (OTP)
                      </Button>
                    )}
                    {job.status === "in_progress" && (
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleCompleteOtp(job._id, job.otpForComplete)}
                        disabled={completeWork.isPending}
                      >
                        Complete Work (OTP)
                      </Button>
                    )}
                    {job.status === "completed" && (
                      <span className="text-sm text-gray-600">Waiting for customer payment...</span>
                    )}
                    {job.status === "closed" && job.paymentStatus === "paid" && (
                      <span className="text-sm text-green-700">Paid • Earnings: ₹{job.electricianEarning ?? job.amount}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Booking Modal */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6 border-b flex items-center justify-between">
                <h2 className="text-xl font-bold">New Booking Request</h2>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="text-lg font-semibold">{selectedBooking.userId?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Contact</p>
                  <p className="text-lg font-semibold">{selectedBooking.userId?.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Issue Description</p>
                  <p className="text-lg font-semibold">{selectedBooking.issueDescription}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-semibold">{new Date(selectedBooking.schedule.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="font-semibold">{selectedBooking.schedule.time}</p>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Amount</p>
                  <p className="text-3xl font-bold text-blue-600">₹{selectedBooking.amount}</p>
                </div>
              </div>
              <div className="p-6 border-t flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    handleRejectBooking(selectedBooking._id);
                  }}
                >
                  Reject
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    handleAcceptBooking(selectedBooking._id);
                  }}
                >
                  Accept Job
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Document Upload Form Modal */}
        <DocumentUploadForm
          isOpen={showUploadForm}
          onClose={() => setShowUploadForm(false)}
          onSuccess={() => {
            setShowUploadForm(false);
            // Refresh profile to show updated verification status
            if (userId) {
              fetch(`${env.apiBaseUrl}/api/electricians/${userId}`, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("accessToken")}`
                }
              })
                .then(res => res.json())
                .then(data => setElectricianProfile(data))
                .catch(err => console.error(err));
            }
          }}
        />
      </div>
    </div>
  );
}
