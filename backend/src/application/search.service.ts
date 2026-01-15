import { ElectricianModel } from "../infra/db/models/electrician.model";

export const searchNearbyElectricians = async ({
  lat,
  lng,
  radiusKm = 5,
  skill,
  status,
  verified,
  limit = 50
}: {
  lat: number;
  lng: number;
  radiusKm?: number;
  skill?: string;
  status?: "online" | "offline" | "busy";
  verified?: boolean | string;
  limit?: number;
}) => {
  const meters = radiusKm * 1000;
  const matchSkill = skill ? { skills: skill } : {};
  // Only filter by status if explicitly provided
  const matchStatus = status ? { availabilityStatus: status } : {};
  // For regular users, ALWAYS filter for verified AND approved electricians only
  // If verified param is explicitly false, it means admin/internal call
  const matchVerified = verified === "false" ? {} : { isVerified: true, verificationStatus: "approved" };

  return ElectricianModel.find({
    ...matchStatus,
    ...matchVerified,
    ...matchSkill,
    currentLocation: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [lng, lat]
        },
        $maxDistance: meters
      }
    }
  })
    .populate("userId", "name phone ratingsAverage ratingsCount")
    .limit(limit)
    .select("userId skills experienceYears baseRate currentLocation availabilityStatus lastActiveAt isVerified verificationStatus");
};
