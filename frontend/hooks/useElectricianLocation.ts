"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";

interface LocationData {
  lat: number;
  lng: number;
}

interface UseElectricianLocationProps {
  electricianId?: string;
  isOnline: boolean;
  intervalMs?: number;
}

export const useElectricianLocation = ({
  electricianId,
  isOnline,
  intervalMs = 4000
}: UseElectricianLocationProps) => {
  const { accessToken, role } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const isConnectedRef = useRef(false); // Track connection state
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  // Initialize socket connection once
  useEffect(() => {
    if (!accessToken || role !== "electrician") return;

    // Create socket connection only if not already connected
    if (!socketRef.current) {
      socketRef.current = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000", {
        auth: { token: accessToken },
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000
      });

      socketRef.current.on("connect", () => {
        console.log("Socket connected for location tracking");
        isConnectedRef.current = true;
        setIsTracking(true);
        
        // Only emit online if electrician wants to be online
        if (isOnline && electricianId) {
          socketRef.current?.emit("set:availability", "online");
        }
      });

      socketRef.current.on("disconnect", () => {
        console.log("Socket disconnected");
        isConnectedRef.current = false;
        setIsTracking(false);
      });

      socketRef.current.on("error", (err) => {
        console.error("Socket error:", err);
        setError(err.message);
      });
    }

    // Cleanup only on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        isConnectedRef.current = false;
      }
    };
  }, [accessToken, role]); // Only reconnect if auth changes

  // Handle online/offline status changes
  useEffect(() => {
    if (!electricianId || !socketRef.current) return;

    if (isOnline) {
      // Start location tracking
      if (watchIdRef.current === null && "geolocation" in navigator) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setCurrentLocation(location);
            setError(null);

            // Emit to backend
            if (socketRef.current?.connected) {
              socketRef.current.emit("electrician:location:update", location);
            }
          },
          (err) => {
            console.error("Geolocation error:", err);
            // Don't show timeout errors to user, just retry
            if (err.code !== 3) {
              setError(err.message);
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 30000,
            maximumAge: 10000
          }
        );
      }

      // Set status to online
      if (socketRef.current.connected) {
        console.log("[Electrician] Going ONLINE");
        socketRef.current.emit("set:availability", "online");
        setIsTracking(true);
      }
    } else {
      // Stop location tracking
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }

      // Set status to offline
      if (socketRef.current?.connected) {
        console.log("[Electrician] Going OFFLINE");
        socketRef.current.emit("set:availability", "offline");
      }
      setIsTracking(false);
      setCurrentLocation(null);
    }
  }, [electricianId, isOnline]); // Only react to online status changes
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }

      // Set status to offline
      if (socketRef.current?.connected) {
        socketRef.current.emit("set:availability", "offline");
      }
      setIsTracking(false);
    }
  }, [electricianId, isOnline]); // Only react to online status changes

  return { currentLocation, isTracking, error };
};
