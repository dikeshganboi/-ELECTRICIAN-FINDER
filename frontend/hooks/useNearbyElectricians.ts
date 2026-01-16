"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";

interface ElectricianMarker {
  electricianId: string;
  lat: number;
  lng: number;
  timestamp: number;
}

interface UseNearbyElectriciansProps {
  userId?: string;
  userLat?: number;
  userLng?: number;
}

export const useNearbyElectricians = ({
  userId,
  userLat,
  userLng
}: UseNearbyElectriciansProps) => {
  const { accessToken } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [electricians, setElectricians] = useState<Map<string, ElectricianMarker>>(new Map());
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Socket.io is optional - if no userId or token, just skip real-time updates
    // The search page will still work with polling (3-second auto-refresh)
    if (!userId || !accessToken) {
      console.log("[useNearbyElectricians] No userId or token, skipping Socket.io connection");
      setIsConnected(false);
      return;
    }

    console.log("[useNearbyElectricians] Connecting Socket.io with userId:", userId);
    
    socketRef.current = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000", {
      auth: { token: accessToken },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socketRef.current.on("connect", () => {
      console.log("Socket connected for tracking nearby electricians");
      setIsConnected(true);

      // Send user location if available
      if (userLat && userLng) {
        socketRef.current?.emit("user:location:update", {
          lat: userLat,
          lng: userLng
        });
      }
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("[useNearbyElectricians] Socket connection error:", error.message);
      setIsConnected(false);
    });

    socketRef.current.on("disconnect", () => {
      setIsConnected(false);
    });

    // Listen for live electrician location updates
    socketRef.current.on("electrician:location:live", (data: {
      electricianId: string;
      lat: number;
      lng: number;
    }) => {
      console.log("[LiveTracking] Received electrician location:", data);
      setElectricians((prev) => {
        const updated = new Map(prev);
        updated.set(data.electricianId, {
          ...data,
          timestamp: Date.now()
        });
        return updated;
      });
    });

    // Listen for electrician status changes
    socketRef.current.on("electrician:status:changed", (data: {
      electricianUserId: string;
      status: string;
    }) => {
      console.log("[StatusChange] Electrician status changed:", data);
      
      // If electrician went offline, remove from map
      if (data.status === "offline") {
        setElectricians((prev) => {
          const updated = new Map(prev);
          updated.delete(data.electricianUserId);
          return updated;
        });
      }
    });
          timestamp: Date.now()
        });
        console.log("[LiveTracking] Updated electricians map, total:", updated.size);
        return updated;
      });
    });

    // Remove stale electricians (no update in 15 seconds)
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setElectricians((prev) => {
        const updated = new Map(prev);
        for (const [id, marker] of updated.entries()) {
          if (now - marker.timestamp > 15000) {
            updated.delete(id);
          }
        }
        return updated;
      });
    }, 5000);

    return () => {
      clearInterval(cleanupInterval);
      socketRef.current?.disconnect();
    };
  }, [userId, userLat, userLng, accessToken]);

  // Emit updated user location whenever it changes
  useEffect(() => {
    if (!socketRef.current || !userLat || !userLng) return;
    socketRef.current.emit("user:location:update", { lat: userLat, lng: userLng });
  }, [userLat, userLng]);

  return {
    electricians: Array.from(electricians.values()),
    isConnected
  };
};
