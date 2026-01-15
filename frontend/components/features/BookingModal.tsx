"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCreateBooking } from "@/hooks/useBookings";
import { Calendar, Clock, MapPin, DollarSign, X } from "lucide-react";

interface BookingModalProps {
  electricianId: string;
  electricianName: string;
  baseRate: number;
  onClose: () => void;
  userLocation: { lat: number; lng: number } | null;
  serviceId?: string;
  onBookingCreated?: (bookingId: string) => void;
}

export function BookingModal({
  electricianId,
  electricianName,
  baseRate,
  onClose,
  userLocation,
  serviceId,
  onBookingCreated,
}: BookingModalProps) {
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    issueDescription: "",
  });
  const [serviceHours, setServiceHours] = useState(1);

  const createBooking = useCreateBooking();

  const estimatedCost = baseRate * serviceHours;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) {
      alert("Please log in to book a service.");
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return;
    }

    if (!userLocation) {
      alert("Location not available");
      return;
    }

    if (!formData.date || !formData.time || !formData.issueDescription) {
      alert("Please fill all fields");
      return;
    }

    try {
      const booking = await createBooking.mutateAsync({
        electricianId,
        serviceId,
        schedule: {
          date: formData.date,
          time: formData.time,
        },
        issueDescription: formData.issueDescription,
        location: {
          lat: userLocation.lat,
          lng: userLocation.lng,
        },
        amount: estimatedCost,
      });

      alert("Booking created successfully!");
      onBookingCreated?.(booking._id);
      onClose();
      // Optionally, we could call a parent callback with booking details
    } catch (error) {
      alert("Failed to create booking: " + (error as Error).message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b flex items-center justify-between p-6">
          <div>
            <h2 className="text-2xl font-bold">Book Service</h2>
            <p className="text-gray-600 text-sm">{electricianName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Date */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              <Calendar className="inline h-4 w-4 mr-2" />
              Service Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              <Clock className="inline h-4 w-4 mr-2" />
              Preferred Time
            </label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Service Hours */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              <Clock className="inline h-4 w-4 mr-2" />
              Estimated Duration (hours)
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setServiceHours(Math.max(1, serviceHours - 1))}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                −
              </button>
              <span className="text-2xl font-bold w-12 text-center">{serviceHours}</span>
              <button
                type="button"
                onClick={() => setServiceHours(serviceHours + 1)}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>

          {/* Issue Description */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Issue Description
            </label>
            <textarea
              value={formData.issueDescription}
              onChange={(e) =>
                setFormData({ ...formData, issueDescription: e.target.value })
              }
              placeholder="Describe the electrical work needed..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              <MapPin className="inline h-4 w-4 mr-2" />
              Service Location
            </label>
            <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
              <p className="text-sm text-gray-600">
                {userLocation
                  ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`
                  : "Location not detected"}
              </p>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Base Rate/Hour</span>
                <span className="font-semibold">₹{baseRate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Duration</span>
                <span className="font-semibold">{serviceHours} hour(s)</span>
              </div>
              <div className="border-t border-blue-200 pt-2 flex justify-between">
                <span className="font-bold">Estimated Cost</span>
                <span className="font-bold text-blue-600 text-lg">
                  <DollarSign className="inline h-4 w-4" />₹{estimatedCost}
                </span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createBooking.isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {createBooking.isPending ? "Creating..." : "Confirm & Pay"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
