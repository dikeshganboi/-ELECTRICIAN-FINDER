# 🛡️ Admin Panel - Electrician Finder

Complete admin dashboard for managing the Electrician Finder platform.

## 🚀 Features

### 1. **Dashboard Overview**

- Real-time statistics (Users, Electricians, Bookings)
- Revenue and performance metrics
- Live booking status
- Recent activity feed

### 2. **Electrician Verification** (Core Feature)

- Review pending electrician applications
- View and verify documents (Aadhaar, Certificate, Photo)
- Approve/Reject with detailed feedback
- Track verification status
- Search and filter by status

### 3. **User Management**

- View all platform users
- Monitor user booking history
- Block/Unblock users
- Handle user complaints

### 4. **Electrician Management**

- List all electricians with details
- View performance metrics (rating, jobs completed)
- Monitor online status
- Track verification status

### 5. **Booking Management**

- View all bookings with real-time status
- Track booking timeline
- Handle cancellations
- Monitor revenue

### 6. **Dispute Management**

- Handle customer disputes
- Track resolution status
- Manage refunds
- Priority-based escalation

### 7. **Analytics**

- Revenue trends and forecasting
- Service category distribution
- Top performing electricians
- Completion rates

### 8. **Settings**

- Commission configuration
- Minimum booking amount
- Cancellation policies
- Maintenance mode

## 📋 Tech Stack

- **Framework**: Next.js 14.2.3
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Data Fetching**: Axios
- **Authentication**: JWT

## 🏃 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Navigate to admin folder
cd admin

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Add your backend API URL
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Running the Admin Panel

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

The admin panel will be available at `http://localhost:3001`

## 🔐 Authentication

### Demo Credentials

- **Email**: `admin@electricianfinder.com`
- **Password**: `admin@123`

### How It Works

1. Admin enters credentials on login page
2. Backend validates and returns JWT token
3. Token stored in localStorage
4. All subsequent requests include JWT in Authorization header
5. Backend verifies `role: "admin"` in token

## 📡 API Integration

All admin endpoints require `role: "admin"` in JWT token.

### Key Endpoints

```
POST /api/admin/login
GET /api/admin/stats
GET /api/admin/electricians?status=pending|approved|rejected
PATCH /api/admin/electricians/:id/approve
PATCH /api/admin/electricians/:id/reject
GET /api/admin/analytics/overview
```

## 🎨 UI Components

### Dashboard Cards

- Summary statistics with trends
- Real-time data updates
- Loading states

### Data Tables

- Sortable columns
- Search and filter
- Pagination (optional)
- Action buttons

### Modal Dialogs

- Document preview
- Approval/Rejection forms
- Detailed records

## 🔄 Real-time Updates

Admin panel refreshes data every 30 seconds:

- Dashboard stats
- Online electricians
- Active bookings

## 📱 Responsive Design

- Mobile-first approach
- Sidebar collapses on mobile
- Touch-friendly buttons
- Optimized table scrolling

## 🛠️ Development

### Project Structure

```
admin/
├── app/
│   ├── page.tsx              # Login page
│   ├── layout.tsx            # Root layout
│   └── dashboard/
│       ├── layout.tsx        # Dashboard layout with sidebar
│       ├── page.tsx          # Dashboard home
│       ├── electricians/     # Electrician management
│       ├── verification/     # Verification panel
│       ├── users/            # User management
│       ├── bookings/         # Booking management
│       ├── disputes/         # Dispute handling
│       ├── analytics/        # Analytics and reports
│       └── settings/         # Platform settings
├── lib/
│   ├── context/
│   │   └── AdminContext.tsx  # Admin auth context
│   └── api/                  # API client utilities
├── styles/
│   └── globals.css          # Global styles and components
└── package.json
```

### Adding New Pages

1. Create new folder in `app/dashboard/`
2. Add `page.tsx` with your component
3. Update sidebar menu in `app/dashboard/layout.tsx`
4. Create API integration as needed

## 🔒 Security

- JWT-based authentication
- Role-based access control (Admin role only)
- Secure token storage in localStorage
- CORS configured for admin domain
- Input validation on forms

## 📊 Performance

- Server-side rendering for SEO
- Client-side data fetching
- Optimized images and assets
- CSS modules for styling

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables

```
NEXT_PUBLIC_API_URL=https://api.electricianfinder.com
NEXT_PUBLIC_SOCKET_URL=https://api.electricianfinder.com
```

## 📝 Notes

- All times are in IST timezone
- Currency is Indian Rupee (₹)
- Demo data available for testing
- Audit logs stored on backend

## 🤝 Contributing

For issues or suggestions, please create an issue or submit a pull request.

## 📞 Support

Contact: support@electricianfinder.com

---

**Version**: 1.0.0  
**Last Updated**: January 2025
