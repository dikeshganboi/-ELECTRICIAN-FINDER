import type { Server } from "socket.io";

let ioRef: Server | null = null;

export const bindSocket = (io: Server) => { ioRef = io; };

export const emitBookingUpdate = (booking: any) => {
  if (!ioRef) return;
  // Helpful server-side log for debugging delivery to both parties
  try {
    // eslint-disable-next-line no-console
    console.log(
      JSON.stringify({
        level: 30,
        msg: "Emitting booking:update",
        bookingId: booking?._id,
        userId: booking?.userId,
        electricianId: booking?.electricianId
      })
    );
  } catch {}
  ioRef.to(`user:${booking.userId}`).emit("booking:update", booking);
  ioRef.to(`elec:${booking.electricianId}`).emit("booking:update", booking);
};

// 📍 Emit location to specific booking (after user books)
export const emitBookingLocation = (bookingId: string, location: { lat: number; lng: number; electricianId: string }) => {
  if (!ioRef) return;
  console.log(`[SOCKET] Emitting electrician:live:location to booking:${bookingId}`, location);
  ioRef.to(`booking:${bookingId}`).emit("electrician:live:location", location);
};
