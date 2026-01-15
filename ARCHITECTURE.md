# Electrician Finder Platform - Architecture Document

## System Architecture

### High-Level Design

```
┌─────────────────┐       HTTPS        ┌──────────────────┐
│   Next.js Web   │◄─────────────────►│  Express API     │
│   (Vercel)      │                    │  (AWS/Render)    │
└─────────────────┘                    └──────────────────┘
        │                                       │
        │ Socket.IO                            │
        │                                       │
        ▼                                       ▼
┌─────────────────┐                    ┌──────────────────┐
│  WebSocket      │◄──────────────────►│  MongoDB Atlas   │
│  Real-time      │                    │  (GeoJSON Index) │
└─────────────────┘                    └──────────────────┘
                                               │
                                               ▼
                                       ┌──────────────────┐
                                       │  Razorpay API    │
                                       │  (Payments)      │
                                       └──────────────────┘
```

### Component Layers (Backend)

**Clean Architecture Pattern**:

```
┌───────────────────────────────────────────────────────┐
│  Interfaces Layer (HTTP Routes, Socket Handlers)      │
│  - auth.routes.ts, booking.routes.ts                  │
│  - socket.ts (presence, events)                       │
│  - validators (Zod schemas)                           │
└───────────────────────────────────────────────────────┘
                        ▼
┌───────────────────────────────────────────────────────┐
│  Application Layer (Use Cases / Business Logic)       │
│  - auth.service.ts (register, login)                  │
│  - booking.service.ts (create, update status)         │
│  - payment.service.ts (create order, verify)          │
└───────────────────────────────────────────────────────┘
                        ▼
┌───────────────────────────────────────────────────────┐
│  Domain Layer (Entities, Types)                       │
│  - user.ts, electrician.ts, booking.ts                │
│  - Pure business objects                              │
└───────────────────────────────────────────────────────┘
                        ▼
┌───────────────────────────────────────────────────────┐
│  Infrastructure Layer (DB, External Services)         │
│  - mongoose models                                    │
│  - razorpay client                                    │
│  - cloudinary (images)                                │
└───────────────────────────────────────────────────────┘
```

### Data Flow

**User Booking Flow**:

1. User searches nearby electricians → Frontend calls `/api/electricians/nearby?lat=X&lng=Y`
2. Backend queries MongoDB with GeoJSON `$near` → Returns list
3. User selects electrician, creates booking → `POST /api/bookings`
4. Backend creates booking (status: requested), emits Socket.IO event to electrician
5. User initiates payment → `POST /api/payments/create-order`
6. Backend creates Razorpay order, returns order ID
7. Frontend shows Razorpay checkout
8. On success, frontend calls `/api/payments/verify` with signature
9. Backend verifies HMAC, marks payment as paid, updates booking status to accepted
10. Socket.IO emits `booking:update` to both user & electrician

**Electrician Presence**:

1. Electrician logs in, connects Socket.IO with JWT
2. Emits `set:availability` with status (online/offline/busy)
3. Backend updates MongoDB, broadcasts status change
4. Users see real-time availability updates

### Security Model

**Authentication**:

- JWT access token (15m TTL) stored in localStorage
- JWT refresh token (7d TTL) stored in httpOnly cookie (future)
- Access token sent in `Authorization: Bearer <token>` header

**Authorization**:

- Middleware checks JWT, extracts userId + role
- Role-based guards: `auth(["user"])`, `auth(["electrician", "admin"])`
- Admin routes protected with admin-only middleware

**Input Validation**:

- Zod schemas validate all request bodies/queries
- Mongoose schema validation as secondary layer
- Input sanitization to prevent NoSQL injection

**Rate Limiting**:

- Auth routes: 5 requests/minute per IP
- General API: 100 requests/minute per IP
- Future: per-user rate limits using Redis

### Database Design

**GeoJSON Indexing**:

```javascript
// Electrician schema
currentLocation: {
  type: { type: String, enum: ["Point"], default: "Point" },
  coordinates: { type: [Number], index: "2dsphere" }
}
// Query
Electrician.find({
  currentLocation: {
    $near: {
      $geometry: { type: "Point", coordinates: [lng, lat] },
      $maxDistance: 5000 // meters
    }
  }
})
```

**Indexes**:

- `User`: email (unique), phone (unique), currentLocation (2dsphere)
- `Electrician`: userId (unique), availabilityStatus, currentLocation (2dsphere)
- `Booking`: userId, electricianId, status
- `Review`: bookingId (unique), electricianId + createdAt (compound)
- `Payment`: razorpayOrderId (unique), bookingId

### Real-time Architecture

**Socket.IO Design**:

- **Namespaces**: Single namespace `/` (default)
- **Rooms**:
  - `user:{userId}` for each user
  - `elec:{userId}` for each electrician
- **Events**:
  - `set:availability` (electrician → server)
  - `booking:update` (server → user/electrician)
  - `electrician:status` (server → all users)

**Connection Flow**:

1. Client connects with `socket.handshake.auth.token = accessToken`
2. Middleware verifies JWT, attaches `socket.data.user`
3. Socket joins role-specific room
4. On disconnect, mark electrician offline after timeout

### Scalability Plan

**Current (MVP)**:

- Single Express instance
- MongoDB Atlas M10 cluster
- Socket.IO in-memory adapter

