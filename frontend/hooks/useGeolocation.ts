"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Location = { lat: number; lng: number };
type Status = "idle" | "granted" | "prompt" | "denied" | "error";

const isSecureContext = () => {
  if (typeof window === "undefined") return false;
  const { protocol, hostname } = window.location;
  return protocol === "https:" || hostname === "localhost" || hostname === "127.0.0.1";
};

export function useGeolocation() {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const requestedRef = useRef(false);

  const requestCurrent = useCallback(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setStatus("error");
      setError("Geolocation not supported on this device/browser.");
      return;
    }

    if (!isSecureContext()) {
      setStatus("error");
      setError("Location requires HTTPS or localhost.");
      return;
    }

    setError(null);
    requestedRef.current = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setStatus("granted");
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        const code = (err && (err as any).code) || 0;
        if (code === 1) setStatus("denied"); // PERMISSION_DENIED
        else setStatus("error");
        setError("Location access denied. Using default location.");
        // Do not throw; caller can fallback to default
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  }, []);

  useEffect(() => {
    // Try to prefetch permission state
    if (typeof navigator !== "undefined" && (navigator as any).permissions) {
      (navigator as any).permissions
        .query({ name: "geolocation" })
        .then((p: { state: Status }) => {
          if (p.state === "granted") {
            setStatus("granted");
            if (!requestedRef.current) requestCurrent();
          } else if (p.state === "prompt") {
            setStatus("prompt");
          } else if (p.state === "denied") {
            setStatus("denied");
            setError("Location access denied. Using default location.");
          }
        })
        .catch(() => {
          // Permissions API not available; remain idle until explicit request
        });
    }
  }, [requestCurrent]);

  return { location, error, status, requestCurrent } as const;
}
