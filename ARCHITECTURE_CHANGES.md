# Architectural Changes Summary

## Components Modified

### 1. GoogleMap Component (`frontend/components/features/GoogleMap.tsx`)

**New Props:**

- `polylinePoints?: Array<{ lat: number; lng: number }>` - Array of coordinates for the route
- `polylineColor?: string` - Color of the polyline (default: #3b82f6)
- `showLiveLocation?: boolean` - Controls visibility of electrician marker

**New Refs:**

- `polylineRef` - Reference to the Google Maps Polyline object

**New Effect Hook:**

```typescript
// Renders and updates polyline based on polylinePoints prop
// Cleans up old polyline when component unmounts or points change
```

**Modified Effect Hook (markers):**

```typescript
// Added filter: skip "electrician" marker if showLiveLocation is false
// Prevents electrician location from displaying during "requested" state
```

### 2. LiveTrackingHUD Component (`frontend/components/features/LiveTrackingHUD.tsx`)

**New Props:**

- `timedOut?: boolean` - Shows timeout alert when true
- `onCompleteClick?: () => void` - Callback when "Mark Complete" is clicked

**New UI States:**

1. **Timeout Alert** - Red banner with alert icon when request expires
2. **In Progress** - Additional state handling for "in_progress" status
3. **Completed** - Green checkmark when service is completed

**New Render Branches:**

```typescript
if (timedOut) {
  /* Show red timeout alert */
}
if (status === "completed") {
  /* Show green checkmark */
}
```

### 3. CompletionModal Component (`frontend/components/features/CompletionModal.tsx`)

**Props Changed:**

```typescript
// Before:
interface CompletionModalProps {
  electricianName: string;
  amount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

// After:
interface CompletionModalProps {
  bookingId: string;
  electricianName: string;
  onCompleted: () => void;
  onCancel: () => void;
}
```

**Changes:**

- Removed amount display (simplified UI)
- Added bookingId (for API reference)
- Changed `onConfirm` to `onCompleted` (clearer intent)

### 4. Search Page (`frontend/app/search/page.tsx`)

**New Imports:**

```typescript
import { CompletionModal } from "@/components/features/CompletionModal";
import { getRoutePolyline } from "@/lib/maps";
```

**New State Variables:**

```typescript
const [polylinePoints, setPolylinePoints] = useState<
  Array<{ lat: number; lng: number }>
>([]);
const [showCompletionModal, setShowCompletionModal] = useState(false);
```

**New Destructuring from useBookingTracking:**

```typescript
const { status: bookingStatus, liveLocation: electricianLiveLocation, timedOut } = useBookingTracking(...);
//                                                                                   ^^^^^^^^
//                                                                        (new property)
```

**New Effects:**

1. **Polyline Fetcher** - Fetches route every 10 seconds when booking is accepted
2. **Geolocation Update** - Updates userLocation from GPS
3. **Handler Function** - `handleCompleteBooking()` for API call

**Modified Markers Array:**

```typescript
// Now includes conditional electrician marker
markers={[
  ...markers,
  ...((bookingStatus === "accepted" || bookingStatus === "in_progress") && electricianLiveLocation
    ? [{ id: "electrician", lat, lng, title, icon }]
    : [])
]}
```

**Modified GoogleMap Props:**

```typescript
polylinePoints={polylinePoints}
polylineColor="#3b82f6"
showLiveLocation={bookingStatus === "accepted" || bookingStatus === "in_progress"}
```

**New Modals Rendered:**

- `CompletionModal` - Shows when user clicks "Mark Complete"

---

## Hook Changes

### useBookingTracking (`frontend/hooks/useBookingTracking.ts`)

**New State:**

```typescript
const [timedOut, setTimedOut] = useState(false);
const timeoutRef = useRef<NodeJS.Timeout | null>(null);
```

**New Logic:**

1. Starts 30-second timeout on booking creation
2. Clears timeout if booking is accepted
3. Sets `timedOut` flag if timeout expires
4. Emits `booking:cancel` event on timeout

**Return Value:**

```typescript
return { status, liveLocation, timedOut } as const; // Added timedOut
```

---

## API Changes

### Frontend API Client (`frontend/lib/api.ts`)

**New Method:**

```typescript
updateBookingStatus: (bookingId: string, payload: any) =>
  fetcher(`/api/bookings/${bookingId}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
```

### Backend Routes (`backend/src/interfaces/http/booking.routes.ts`)

**Changed:**

```typescript
// Before:
router.patch("/:id/status", auth(["electrician", "admin"]), ...)

// After:
router.patch("/:id/status", auth(["user", "electrician", "admin"]), ...)
```

**Added Authorization Check:**

```typescript
// Users can only complete their own bookings
if (
  requester.role === "user" &&
  booking.userId.toString() !== requester.userId
) {
  return res.status(403).json({ message: "Forbidden" });
}
```

---

## Utility Functions

### Maps Utility (`frontend/lib/maps.ts`)

**Already Existed:**

- `getEtaMinutes()` - Calculates ETA
- `getRoutePolyline()` - Fetches route coordinates
- `decodePolyline()` - Decodes Google's polyline format

**No Changes Made** - All functions were already implemented

---

## Data Flow Diagram

```
Booking Created
    ↓
useBookingTracking Hook
├─ Starts 30s timeout
├─ Listens for booking:update events
├─ Listens for electrician:live:location events
└─ Returns: { status, liveLocation, timedOut }
    ↓
Search Page Component
├─ Receives state from hook
├─ Shows timeout alert if timedOut = true
├─ Fetches polyline if status = "accepted"
├─ Passes showLiveLocation = true if status = "accepted" or "in_progress"
└─ Shows completion modal if user clicks "Mark Complete"
    ↓
GoogleMap Component
├─ Filters markers based on showLiveLocation
├─ Renders polyline if polylinePoints provided
└─ Updates both every 10 seconds
    ↓
API Call
├─ PATCH /api/bookings/:id/status
├─ Body: { status: "completed" }
└─ Returns: Updated booking object
    ↓
Backend
├─ Validates user authorization
├─ Updates booking status in DB
└─ Emits booking:update event via WebSocket
    ↓
Frontend
├─ Receives update event
├─ Updates component state
└─ Shows "Service completed" status
```

---

## Type Safety

### New/Modified Types

**GoogleMap Props:**

```typescript
polylinePoints?: Array<{ lat: number; lng: number }>;
polylineColor?: string;
showLiveLocation?: boolean;
```

**BookingStatus:**

```typescript
export type BookingStatus =
  | "requested"
  | "accepted"
  | "rejected"
  | "in_progress"
  | "completed"
  | "cancelled";
// Already supported "completed" - no changes needed
```

**CompletionModal Props:**

```typescript
interface CompletionModalProps {
  bookingId: string;
  electricianName: string;
  onCompleted: () => void;
  onCancel: () => void;
}
```

---

## Performance Considerations

### Polyline Refresh Rate

- **Interval**: 10 seconds
- **Reason**: Balance between accuracy and API calls
- **Cost**: ~360 API calls per hour per active booking

### Google Maps Polyline

- **Memory**: Polyline object cached in ref
- **Cleanup**: Old polyline removed before creating new one
- **Performance**: Efficient because Google handles rendering

### Socket Events

- **Already Optimized**: WebSocket used, not polling
- **Timeout**: 30 seconds (prevents stale bookings)

### Marker Visibility

- **No Performance Impact**: Simple boolean filter on existing array
- **Re-renders**: Only when `showLiveLocation` prop changes

---

## Browser Compatibility

All features use standard Web APIs:

- ✅ localStorage (for token)
- ✅ setTimeout/setInterval (for timeout)
- ✅ fetch API (for HTTP requests)
- ✅ WebSocket (socket.io)
- ✅ Google Maps JS SDK

**Minimum Requirements:**

- ES2015+ JavaScript support
- Modern browser (Chrome, Firefox, Safari, Edge)
- Google Maps API Key

---

## Testing Considerations

### Unit Test Suggestions

1. **useBookingTracking Hook**

   - Test timeout trigger after 30s
   - Test timeout cleared on acceptance
   - Test timedOut state management

2. **GoogleMap Component**

   - Test polyline renders when points provided
   - Test electrician marker hidden when showLiveLocation=false
   - Test marker visible when showLiveLocation=true

3. **LiveTrackingHUD Component**
   - Test timeout alert renders when timedOut=true
   - Test "Mark Complete" button renders for in_progress
   - Test callbacks are called correctly

### Integration Test Suggestions

1. End-to-end booking flow with all features
2. Timeout cancellation behavior
3. Polyline updates as location changes
4. Completion status update flow

---

## Rollback Plan

If issues arise, changes can be reverted:

1. **Remove Polyline**: Delete polylinePoints/color props from GoogleMap
2. **Remove Timeout**: Remove timedOut state from useBookingTracking
3. **Remove Completion Modal**: Delete CompletionModal render condition
4. **Revert Auth**: Change booking routes back to ["electrician", "admin"]

Each feature is independently implemented and can be disabled without affecting others.

---

**Last Updated**: Implementation Complete
**Status**: Ready for Testing
