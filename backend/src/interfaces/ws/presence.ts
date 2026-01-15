import { ElectricianModel } from "../../infra/db/models/electrician.model";
import { UserModel } from "../../infra/db/models/user.model";

// Update electrician availability status
export const updatePresence = async (userId: string, status: "online" | "offline" | "busy") => {
  await ElectricianModel.updateOne(
    { userId },
    { availabilityStatus: status, lastActiveAt: new Date() }
  );
};

// 🚗 UBER-STYLE: Update electrician's live GPS location
export const updateLocation = async (userId: string, lat: number, lng: number) => {
  const electrician = await ElectricianModel.findOneAndUpdate(
    { userId },
    {
      currentLocation: {
        type: "Point",
        coordinates: [lng, lat] // MongoDB uses [longitude, latitude]
      },
      lastActiveAt: new Date()
    },
    { new: true }
  ).populate('userId', 'ratingsAverage');
  
  return electrician;
};

// Get users within specified radius (for targeted broadcasting)
export const getNearbyUsers = async (lng: number, lat: number, maxDistanceMeters: number = 5000) => {
  const users = await UserModel.find({
    role: "user",
    currentLocation: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [lng, lat]
        },
        $maxDistance: maxDistanceMeters
      }
    }
  }).select('_id').limit(100); // Limit to avoid overload
  
  return users;
};
