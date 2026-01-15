"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";

export interface IncomingBooking {
  _id: string;
  userId: {
    _id: string;
    name: string;
    phone: string;
  };
  electricianId: string;
  schedule: { date: string; time: string };
  issueDescription: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface UseBookingNotificationsProps {
  electricianId?: string;
  isOnline: boolean;
}

export const useBookingNotifications = ({
  electricianId,
  isOnline
}: UseBookingNotificationsProps) => {
  const { accessToken, role } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [pendingBookings, setPendingBookings] = useState<IncomingBooking[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!electricianId || role !== "electrician" || !accessToken) {
      return;
    }

    // Only setup if not already connected or if electricianId changed
    if (socketRef.current?.connected && (socketRef.current.auth as any)?.electricianId === electricianId) {
      return;
    }

    // Disconnect old connection
    socketRef.current?.disconnect();

    // Create new connection
    socketRef.current = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000", {
      auth: { token: accessToken }
    });

    socketRef.current.on("connect", () => {
      console.log("Socket connected for booking notifications");
      // Join the electrician room to receive bookings for this electrician
      socketRef.current?.emit("join:room", `elec:${electricianId}`);
    });

    socketRef.current.on("booking:update", (booking: IncomingBooking) => {
      console.log("Booking received:", booking);
      if (booking.status === "requested") {
        // Add new pending booking
        setPendingBookings((prev) => {
          // Avoid duplicates
          if (prev.find((b) => b._id === booking._id)) {
            return prev;
          }
          return [...prev, booking];
        });
      } else {
        // Remove booking if status changed
        setPendingBookings((prev) => prev.filter((b) => b._id !== booking._id));
      }
    });

    socketRef.current.on("error", (err) => {
      console.error("Socket error:", err);
      setError(err.message);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [electricianId, role, accessToken]);

  const removeBooking = (bookingId: string) => {
    setPendingBookings((prev) => prev.filter((b) => b._id !== bookingId));
  };

  return {
    pendingBookings,
    error,
    removeBooking,
    socketRef: socketRef.current
  };
};
