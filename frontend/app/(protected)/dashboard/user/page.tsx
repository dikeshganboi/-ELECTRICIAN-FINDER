"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Users, Clock, Star, Zap, LogOut, MapPin } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useBookings, useCreatePaymentOrder, useVerifyPayment } from "@/hooks/useBookings";
import { RatingModal } from "@/components/features/RatingModal";
import { env } from "@/lib/env";

export default function UserDashboard() {
  const router = useRouter();
  const { userId, logout } = useAuth();
  const { data: bookings, isLoading } = useBookings(userId || undefined);
  const createOrder = useCreatePaymentOrder();
  const verifyPayment = useVerifyPayment();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [ratingBookingId, setRatingBookingId] = useState<string | null>(null);
  const [payingBookingId, setPayingBookingId] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Detect user location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log("Location access denied");
          setUserLocation({ lat: 18.5401344, lng: 73.8557952 }); // Default to Pune
        }
      );
    }
  }, []);

  const stats = {
    total: bookings?.length || 0,
    pending: bookings?.filter((b) => b.status === "requested").length || 0,
    completed: bookings?.filter((b) => b.status === "completed").length || 0,
    cancelled: bookings?.filter((b) => b.status === "cancelled").length || 0,
    spent: bookings?.reduce((sum, b) => sum + (b.amount || 0), 0) || 0,
  };

  const loadRazorpay = () => {
    return new Promise<boolean>((resolve) => {
      if (typeof window === "undefined") return resolve(false);
      if (document.getElementById("razorpay-sdk")) return resolve(true);
      const script = document.createElement("script");
      script.id = "razorpay-sdk";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayNow = async (bookingId: string, amount: number) => {
    setPayingBookingId(bookingId);
    try {
      const ok = await loadRazorpay();
      if (!ok) throw new Error("Failed to load Razorpay");
      const order = await createOrder.mutateAsync({ bookingId });

      const rzp = new (window as any).Razorpay({
        key: env.razorpayKey,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "Electrician Finder",
        description: "Service payment",
        order_id: order.id,
        handler: async (response: any) => {
          await verifyPayment.mutateAsync({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
        },
        prefill: {},
        theme: { color: "#2563eb" },
      });

      rzp.on("payment.failed", (err: any) => {
        console.error(err);
        alert("Payment failed. Please try again.");
      });

      rzp.open();
    } catch (error) {
      alert((error as Error).message || "Payment failed");
    } finally {
      setPayingBookingId(null);
    }
  };

  const handleRateSubmit = async (rating: number, review: string) => {
    if (!ratingBookingId) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({
            bookingId: ratingBookingId,
            rating,
            comment: review,
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to submit rating");
      setRatingBookingId(null);
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <Zap className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold">ElectricianFinder</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/search">
              <Button className="bg-blue-600 hover:bg-blue-700">Find Electrician</Button>
            </Link>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Your Service Dashboard</h1>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="h-4 w-4" />
            <p>
              {userLocation
                ? `Location: ${userLocation.lat.toFixed(2)}, ${userLocation.lng.toFixed(2)}`
                : "Detecting location..."}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-600">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 text-sm font-medium">Total Bookings</p>
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-3xl font-bold">{stats.total}</h3>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-600">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 text-sm font-medium">Pending</p>
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <h3 className="text-3xl font-bold">{stats.pending}</h3>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-600">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 text-sm font-medium">Completed</p>
              <Star className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-3xl font-bold">{stats.completed}</h3>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-600">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 text-sm font-medium">Cancelled</p>
              <Zap className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="text-3xl font-bold">{stats.cancelled}</h3>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-600">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 text-sm font-medium">Total Spent</p>
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold">₹{stats.spent}</h3>
          </div>
        </div>

        {/* Bookings Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="text-2xl font-bold">Your Bookings</h2>
            <Link href="/search">
              <Button className="bg-blue-600 hover:bg-blue-700">
                New Booking
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="p-6 text-center text-gray-600">Loading bookings...</div>
          ) : bookings && bookings.length > 0 ? (
            <div className="divide-y">
              {bookings.map((booking) => (
                <div key={booking._id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg">
                        {booking.issueDescription.substring(0, 50)}...
                      </h3>
                      <p className="text-sm text-gray-600">
                        by {booking.electrician?.userId.name || "Unknown"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          booking.status === "closed"
                            ? "bg-emerald-100 text-emerald-700"
                            : booking.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : booking.status === "requested"
                            ? "bg-yellow-100 text-yellow-700"
                            : booking.status === "accepted" || booking.status === "arrived"
                            ? "bg-blue-100 text-blue-700"
                            : booking.status === "in_progress"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {booking.status.replace("_", " ").replace("closed", "Closed")}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          booking.paymentStatus === "paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {booking.paymentStatus === "paid" ? "Paid" : "Pending"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-gray-600">Date & Time</p>
                      <p className="font-semibold">
                        {new Date(booking.schedule.date).toLocaleDateString()} at{" "}
                        {booking.schedule.time}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Location</p>
                      <p className="font-semibold">
                        {booking.location.coordinates[1].toFixed(2)},
                        {booking.location.coordinates[0].toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Amount</p>
                      <p className="font-semibold text-blue-600">₹{booking.amount}</p>
                      {typeof booking.platformFee === "number" && (
                        <p className="text-xs text-gray-500">Platform fee: ₹{booking.platformFee}</p>
                      )}
                      {typeof booking.electricianEarning === "number" && (
                        <p className="text-xs text-gray-500">Electrician earns: ₹{booking.electricianEarning}</p>
                      )}
                    </div>
                  </div>

                  {/* OTP info for user */}
                  {(booking.status === "accepted" || booking.status === "arrived") && booking.otpForStart && (
                    <div className="mb-3 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      Arrival/Start OTP: <span className="font-semibold">{booking.otpForStart}</span>
                    </div>
                  )}
                  {booking.status === "in_progress" && booking.otpForComplete && (
                    <div className="mb-3 text-sm text-purple-700 bg-purple-50 border border-purple-200 rounded-lg p-3">
                      Completion OTP: <span className="font-semibold">{booking.otpForComplete}</span>
                    </div>
                  )}

                  {booking.status === "completed" && booking.paymentStatus !== "paid" && (
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={payingBookingId === booking._id || createOrder.isPending}
                      onClick={() => handlePayNow(booking._id, booking.amount)}
                    >
                      {payingBookingId === booking._id ? "Processing..." : "Pay Now"}
                    </Button>
                  )}

                  {booking.status === "closed" && booking.paymentStatus === "paid" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRatingBookingId(booking._id)}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Rate Service
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No bookings yet</p>
              <Link href="/search">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Book Your First Service
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Rating Modal */}
      {ratingBookingId && (
        <RatingModal
          bookingId={ratingBookingId}
          electricianName={
            bookings?.find((b) => b._id === ratingBookingId)?.electrician
              ?.userId.name || "Electrician"
          }
          onClose={() => setRatingBookingId(null)}
          onSubmit={handleRateSubmit}
        />
      )}
    </div>
  );
}
