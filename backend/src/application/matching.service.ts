import { ElectricianModel } from "../infra/db/models/electrician.model";
import {
  encodeLocation,
  getNeighboringCells,
  findNearbyInCells,
  calculateDistance,
  estimateETA,
} from "../services/geospatial.service";
import { logger } from "../config/logger";

export interface MatchedElectrician {
  _id: string;
  userId: string;
  name: string;
  rating: number;
  distance: number;
  eta: string;
  location: { lat: number; lng: number };
}

/**
 * Fast electrician matching using geohash cells (Uber/Ola style)
 * 1. Query center cell + neighbors → fast DB lookup
 * 2. Filter by availability + radius
 * 3. Sort by distance + rating
 * 4. Calculate ETA
 */
export const findNearbyElectricians = async (
  userLat: number,
  userLng: number,
  radiusKm: number = 5,
  limit: number = 10
): Promise<MatchedElectrician[]> => {
  try {
    const centerCell = encodeLocation(userLat, userLng, 8);
    const neighborCells = getNeighboringCells(centerCell);

    // Fast cell-based query (indexed by MongoDB)
    logger.info({ centerCell, neighborCells: neighborCells.length }, "Cell-based search");

    const electricians = await ElectricianModel.find({
      cell: { $in: neighborCells },
      availabilityStatus: "online",
    })
      .populate<{ userId: { _id: string; name: string; ratingsAverage: number } }>("userId", "name ratingsAverage")
      .select("userId currentLocation availabilityStatus baseRate")
      .limit(limit * 2); // Get more, then filter by radius

    // Filter by exact radius and calculate distance
    const nearby = findNearbyInCells(
      electricians.map((e) => ({
        _id: e._id.toString(),
        userId: e.userId?._id?.toString() || "",
        name: e.userId?.name || "Electrician",
        rating: e.userId?.ratingsAverage || 0,
        lat: e.currentLocation?.coordinates?.[1] || 0,
        lng: e.currentLocation?.coordinates?.[0] || 0,
      })),
      userLat,
      userLng,
      radiusKm
    );

    // Calculate ETA for each
    const matched: MatchedElectrician[] = nearby.slice(0, limit).map((e) => ({
      _id: e._id,
      userId: e.userId,
      name: e.name,
      rating: e.rating,
      distance: e.distance,
      eta: estimateETA(e.distance).formatted,
      location: { lat: e.lat, lng: e.lng },
    }));

    logger.info(
      { found: matched.length, radius: radiusKm },
      "Matched electricians"
    );
    return matched;
  } catch (err) {
    logger.error({ err }, "Error finding nearby electricians");
    return [];
  }
};

/**
 * Find single closest electrician for instant matching
 * Used when user requests immediately available driver
 */
export const findClosestElectrician = async (
  userLat: number,
  userLng: number
): Promise<MatchedElectrician | null> => {
  const matches = await findNearbyElectricians(userLat, userLng, 10, 1);
  return matches.length > 0 ? matches[0] : null;
};

/**
 * Batch match electricians to pending requests
 * Useful for background job to match old requests
 */
export const batchMatchElectricians = async (
  requests: Array<{ userId: string; lat: number; lng: number; requestId: string }>
): Promise<Map<string, MatchedElectrician>> => {
  const matches = new Map<string, MatchedElectrician>();

  for (const request of requests) {
    const match = await findClosestElectrician(request.lat, request.lng);
    if (match) {
      matches.set(request.requestId, match);
    }
  }

  return matches;
};
