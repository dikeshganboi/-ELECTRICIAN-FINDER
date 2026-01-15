export async function getEtaMinutes(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key) return null;
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&mode=driving&key=${key}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const leg = data?.routes?.[0]?.legs?.[0];
    const seconds = leg?.duration?.value;
    return seconds ? Math.round(seconds / 60) : null;
  } catch {
    return null;
  }
}

export async function getRoutePolyline(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<Array<{ lat: number; lng: number }> | null> {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key) return null;
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&mode=driving&key=${key}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const points = data?.routes?.[0]?.overview_polyline?.points;
    if (!points) return null;
    return decodePolyline(points);
  } catch {
    return null;
  }
}

function decodePolyline(encoded: string): Array<{ lat: number; lng: number }> {
  const points: Array<{ lat: number; lng: number }> = [];
  let index = 0,
    lat = 0,
    lng = 0;

  while (index < encoded.length) {
    let result = 0,
      shift = 0;
    let b;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = (result & 1) ? ~(result >> 1) : result >> 1;
    lat += dlat;

    result = 0;
    shift = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = (result & 1) ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }

  return points;
}
