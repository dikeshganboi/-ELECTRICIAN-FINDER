import type { Metadata } from "next";
import "@/styles/globals.css";
import { AdminProvider } from "@/lib/context/AdminContext";

export const metadata: Metadata = {
  title: "Electrician Finder - Admin Panel",
  description: "Admin panel for managing electricians and bookings",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <AdminProvider>{children}</AdminProvider>
      </body>
    </html>
  );
}