**Phase 2 (10K users)**:

- Horizontal scaling: 3+ Express instances behind load balancer
- Redis for session store, rate limiting, Socket.IO adapter
- MongoDB sharding by location (future)

**Phase 3 (100K+ users)**:

- Microservices: Auth, Booking, Payment as separate services
- API Gateway (Kong/AWS API Gateway)
- Event-driven: RabbitMQ/SQS for async tasks (notifications, emails)
- Read replicas for MongoDB
- CDN for static assets (Cloudinary + Cloudflare)
- ElasticSearch for advanced search (filters, rankings)

### Payment Flow (Razorpay)

1. User confirms booking → Backend creates Razorpay order
2. Backend stores order in Payment collection (status: created)
3. Frontend receives order ID, shows Razorpay checkout
4. User completes payment in Razorpay UI
5. Razorpay redirects with `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`
6. Frontend calls `/api/payments/verify`
7. Backend computes HMAC: `sha256(order_id + "|" + payment_id, secret)`
8. If signature matches, mark payment as paid, update booking status
9. Emit Socket.IO event for real-time update

**Idempotency**: razorpayOrderId is unique; duplicate verify calls are safe.

### Monitoring Strategy

**Logging**:

- Pino JSON logs → CloudWatch Logs / Logtail
- Structured fields: userId, bookingId, latency, statusCode
- Error logs with stack traces

**Metrics**:

- Request rate (req/sec)
- Latency (P50, P95, P99)
- Error rate (% 5xx)
- Booking conversion rate (search → create → payment)
- Electrician acceptance rate

**Alerting**:

- Slack/PagerDuty on:
  - Error rate > 1%
  - Latency P95 > 500ms
  - Payment failure rate > 5%

**Dashboard**:

- Admin panel shows: total users, electricians, bookings, revenue
- Grafana dashboards for real-time metrics
- MongoDB Atlas charts for geo distribution

---

## Frontend Architecture

**Next.js App Router**:

```
app/
├── (auth)/          # Route group (no layout nesting)
│   ├── login/
│   └── register/
├── (protected)/     # Guarded routes
│   └── dashboard/
├── search/          # Public search
├── layout.tsx       # Root layout
├── page.tsx         # Landing page
└── providers.tsx    # React Query provider
```

**State Management**:

- React Query for server state (bookings, electricians)
- Context API for auth state (future)
- localStorage for access/refresh tokens (temp; move to httpOnly cookie)

**API Client**:

- Centralized `lib/api.ts` with fetch wrapper
- Auto-injects Bearer token from localStorage
- React Query hooks wrap API calls for caching, refetching

**UI Components**:

- ShadCN/Radix UI primitives (Button, Dialog, Card)
- Tailwind for styling
- Mobile-first responsive design

---

## Deployment Architecture

**Frontend (Vercel)**:

- Auto-deploy on push to `main`
- Edge network for low latency
- Environment variables via Vercel dashboard

**Backend (AWS EC2 / Render)**:

- PM2 process manager for zero-downtime restarts
- NGINX reverse proxy (optional)
- HTTPS via Let's Encrypt / ALB

**Database (MongoDB Atlas)**:

- M10 cluster (production)
- Auto-scaling, backups enabled
- Connection pooling (default Mongoose settings)

**CI/CD Pipeline**:

```yaml
# .github/workflows/backend.yml
on: push to main
jobs:
  - lint, test
  - build TypeScript
  - deploy to Render/EC2 (via SSH or API)
```

---

## Security Checklist

- [x] JWT with short TTL (15m)
- [x] Bcrypt password hashing
- [x] Helmet for HTTP headers
- [x] CORS allowlist
- [x] Rate limiting
- [x] Zod input validation
- [ ] Refresh token rotation (TODO)
- [ ] CSRF protection (for future cookies)
- [ ] SQL/NoSQL injection prevention (via Mongoose)
- [ ] XSS prevention (React auto-escapes)
- [ ] HTTPS enforcement (in production)
- [ ] Secrets in env, never in code

---

## Testing Strategy

**Backend**:

- **Unit**: Jest for services (auth, booking, payment)
- **Integration**: Supertest for API routes
- **E2E**: Playwright for critical flows

**Frontend**:

- **Unit**: Jest + React Testing Library for components
- **E2E**: Playwright for user journeys (search → book → pay)

**Coverage Target**: 80%+ for critical paths (auth, payment)

---

## Performance Optimization

**Backend**:

- Lean Mongoose queries (`.lean()` for read-only)
- Indexes on frequent query fields
- Pagination for list endpoints
- Compression middleware
- Caching with Redis (future)

**Frontend**:

- React Query for data caching
- Next.js image optimization
- Code splitting (dynamic imports)
- Lazy loading for maps

---

## Error Handling

**Backend**:

- Centralized error handler middleware
- HTTP status codes: 400 (validation), 401 (auth), 403 (forbidden), 404, 500
- Error codes for client-side handling (e.g., `BOOKING_NOT_FOUND`)

**Frontend**:

- React Query error boundaries
- Toast notifications for user-facing errors
- Sentry for error tracking (future)

---

**Document Version**: 1.0  
**Last Updated**: 2025-12-24  
**Author**: Tech Lead
