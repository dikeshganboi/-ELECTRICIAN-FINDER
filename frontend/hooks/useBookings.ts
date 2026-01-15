import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { env } from "@/lib/env";

export interface Booking {
  _id: string;
  userId: string | { _id: string; name?: string; phone?: string };
  electricianId: string;
  serviceId?: string;
  schedule: { date: string; time: string };
  issueDescription: string;
  location: { type: "Point"; coordinates: [number, number] };
  status: "requested" | "accepted" | "arrived" | "in_progress" | "completed" | "closed" | "rejected" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  amount: number;
  electrician?: {
    _id: string;
    userId: {
      _id: string;
      name: string;
      phone: string;
    };
    skills: string[];
    baseRate: number;
    currentLocation?: { coordinates: [number, number] };
  };
  otpForStart?: string;
  otpForComplete?: string;
  platformFee?: number;
  electricianEarning?: number;
  createdAt: string;
  updatedAt: string;
}

export const useBookings = (userId?: string) => {
  return useQuery({
    queryKey: ["bookings", userId],
    queryFn: async () => {
      const response = await fetch(`${env.apiBaseUrl}/api/bookings/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch bookings");
      return response.json() as Promise<Booking[]>;
    },
    enabled: !!userId,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (booking: {
      electricianId: string;
      serviceId?: string;
      schedule: { date: string; time: string };
      issueDescription: string;
      location: { lat: number; lng: number };
      amount: number;
    }) => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("Please log in to create a booking.");
      }
      const response = await fetch(`${env.apiBaseUrl}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(booking),
      });
      if (response.status === 401) {
        throw new Error("Session expired. Please log in again.");
      }
      if (!response.ok) throw new Error("Failed to create booking");
      return response.json() as Promise<Booking>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
};

export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bookingId,
      status,
    }: {
      bookingId: string;
      status: Booking["status"];
    }) => {
      const response = await fetch(
        `${env.apiBaseUrl}/api/bookings/${bookingId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({ status }),
        }
      );
      if (!response.ok) throw new Error("Failed to update booking status");
      return response.json() as Promise<Booking>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
};

export const useMarkArrived = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ bookingId }: { bookingId: string }) => {
      const response = await fetch(`${env.apiBaseUrl}/api/bookings/${bookingId}/arrive`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to mark arrived");
      return response.json() as Promise<Booking>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bookings"] }),
  });
};

export const useStartWork = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ bookingId, otp }: { bookingId: string; otp: string }) => {
      const response = await fetch(`${env.apiBaseUrl}/api/bookings/${bookingId}/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ otp })
      });
      if (!response.ok) throw new Error("Failed to start work");
      return response.json() as Promise<Booking>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bookings"] }),
  });
};

export const useCompleteWork = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ bookingId, otp }: { bookingId: string; otp: string }) => {
      const response = await fetch(`${env.apiBaseUrl}/api/bookings/${bookingId}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ otp })
      });
      if (!response.ok) throw new Error("Failed to complete work");
      return response.json() as Promise<Booking>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bookings"] }),
  });
};

export const useCreatePaymentOrder = () => {
  return useMutation({
    mutationFn: async ({ bookingId }: { bookingId: string }) => {
      const response = await fetch(`${env.apiBaseUrl}/api/payments/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ bookingId })
      });
      if (!response.ok) throw new Error("Failed to create payment order");
      return response.json() as Promise<any>;
    }
  });
};

export const useVerifyPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string; }) => {
      const response = await fetch(`${env.apiBaseUrl}/api/payments/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error("Failed to verify payment");
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bookings"] }),
  });
};
