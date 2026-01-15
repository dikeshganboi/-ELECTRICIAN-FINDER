"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";

export type BookingStatus = "requested" | "accepted" | "arrived" | "in_progress" | "completed" | "closed" | "rejected" | "cancelled";

export function useBookingTracking(bookingId?: string) {
  const { accessToken } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [status, setStatus] = useState<BookingStatus | null>(null);
  const [liveLocation, setLiveLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!bookingId || !accessToken) return;

    console.log("[useBookingTracking] Initializing with bookingId:", bookingId);

    socketRef.current = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000", {
      auth: { token: accessToken },
    });

    socketRef.current.on("connect", () => {
      console.log("[useBookingTracking] Socket connected, emitting booking:track");
      socketRef.current?.emit("booking:track", bookingId);
    });

    socketRef.current.on("booking:update", (booking: any) => {
      if (booking._id !== bookingId) return;
      console.log("[useBookingTracking] Booking update:", booking.status);
      setStatus(booking.status);

      // Clear timeout if acceptance received
      if (booking.status === "accepted" && timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Handle rejection or cancellation
      if (booking.status === "rejected" || booking.status === "cancelled") {
        setTimedOut(true);
      }
    });

    socketRef.current.on("electrician:live:location", (payload: { lat: number; lng: number; electricianId: string }) => {
      console.log("[useBookingTracking] Received electrician location:", payload);
      setLiveLocation({ lat: payload.lat, lng: payload.lng });
    });

    // Set 30s timeout for acceptance
    timeoutRef.current = setTimeout(() => {
      setTimedOut(true);
      socketRef.current?.emit("booking:cancel", { bookingId, reason: "request_timeout" });
    }, 30000);

    return () => {
      console.log("[useBookingTracking] Cleanup - disconnecting socket");
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      socketRef.current?.emit("stop:tracking", { bookingId });
      socketRef.current?.disconnect();
    };
  }, [bookingId, accessToken]);

  return { status, liveLocation, timedOut } as const;
}
