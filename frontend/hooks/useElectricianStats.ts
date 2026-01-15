"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { env } from "@/lib/env";

interface ElectricianStats {
  completedJobs: number;
  totalEarnings: number;
  rating: number;
  ratingCount: number;
  loading: boolean;
  error: string | null;
}

export const useElectricianStats = (electricianId?: string) => {
  const { accessToken } = useAuth();
  const [stats, setStats] = useState<ElectricianStats>({
    completedJobs: 0,
    totalEarnings: 0,
    rating: 0,
    ratingCount: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!electricianId || !accessToken) {
      setStats(prev => ({ ...prev, loading: false }));
      return;
    }

    const fetchStats = async () => {
      try {
        // Fetch electrician profile for rating
        const profileResponse = await fetch(
          `${env.apiBaseUrl}/api/electricians/${electricianId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        );

        if (!profileResponse.ok) throw new Error("Failed to fetch profile");
        const profile = await profileResponse.json();

        // Fetch completed bookings for count and earnings
        const bookingsResponse = await fetch(
          `${env.apiBaseUrl}/api/bookings/electrician/${electricianId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        );

        if (!bookingsResponse.ok) throw new Error("Failed to fetch bookings");
        const bookings = await bookingsResponse.json();

        // Calculate stats from completed bookings
        const completedBookings = Array.isArray(bookings)
          ? bookings.filter((b: any) => b.status === "completed")
          : [];
        
        const totalEarnings = completedBookings.reduce(
          (sum: number, booking: any) => sum + (booking.amount || 0),
          0
        );

        setStats({
          completedJobs: completedBookings.length,
          totalEarnings,
          rating: profile.userId?.ratingsAverage || 0,
          ratingCount: profile.userId?.ratingsCount || 0,
          loading: false,
          error: null
        });
      } catch (err) {
        console.error("Failed to fetch electrician stats:", err);
        setStats(prev => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : "Failed to load stats"
        }));
      }
    };

    fetchStats();
  }, [electricianId, accessToken]);

  return stats;
};
