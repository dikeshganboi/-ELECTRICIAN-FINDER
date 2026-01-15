"use client";

import { useEffect, useRef } from "react";

interface MapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    id: string;
    lat: number;
    lng: number;
    title?: string;
    icon?: string;
  }>;
  onMarkerClick?: (id: string) => void;
  className?: string;
  polylinePoints?: Array<{ lat: number; lng: number }>;
  polylineColor?: string;
  polylineWidth?: number;
  showLiveLocation?: boolean; // Hide electrician location until accepted
}

let mapScriptLoadingPromise: Promise<void> | null = null;

const loadGoogleMapsScript = (apiKey: string): Promise<void> => {
  // Return cached promise if already loading
  if (mapScriptLoadingPromise) {
    return mapScriptLoadingPromise;
  }

  mapScriptLoadingPromise = new Promise((resolve, reject) => {
    // Check if script is already loaded
    if (window.google?.maps?.Map) {
      resolve();
      return;
    }

    // Check if script tag already exists
    const existingScript = document.querySelector(
      `script[src*="maps.googleapis.com/maps/api/js"]`
    );
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve());
      existingScript.addEventListener("error", () => reject());
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      resolve();
    };

    script.onerror = () => {
      mapScriptLoadingPromise = null;
      reject(new Error("Failed to load Google Maps script"));
    };

    document.head.appendChild(script);
  });

  return mapScriptLoadingPromise;
};

export const GoogleMap = ({
  center,
  zoom = 14,
  markers = [],
  onMarkerClick,
  className = "w-full h-full",
  polylinePoints = [],
  polylineColor = "#3B82F6",
  polylineWidth = 6,
  showLiveLocation = true
}: MapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  // Initialize map with deduplication
  useEffect(() => {
    const initMap = async () => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        console.error("❌ Google Maps API key not found in environment variables");
        console.error("Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file");
        return;
      }

      console.log("🗺️ Initializing Google Maps with API key:", apiKey.substring(0, 10) + "...");

      try {
        // Load script (deduplicated - only one promise globally)
        await loadGoogleMapsScript(apiKey);

        // Create map only once
        if (mapRef.current && !googleMapRef.current && window.google?.maps?.Map) {
          googleMapRef.current = new window.google.maps.Map(mapRef.current, {
            center,
            zoom,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            gestureHandling: 'greedy',
            zoomControl: true,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
              }
            ]
          });
        }
      } catch (error) {
        console.error("Error initializing Google Map:", error);
      }
    };

    initMap();
  }, []);

  // Update center when changed
  useEffect(() => {
    if (googleMapRef.current) {
      console.log("[GoogleMap] Updating center to:", center);
      googleMapRef.current.setCenter(center);
      // Also pan to the new center for smooth transition
      googleMapRef.current.panTo(center);
    }
  }, [center.lat, center.lng]);

  // Update markers
  useEffect(() => {
    if (!googleMapRef.current || !window.google?.maps?.Marker) return;

    const currentMarkerIds = new Set(
      markers
        .filter((m) => showLiveLocation || m.id !== "electrician") // Hide electrician marker until accepted
        .map((m) => m.id)
    );
    const existingMarkerIds = new Set(markersRef.current.keys());

    // Remove old markers
    for (const id of existingMarkerIds) {
      if (!currentMarkerIds.has(id)) {
        markersRef.current.get(id)?.setMap(null);
        markersRef.current.delete(id);
      }
    }

    // Add/update markers
    markers.forEach((marker) => {
      // Skip electrician marker if location should be hidden
      if (!showLiveLocation && marker.id === "electrician") return;

      const existing = markersRef.current.get(marker.id);

      if (existing) {
        // Update position
        existing.setPosition({ lat: marker.lat, lng: marker.lng });
        if (marker.title) existing.setTitle(marker.title);
      } else {
        // Create marker icon config
        let iconConfig: string | google.maps.Icon | google.maps.Symbol | undefined = marker.icon || undefined;
        
        // Use colored pins if custom icon not available
        if (marker.id === "user-location") {
          iconConfig = {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: "#1E40AF",
            fillOpacity: 1,
            strokeColor: "#FFFFFF",
            strokeWeight: 3,
            anchor: new window.google.maps.Point(0, 0)
          } as any;
        } else if (marker.id === "electrician-live") {
          iconConfig = {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: "#10B981",
            fillOpacity: 1,
            strokeColor: "#FFFFFF",
            strokeWeight: 3,
            anchor: new window.google.maps.Point(0, 0)
          } as any;
        }

        // Create new marker
        const googleMarker = new window.google.maps.Marker({
          position: { lat: marker.lat, lng: marker.lng },
          map: googleMapRef.current,
          title: marker.title,
          icon: iconConfig,
          label: marker.id === "user-location" ? {
            text: "HOME",
            color: "#FFFFFF",
            fontSize: "12px",
            fontWeight: "bold"
          } : marker.id === "electrician-live" ? {
            text: "TECH",
            color: "#FFFFFF",
            fontSize: "12px",
            fontWeight: "bold"
          } : undefined,
          animation: window.google.maps.Animation.DROP
        });

        if (onMarkerClick) {
          googleMarker.addListener("click", () => {
            onMarkerClick(marker.id);
          });
        }

        markersRef.current.set(marker.id, googleMarker);
      }
    });
  }, [markers, onMarkerClick, showLiveLocation]);

  // Render polyline
  useEffect(() => {
    if (!googleMapRef.current || !window.google?.maps?.Polyline) return;

    // Remove old polyline
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    // Create new polyline if points provided
    if (polylinePoints.length > 1) {
      polylineRef.current = new window.google.maps.Polyline({
        path: polylinePoints,
        geodesic: true,
        strokeColor: polylineColor,
        strokeOpacity: 1.0,
        strokeWeight: polylineWidth,
        map: googleMapRef.current
      });
    }
  }, [polylinePoints, polylineColor, polylineWidth]);

  return <div ref={mapRef} className={className} />;
};
