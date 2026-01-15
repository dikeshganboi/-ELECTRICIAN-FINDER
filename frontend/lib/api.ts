import { env } from "./env";

const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
};

const fetcher = async (path: string, options?: RequestInit) => {
  const token = getToken();
  const headers = { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  const res = await fetch(`${env.apiBaseUrl}${path}`, { ...options, headers: { ...headers, ...options?.headers } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const api = {
  register: (payload: any) => fetcher("/api/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload: any) => fetcher("/api/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  getNearby: (params: Record<string, any>) => fetcher(`/api/electricians/nearby?${new URLSearchParams(params)}`),
  searchNearby: (params: Record<string, any>) => {
    // Always search for verified electricians only
    const searchParams = new URLSearchParams(params);
    searchParams.set("verified", "true");
    return fetcher(`/api/search/nearby?${searchParams}`);
  },
  getServices: (params?: Record<string, any>) => fetcher(`/api/services${params ? `?${new URLSearchParams(params)}` : ""}`),
  getElectricianStats: (electricianId: string) => fetcher(`/api/electricians/${electricianId}/stats`),
  createBooking: (payload: any) => fetcher("/api/bookings", { method: "POST", body: JSON.stringify(payload) }),
  createPaymentOrder: (bookingId: string) => fetcher("/api/payments/create-order", { method: "POST", body: JSON.stringify({ bookingId }) }),
  verifyPayment: (payload: any) => fetcher("/api/payments/verify", { method: "POST", body: JSON.stringify(payload) }),
  updateBookingStatus: (bookingId: string, payload: any) => fetcher(`/api/bookings/${bookingId}/status`, { method: "PATCH", body: JSON.stringify(payload) }),
};
