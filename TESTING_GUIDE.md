# Quick Start: Testing the New Enhancements

## Prerequisites

- Two devices/browsers: one for user, one for electrician
- User account and electrician account created
- Location services enabled

## Test Scenario 1: Polyline Rendering

```
1. Login as USER in Browser A
2. Login as ELECTRICIAN in Browser B

3. USER: Create a booking with an electrician
4. ELECTRICIAN: Accept the booking within 10 seconds
5. USER: Verify on the map:
   ✓ Electrician's live location appears (pin)
   ✓ Blue line (polyline) from electrician → user location
   ✓ Line updates every 10 seconds as electrician moves

6. ELECTRICIAN: Simulate movement by going to different location
7. USER: Observe polyline recalculating and updating
```

## Test Scenario 2: Privacy Guard

```
1. USER: Create a new booking
2. While status is "requested":
   ✓ Electrician's location NOT visible on map
   ✓ No pin/marker for electrician

3. ELECTRICIAN: Accept the booking
4. USER: Immediately check map:
   ✓ Electrician's location now visible
   ✓ Blue polyline appears
   ✓ Live tracking starts

5. Optional: Book different electrician and let request timeout
6. USER: Verify:
   ✓ Location remains hidden until acceptance
   ✓ Only accepted bookings show location
```

## Test Scenario 3: Timeout Handling

```
1. USER: Create a booking
2. Do NOT accept it - wait 30+ seconds
3. USER: After 30 seconds, observe:
   ✓ Red alert banner appears at top
   ✓ Message: "Request expired or declined"
   ✓ "Close" button appears
4. Click "Close" and try booking another electrician

5. Optional: Test acceptance within 30 seconds
6. USER: Accept within 30 seconds:
   ✓ No timeout alert appears
   ✓ Status changes to "accepted"
   ✓ Location shows on map
```

## Test Scenario 4: Completion Confirmation

```
1. USER: Create booking → ELECTRICIAN: Accept
2. Wait for "accepted" state, then:

3. ELECTRICIAN: Change status to "in_progress"
   (Can be done via backend API or electrician dashboard)

4. USER: In the HUD (top bar), verify:
   ✓ "Mark Complete" button appears
   ✓ Button is green/highlighted

5. USER: Click "Mark Complete"
6. Verify modal appears:
   ✓ Green checkmark icon at top
   ✓ Heading: "Service Completed"
   ✓ Message about the electrician
   ✓ "Cancel" and "Confirm Complete" buttons

7. USER: Click "Confirm Complete"
8. Verify:
   ✓ Modal closes
   ✓ HUD updates to show "Service completed"
   ✓ Checkmark icon in HUD
   ✓ Booking status is now "completed"

9. USER: Click "Cancel" instead (in another booking):
   ✓ Modal closes without updating status
   ✓ Status remains "in_progress"
```

## End-to-End Flow (All Features)

```
TIME    ACTION                           EXPECTED RESULT
────────────────────────────────────────────────────────
T+0s    User creates booking            Booking status: "requested"
        (Location hidden)               No marker on map
                                        HUD: "Waiting for Electrician..."

T+5s    Electrician accepts             Booking status: "accepted"
                                        Electrician location appears
                                        Blue polyline renders

T+10s   Polyline updates                Route line updates
        (electrician moves)             Shows new path

T+20s   Electrician status changes      Booking status: "in_progress"
        to "in_progress"                HUD: "Service in progress..."
                                        "Mark Complete" button shows

T+30s   User clicks "Mark Complete"     Completion modal appears

T+32s   User clicks "Confirm Complete"  Status: "completed"
                                        HUD shows checkmark
                                        Modal closes

SUCCESS! All features working end-to-end.
```

## Debugging Commands

### Check Booking Status

```javascript
// In browser console
localStorage.getItem("activeBookingId");
```

### Check Socket Events

```javascript
// Monitor socket in console
window.addEventListener("message", (e) => {
  if (e.data?.type?.includes("booking")) console.log(e.data);
});
```

### Test API Endpoints

```bash
# Mark booking as completed
curl -X PATCH http://localhost:4000/api/bookings/{bookingId}/status \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'
```

## Common Issues & Solutions

| Issue                      | Cause                             | Solution                                       |
| -------------------------- | --------------------------------- | ---------------------------------------------- |
| Polyline not showing       | Electrician location not updating | Check socket events are being received         |
| Location visible too early | `showLiveLocation` prop issue     | Verify `bookingStatus` state update            |
| Timeout alert stuck        | Modal not closing                 | Manual refresh or click Close button           |
| Completion button disabled | Wrong status                      | Verify electrician set status to "in_progress" |

## Feature Completion Checklist

- [ ] Polyline rendering works
- [ ] Polyline updates every 10 seconds
- [ ] Electrician location hidden until accepted
- [ ] Timeout triggers after 30 seconds
- [ ] Timeout alert shows and can be closed
- [ ] Completion modal appears correctly
- [ ] Completion updates booking status
- [ ] All icons and text display properly
- [ ] No console errors
- [ ] Responsive on mobile devices

---

**Status**: All enhancements implemented and ready for testing!
