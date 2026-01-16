import { Server } from "socket.io";
import { verifyAccess } from "../../utils/jwt";
import { ElectricianModel } from "../../infra/db/models/electrician.model";
import { UserModel } from "../../infra/db/models/user.model";
import { BookingModel } from "../../infra/db/models/booking.model";
import { updatePresence, updateLocation, getNearbyUsers } from "./presence";
import { logger } from "../../config/logger";
import { emitBookingLocation } from "./emitter";
import { encodeLocation, getNeighboringCells, calculateDistance } from "../../services/geospatial.service";

export const setupSocket = (httpServer: any) => {
  const io = new Server(httpServer, { cors: { origin: "*" } });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Unauthorized"));
    try {
      const user = verifyAccess(token);
      socket.data.user = user;
      return next();
    } catch (err) {
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", async (socket) => {
    const { userId, role } = socket.data.user;

    if (role === "electrician") {
      // Get the electrician's MongoDB _id and join the room with it
      const electrician = await ElectricianModel.findOne({ userId });
      if (electrician) {
        socket.join(`elec:${electrician._id}`);
        socket.data.electricianId = electrician._id.toString();
      }
    }
    if (role === "user") socket.join(`user:${userId}`);
    
    logger.info({ userId, role, electricianId: socket.data.electricianId }, "Socket connected and joined room");

    logger.info({ userId, role }, "Socket connected");

    socket.on("set:availability", async (status: "online" | "offline" | "busy") => {
      try {
        await updatePresence(userId, status);
        
        // Broadcast status change to all connected users
        io.emit("electrician:status:changed", { 
          electricianUserId: userId, 
          status,
          timestamp: new Date()
        });
        
        logger.info({ userId, status }, `Electrician availability changed to ${status}`);
      } catch (err) {
        logger.error({ err }, "Error updating availability");
      }
    });

    socket.on("electrician:location:update", async ({ lat, lng }: { lat: number; lng: number }) => {
      if (role !== "electrician") return;
      try {
        const cell = encodeLocation(lat, lng, 8); // Geohash precision 8 (~600m cells)
        const electrician = await updateLocation(userId, lat, lng);
        if (!electrician) return;
        
        // Update geohash cell for fast spatial indexing
        await ElectricianModel.updateOne(
          { userId },
          { cell }
        );
        
        // If electrician has an active booking, stream location to that booking room
        // Use socket.data.electricianId (MongoDB _id) instead of userId (JWT user id)
        let electricianId = socket.data.electricianId;
        if (!electricianId) {
          const electrician = await ElectricianModel.findOne({ userId }).select("_id");
          if (!electrician) return;
          electricianId = electrician._id.toString();
        }
        
        const activeBooking = await BookingModel.findOne({ electricianId, status: { $in: ["accepted", "in_progress"] } }).select("_id");
        if (activeBooking) {
          console.log(`[SOCKET] Electrician ${electricianId} has active booking: ${activeBooking._id}, emitting location`);
          emitBookingLocation(activeBooking._id.toString(), { lat, lng, electricianId: userId });
        } else {
          // Debug: check what bookings exist for this electrician
          const allBookings = await BookingModel.find({ electricianId }).select("_id status");
          console.log(`[SOCKET] Electrician ${electricianId} has no active booking. All bookings:`, allBookings.map(b => ({id: b._id, status: b.status})));
        }

        // Only broadcast if electrician is online and verified+approved
        if (electrician.availabilityStatus !== "online" || !electrician.isVerified || electrician.verificationStatus !== "approved") return;

        const nearbyUsers = await getNearbyUsers(lng, lat, 5000);
        nearbyUsers.forEach((user) => {
          io.to(`user:${user._id}`).emit("electrician:location:live", {
            electricianId: userId,
            lat,
            lng,
            status: electrician.availabilityStatus,
            skills: electrician.skills,
            rating: (electrician.userId as any)?.ratingsAverage || 0,
            baseRate: electrician.baseRate,
          });
        });

        logger.info({ userId, lat, lng, nearbyUsersCount: nearbyUsers.length }, "Location broadcast");
      } catch (err) {
        logger.error({ err }, "Error updating location");
      }
    });

    socket.on("user:location:update", async ({ lat, lng }: { lat: number; lng: number }) => {
      if (role !== "user") return;
      try {
        socket.data.location = { lat, lng };
        await UserModel.updateOne(
          { _id: userId },
          {
            currentLocation: {
              type: "Point",
              coordinates: [lng, lat],
            },
          }
        );

        const electricians = await ElectricianModel.find({
          availabilityStatus: "online",
          isVerified: true,
          verificationStatus: "approved",
          currentLocation: {
            $near: {
              $geometry: { type: "Point", coordinates: [lng, lat] },
              $maxDistance: 5000,
            },
          },
        })
          .populate("userId", "name ratingsAverage ratingsCount")
          .select("userId currentLocation availabilityStatus skills baseRate");

        socket.emit("nearby:electricians", electricians);
      } catch (err) {
        logger.error({ err }, "Error updating user location");
      }
    });

    socket.on(
      "request:nearby:electricians",
      async ({ lat, lng, radius = 5000 }: { lat?: number; lng?: number; radius?: number }) => {
        const queryLat = lat ?? socket.data.location?.lat;
        const queryLng = lng ?? socket.data.location?.lng;
        if (queryLat == null || queryLng == null) return;

        const electricians = await ElectricianModel.find({
          availabilityStatus: "online",
          isVerified: true,
          verificationStatus: "approved",
          currentLocation: {
            $near: {
              $geometry: { type: "Point", coordinates: [queryLng, queryLat] },
              $maxDistance: radius,
            },
          },
        })
          .populate("userId", "name ratingsAverage ratingsCount")
          .select("userId currentLocation availabilityStatus skills baseRate");

        socket.emit("nearby:electricians", electricians);
      }
    );

    socket.on("booking:track", (bookingId: string) => {
      socket.join(`booking:${bookingId}`);
      logger.info({ bookingId, userId }, "Started tracking booking");
    });

    socket.on("stop:tracking", ({ bookingId }: { bookingId: string }) => {
      socket.leave(`booking:${bookingId}`);
    });

    socket.on("disconnect", async () => {
      if (role === "electrician") {
        setTimeout(async () => {
          await updatePresence(userId, "offline");
          io.emit("electrician:status", { userId, status: "offline" });
        }, 30000);
      }
      logger.info({ userId, role }, "Socket disconnected");
    });
  });

  return io;
};
