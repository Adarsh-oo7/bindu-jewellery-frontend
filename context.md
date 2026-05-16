# Bindu Jewellery Frontend — React Development Master Prompt

> **Use this document with any AI IDE (Cursor, Windsurf, Antigravity, Copilot, Claude, etc.)**
> Paste the relevant section as your prompt when generating each component/page.
> All code targets: **React 18.2 · React Router 6 · Tailwind CSS · Vite 5 · Development environment**

---

## ⚡ Master Context (Paste This First — Every Session)

```
Project: Bindu Jewellery Business Growth System - React Frontend
Stack: React 18.2, React Router 6, Vite 5, Tailwind CSS 3, Axios, React Query (TanStack Query)
State Management: Zustand + React Query
Auth: JWT (stored in localStorage), axios interceptors for token refresh
Base API URL: http://localhost:8000/api/v1/

User Roles: owner | manager | staff | telecaller | field
Role-based routing: Redirect based on user.role after login
Protected routes: All routes except /login require authentication

Theme Colors:
- Primary Gold: #C9972A
- Secondary: #1A5490 (Navy Blue)
- Success: #0F6E56 (Green)
- Danger: #B03A2E (Red)
- Background: #FAF6EE (Cream)
- Text: #1C1505 (Dark Brown)

Component Structure:
- src/components/ — reusable UI components
- src/pages/ — full page components
- src/layouts/ — layout wrappers (DashboardLayout, AuthLayout)
- src/services/ — API service functions
- src/hooks/ — custom React hooks
- src/store/ — Zustand stores
- src/utils/ — helper functions
- src/constants/ — constants and enums

Design System:
- Use shadcn/ui components (Button, Card, Table, Modal, Form, Input, Select, etc.)
- Lucide React icons
- Tailwind CSS for styling
- Responsive: mobile-first design (sm, md, lg, xl breakpoints)
- Consistent spacing: 4, 8, 16, 24, 32, 48, 64px
- Card style: rounded-lg shadow-sm border border-gray-200

API Response Format:
- List: {"count": N, "next": url, "previous": url, "results": [...]}
- Detail: {object data}
- Error: {"error": true, "message": "...", "details": {...}}

All forms:
- React Hook Form + Zod validation
- Error messages below inputs
- Loading states on submit buttons
- Success/error toast notifications (react-hot-toast)

All tables:
- Server-side pagination (20 items per page)
- Sort by column headers (click to toggle)
- Filter dropdowns (role, branch, segment, status, date range)
- Search input (debounced 500ms)
- Export to CSV/Excel button (where applicable)
- Row actions: View, Edit, Delete (based on permissions)

Date/Time:
- Format: date-fns library
- Display: "DD MMM YYYY, HH:mm" (e.g., "02 May 2026, 14:30")
- Input: date pickers (react-datepicker)
- Timezone: Asia/Kolkata

Rules:
- Never store sensitive data in localStorage except JWT tokens
- Always handle loading, error, empty states
- Debounce search inputs (500ms)
- Use React Query for all API calls (automatic caching, refetching)
- Role-based UI: Hide/show elements based on user.role
- Lazy load pages with React.lazy() and Suspense
- Use TypeScript for type safety (optional but recommended)
```

---

## Backend API Endpoints Reference

### Authentication
```
POST   /api/v1/auth/login/           → {access, refresh, user}
POST   /api/v1/auth/refresh/         → {access}
POST   /api/v1/auth/logout/          → Blacklist refresh token
```

### Accounts
```
GET    /api/v1/accounts/users/                    → List users (paginated)
POST   /api/v1/accounts/users/                    → Create user (owner only)
GET    /api/v1/accounts/users/{id}/               → User detail
PATCH  /api/v1/accounts/users/{id}/               → Update user
DELETE /api/v1/accounts/users/{id}/               → Soft delete (is_active=false)
POST   /api/v1/accounts/users/{id}/set-role/      → Change user role
GET    /api/v1/accounts/staff/?branch_id=         → Staff by branch
POST   /api/v1/accounts/change-password/          → Change own password
GET    /api/v1/accounts/sub-permissions/          → Sub-manager permissions
POST   /api/v1/accounts/sub-permissions/          → Create permission
DELETE /api/v1/accounts/sub-permissions/{id}/     → Delete permission
```

### Branches & Segments
```
GET    /api/v1/branches/branches/                 → List branches
POST   /api/v1/branches/branches/                 → Create branch (owner)
GET    /api/v1/branches/branches/{id}/            → Branch detail
PATCH  /api/v1/branches/branches/{id}/            → Update branch
DELETE /api/v1/branches/branches/{id}/            → Delete branch
GET    /api/v1/branches/segments/                 → List segments
POST   /api/v1/branches/segments/                 → Create segment
PATCH  /api/v1/branches/segments/{id}/            → Update segment
DELETE /api/v1/branches/segments/{id}/            → Delete segment
```

### Leads
```
GET    /api/v1/leads/leads/                       → List leads (filtered by role)
POST   /api/v1/leads/leads/                       → Create lead
GET    /api/v1/leads/leads/{id}/                  → Lead detail
PATCH  /api/v1/leads/leads/{id}/                  → Update lead
PATCH  /api/v1/leads/leads/{id}/stage/            → Update stage only
DELETE /api/v1/leads/leads/{id}/                  → Delete lead
GET    /api/v1/leads/leads/{id}/activity/         → Lead activity log
GET    /api/v1/leads/followups/                   → List follow-ups
POST   /api/v1/leads/followups/                   → Create follow-up
PATCH  /api/v1/leads/followups/{id}/              → Update follow-up (mark completed)

Query Params: ?stage=&segment=&branch=&assigned_to=&source=&search=
Lead Stages: new, contacted, interested, scheduled, converted, lost
Lead Sources: walkin, instagram, facebook, website, referral
```

### Calls
```
GET    /api/v1/calls/calllogs/                    → List call logs
POST   /api/v1/calls/calllogs/                    → Create call log
GET    /api/v1/calls/calllogs/{id}/               → Call detail
GET    /api/v1/calls/stats/                       → Call statistics

Call Outcomes: interested, callback, not_interested, no_answer, converted
```

### Field Visits
```
GET    /api/v1/fieldvisits/fieldvisits/           → List visits
POST   /api/v1/fieldvisits/start/                 → Start new visit
POST   /api/v1/fieldvisits/{id}/checkin/          → GPS check-in
POST   /api/v1/fieldvisits/{id}/report/           → Submit visit report

Query Params: ?staff_id=&date=&status=
Visit Status: in_progress, completed, cancelled
```

### Sales
```
GET    /api/v1/sales/sales/                       → List sales
POST   /api/v1/sales/sales/                       → Create sale
GET    /api/v1/sales/sales/{id}/                  → Sale detail
GET    /api/v1/sales/revenue/?branch=&from=&to=   → Revenue report
```

### Campaigns
```
GET    /api/v1/campaigns/campaigns/               → List campaigns
POST   /api/v1/campaigns/campaigns/               → Create campaign
GET    /api/v1/campaigns/campaigns/{id}/          → Campaign detail
PATCH  /api/v1/campaigns/campaigns/{id}/          → Update campaign
DELETE /api/v1/campaigns/campaigns/{id}/          → Delete campaign
POST   /api/v1/campaigns/campaigns/{id}/launch/   → Launch campaign
GET    /api/v1/campaigns/campaign-leads/          → Campaign leads
PATCH  /api/v1/campaigns/campaign-leads/{id}/     → Update lead status
GET    /api/v1/campaigns/whatsapp-templates/      → List templates
POST   /api/v1/campaigns/whatsapp-templates/      → Create template
GET    /api/v1/campaigns/special-day-messages/    → Special day messages
POST   /api/v1/campaigns/special-day-messages/    → Create message

Campaign Types: festival, bridal, investment, promotion, special_day
Campaign Status: draft, scheduled, active, completed, failed
```

### Notifications
```
GET    /api/v1/notifications/notifications/       → List notifications
PATCH  /api/v1/notifications/notifications/{id}/read/ → Mark as read
POST   /api/v1/notifications/read-all/            → Mark all as read
GET    /api/v1/notifications/unread-count/        → Unread count

Notification Types: report, alert, reminder, campaign, system
```

### Reports
```
GET    /api/v1/reports/reports/                   → List reports
GET    /api/v1/reports/snapshot/?branch_id=&period= → Latest snapshot
POST   /api/v1/reports/eod/trigger/               → Trigger EOD report

Query Params: ?branch_id=&from=&to=&period=
Period: daily, monthly
```

### Attendance
```
GET    /api/v1/attendance/attendance/             → List attendance
POST   /api/v1/attendance/checkin/                → Check in
POST   /api/v1/attendance/checkout/               → Check out

Query Params: ?user_id=&date=&branch_id=
Status: present, late, absent
```

---

## Project Setup & Configuration

### SETUP 1 — Initialize Vite React Project

```bash
npm create vite@latest bindu-jewellery-frontend -- --template react
cd bindu-jewellery-frontend
npm install

# Core dependencies
npm install react-router-dom axios @tanstack/react-query zustand
npm install react-hook-form @hookform/resolvers zod
npm install date-fns react-datepicker
npm install lucide-react react-hot-toast
npm install recharts # for charts/graphs

# Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# shadcn/ui (follow their CLI setup)
npx shadcn-ui@latest init

# Development tools
npm install -D @types/react @types/react-dom
```

### SETUP 2 — `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#C9972A',
          light: '#F0C84A',
          dark: '#7A5500',
        },
        navy: {
          DEFAULT: '#1A5490',
          light: '#2E75B6',
          dark: '#0E3A6B',
        },
        green: {
          DEFAULT: '#0F6E56',
          light: '#E1F5EE',
        },
        danger: '#B03A2E',
        cream: '#FAF6EE',
        'dark-brown': '#1C1505',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### SETUP 3 — `src/main.jsx`

```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster position="top-right" />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
```

### SETUP 4 — `src/App.jsx`

```javascript
import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout'
import AuthLayout from './layouts/AuthLayout'
import LoadingSpinner from './components/LoadingSpinner'

// Lazy load pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'))
const UsersPage = lazy(() => import('./pages/users/UsersPage'))
const LeadsPage = lazy(() => import('./pages/leads/LeadsPage'))
const LeadDetailPage = lazy(() => import('./pages/leads/LeadDetailPage'))
const CampaignsPage = lazy(() => import('./pages/campaigns/CampaignsPage'))
const SalesPage = lazy(() => import('./pages/sales/SalesPage'))
const ReportsPage = lazy(() => import('./pages/reports/ReportsPage'))
const AttendancePage = lazy(() => import('./pages/attendance/AttendancePage'))
const FieldVisitsPage = lazy(() => import('./pages/fieldvisits/FieldVisitsPage'))
const CallLogsPage = lazy(() => import('./pages/calls/CallLogsPage'))
const NotificationsPage = lazy(() => import('./pages/notifications/NotificationsPage'))
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'))
const BranchesPage = lazy(() => import('./pages/branches/BranchesPage'))

function App() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Routes>
        {/* Public routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/" element={<DashboardPage />} />
          
          {/* User Management - Owner & Manager only */}
          <Route path="/users" element={<UsersPage />} />
          
          {/* Branches & Segments - Owner only for edit */}
          <Route path="/branches" element={<BranchesPage />} />
          
          {/* Leads - All authenticated */}
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/leads/:id" element={<LeadDetailPage />} />
          
          {/* Campaigns - Manager & Owner */}
          <Route path="/campaigns" element={<CampaignsPage />} />
          
          {/* Sales - All staff */}
          <Route path="/sales" element={<SalesPage />} />
          
          {/* Reports - Manager & Owner */}
          <Route path="/reports" element={<ReportsPage />} />
          
          {/* Attendance - All staff */}
          <Route path="/attendance" element={<AttendancePage />} />
          
          {/* Field Visits - Field staff & Managers */}
          <Route path="/field-visits" element={<FieldVisitsPage />} />
          
          {/* Call Logs - Telecaller & Staff */}
          <Route path="/calls" element={<CallLogsPage />} />
          
          {/* Notifications - All authenticated */}
          <Route path="/notifications" element={<NotificationsPage />} />
          
          {/* Profile - All authenticated */}
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App
```

---

## Core Infrastructure Files

### FILE 1 — `src/services/api.js`

```javascript
Generate src/services/api.js for the Bindu Jewellery React frontend.

Create axios instance with:
- baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
- timeout: 30000ms
- headers: { 'Content-Type': 'application/json' }

Request interceptor:
- Add Authorization header with Bearer token from localStorage
- Log request (console.log in dev mode only)

Response interceptor:
- Success: return response.data
- Error handling:
  - 401: Clear localStorage, redirect to /login
  - 403: Show toast "Permission denied"
  - 400: Return validation errors
  - 500: Show toast "Server error"
  - Network error: Show toast "Network error"

Export axios instance as 'api'
```

### FILE 2 — `src/services/authService.js`

```javascript
Generate src/services/authService.js for the Bindu Jewellery React frontend.

Import api from './api.js'

Export these functions:
1. login(email, password) → POST /auth/login/
   - Returns: {access, refresh, user}
   - Store tokens in localStorage: 'access_token', 'refresh_token'
   - Store user in localStorage: 'user' (JSON stringified)

2. logout() → POST /auth/logout/ (with refresh token)
   - Clear localStorage
   - Redirect to /login

3. refreshToken() → POST /auth/refresh/ (with refresh token)
   - Returns new access token
   - Update localStorage

4. getCurrentUser() → Get user from localStorage, parse JSON

5. isAuthenticated() → Check if access_token exists in localStorage

6. getUserRole() → Get user.role from localStorage

7. hasPermission(requiredRoles: string[]) → Check if user.role in requiredRoles
```

### FILE 3 — `src/store/authStore.js` (Zustand)

```javascript
Generate src/store/authStore.js using Zustand for the Bindu Jewellery React frontend.

Create authStore with:
State:
- user: null | User object
- isAuthenticated: boolean
- isLoading: boolean

Actions:
- setUser(user) → update user and isAuthenticated
- clearUser() → set user to null, isAuthenticated to false
- initializeAuth() → read from localStorage on app mount
- logout() → call authService.logout(), then clearUser()

Export default useAuthStore
```

### FILE 4 — `src/hooks/useAuth.js`

```javascript
Generate src/hooks/useAuth.js custom hook for the Bindu Jewellery React frontend.

Import useAuthStore from '../store/authStore'
Import authService from '../services/authService'

Return object with:
- user (from store)
- isAuthenticated (from store)
- login(email, password) → async function calling authService.login()
- logout() → async function calling store.logout()
- hasRole(roles: string[]) → check if user.role in roles
- isOwner → user.role === 'owner'
- isManager → user.role === 'manager' || user.role === 'owner'
- isStaff → user.role in ['staff', 'telecaller', 'field']
```

### FILE 5 — `src/components/ProtectedRoute.jsx`

```javascript
Generate src/components/ProtectedRoute.jsx for the Bindu Jewellery React frontend.

Component that:
- Checks if user is authenticated using useAuth()
- If not authenticated: redirect to /login
- If authenticated: render children

Props:
- children: ReactNode
- allowedRoles?: string[] (optional - check user has required role)

If allowedRoles provided and user doesn't have permission:
- Show "Access Denied" page or redirect to dashboard
```

### FILE 6 — `src/layouts/DashboardLayout.jsx`

```javascript
Generate src/layouts/DashboardLayout.jsx for the Bindu Jewellery React frontend.

Layout structure:
- Sidebar (left) - 16rem width
  - Logo at top
  - Navigation menu (role-based visibility)
  - User info at bottom
- Main content area (right)
  - Top bar: page title, notifications icon, user dropdown
  - Content: <Outlet /> from react-router-dom

Sidebar Navigation Items (show based on role):
- Dashboard (all)
- Leads (all)
- Campaigns (owner, manager)
- Sales (all)
- Calls (telecaller, staff, manager, owner)
- Field Visits (field, manager, owner)
- Attendance (all)
- Reports (owner, manager)
- Users (owner, manager)
- Branches (owner, manager)

Mobile: Sidebar collapses to hamburger menu

Use Lucide icons for navigation items
Use Tailwind for styling
```

### FILE 7 — `src/layouts/AuthLayout.jsx`

```javascript
Generate src/layouts/AuthLayout.jsx for the Bindu Jewellery React frontend.

Simple centered layout for login page:
- Full screen background with gradient (cream to gold)
- Centered card (max-width 28rem)
- Logo and title at top
- <Outlet /> for login form
- Footer with copyright text

Styling: Tailwind CSS
Background: Linear gradient from #FAF6EE to #F0C84A
```

---

## Authentication Pages

### PAGE 1 — `src/pages/auth/LoginPage.jsx`

```javascript
Generate src/pages/auth/LoginPage.jsx for the Bindu Jewellery React frontend.

Form fields:
- Email (email type, required)
- Password (password type, required, min 8 chars)

Validation: React Hook Form + Zod schema

On submit:
- Call useAuth().login(email, password)
- Show loading spinner on button
- On success: redirect to / (dashboard)
- On error: show toast with error message

Design:
- Card with shadow
- Gold primary button
- "Forgot password?" link (disabled for now)
- Logo at top
- Title: "Bindu Jewellery - Login"

Use shadcn/ui components: Card, Input, Button, Label
```

---

## Dashboard Pages

### PAGE 2 — `src/pages/dashboard/DashboardPage.jsx`

```javascript
Generate src/pages/dashboard/DashboardPage.jsx for the Bindu Jewellery React frontend.

Role-based dashboard content:

OWNER VIEW:
- 4 stat cards in grid:
  - Total Leads (all branches)
  - Total Sales (this month)
  - Active Campaigns
  - Total Revenue (this month)
- Charts:
  - Sales trend chart (last 30 days) - Line chart (Recharts)
  - Branch performance comparison - Bar chart
  - Lead conversion funnel - Funnel chart
- Recent activity table (latest 5 leads, sales, campaigns)

MANAGER VIEW:
- 4 stat cards (branch-specific):
  - My Branch Leads
  - My Branch Sales (this month)
  - My Staff Count
  - Branch Revenue
- Charts:
  - Staff performance leaderboard
  - Lead stages distribution - Pie chart
  - Daily sales trend
- Today's tasks (follow-ups, pending reports)

STAFF/TELECALLER VIEW:
- 3 stat cards (personal):
  - My Leads
  - Calls Today
  - Conversions This Month
- Quick action buttons:
  - Add New Lead
  - Log Call
  - View Follow-ups
- Today's follow-ups table

FIELD STAFF VIEW:
- 3 stat cards:
  - Visits Today
  - Pending Visits
  - Completed Reports
- Quick actions:
  - Start Field Visit
  - Check In
- Active visits map (if any in progress)

Use React Query to fetch dashboard stats from multiple endpoints
Use Recharts for all charts
Use shadcn/ui Card components
Responsive grid layout
```

---

## User Management Pages

### PAGE 3 — `src/pages/users/UsersPage.jsx`

```javascript
Generate src/pages/users/UsersPage.jsx for the Bindu Jewellery React frontend.

Permission: Owner and Manager only (Manager sees own branch only)

Features:
- Data table with columns:
  - Full Name
  - Email
  - Phone
  - Role (badge with color coding)
  - Branch
  - Status (Active/Inactive badge)
  - Join Date
  - Actions (View, Edit, Delete)

- Top bar:
  - "Add User" button (Owner only) → opens CreateUserModal
  - Search input (by name, email, phone)
  - Filter dropdowns: Role, Branch, Status
  - Export to CSV button

- Server-side pagination (20 per page)
- Sort by clicking column headers

- Modals:
  - CreateUserModal: Form with all user fields
  - EditUserModal: Update user details
  - ChangeRoleModal: Change user role (Owner only)
  - DeleteUserModal: Confirmation modal (soft delete)

Use React Query: useQuery for list, useMutation for create/update/delete
Use shadcn/ui: Table, Dialog, Select, Input, Button
```

### PAGE 4 — `src/pages/profile/ProfilePage.jsx`

```javascript
Generate src/pages/profile/ProfilePage.jsx for the Bindu Jewellery React frontend.

Two sections in tabs:

TAB 1 - Profile Information:
- Display current user details (read-only):
  - Full Name, Email, Phone, Role, Branch
  - Join Date, Employee ID
  - Emergency Contact
- "Edit Profile" button → opens EditProfileModal
  - Can edit: Full Name, Phone, Address, Emergency Contact
  - Cannot edit: Email, Role, Branch

TAB 2 - Change Password:
- Form with:
  - Old Password (required)
  - New Password (min 8 chars, required)
  - Confirm Password (must match)
- Submit: POST /accounts/change-password/
- Show success toast on success

Use shadcn/ui: Tabs, Card, Input, Button
Use React Hook Form for password form
```

---

## Branches & Segments Pages

### PAGE 5 — `src/pages/branches/BranchesPage.jsx`

```javascript
Generate src/pages/branches/BranchesPage.jsx for the Bindu Jewellery React frontend.

Permission: Manager & Owner (Manager view-only, Owner can edit)

Two sections in tabs:

TAB 1 - Branches:
- List of branches with cards
- Each card shows:
  - Branch Name
  - Location
  - Map preview (static image or Google Maps embed)
  - Segments count
  - Staff count
  - Actions: Edit, Delete (Owner only)
- "Add Branch" button (Owner only) → CreateBranchModal
  - Fields: Name, Location, Latitude, Longitude
  - Map picker for lat/lng (optional - can enter manually)

TAB 2 - Segments:
- Table with columns:
  - Segment Name
  - Branch
  - Created At
  - Actions: Edit, Delete (Owner only)
- "Add Segment" button (Owner only) → CreateSegmentModal
  - Fields: Name, Branch (dropdown)
- Filter by branch dropdown

Use React Query for data fetching
Use shadcn/ui components
```

---

## Leads Management Pages

### PAGE 6 — `src/pages/leads/LeadsPage.jsx`

```javascript
Generate src/pages/leads/LeadsPage.jsx for the Bindu Jewellery React frontend.

Permission: All authenticated users (filtered by role on backend)

Features:
- Kanban board view (default) with stage columns:
  - New → Contacted → Interested → Scheduled → Converted
  - Lost (separate column on right, red theme)
- Drag and drop to change stage (updates via API)
- Each card shows:
  - Lead name
  - Phone
  - Budget (if available)
  - Assigned to (staff name)
  - Source badge
  - Created date
  - Score badge (color-coded: red <30, yellow 30-60, green >60)
  - Quick actions: View, Call, Follow-up

- Toggle view: Kanban / Table
- Table view columns:
  - Name, Phone, Stage, Segment, Branch, Assigned To, Source, Score, Created
  - Actions: View, Edit, Delete

- Top bar:
  - "Add Lead" button → CreateLeadModal
  - Search input (name, phone)
  - Filters: Stage, Segment, Branch, Assigned To, Source, Date Range
  - Export button

- CreateLeadModal form fields:
  - Name (required)
  - Phone (required, validate format)
  - Email (optional)
  - Segment (dropdown - bridal, daily, investment, diamond)
  - Budget (number input)
  - Source (dropdown)
  - Assigned To (staff dropdown - from branch)
  - Notes (textarea)

Use React Query + mutations
Use react-beautiful-dnd for drag and drop
Use shadcn/ui components
Responsive: Stack columns on mobile
```

### PAGE 7 — `src/pages/leads/LeadDetailPage.jsx`

```javascript
Generate src/pages/leads/LeadDetailPage.jsx for the Bindu Jewellery React frontend.

URL: /leads/:id

Layout: 3 columns (responsive: stack on mobile)

LEFT COLUMN - Lead Info Card:
- Lead details (read-only):
  - Name, Phone, Email
  - Segment, Branch
  - Budget, Source
  - Score (large badge)
  - Created date, Last updated
  - Assigned staff (with avatar)
- Quick actions:
  - Edit Lead
  - Change Stage (dropdown)
  - Delete Lead
  - Call Now (opens CallLogModal pre-filled)

MIDDLE COLUMN - Activity Timeline:
- Chronological list of all activities:
  - Lead created
  - Status changed
  - Call logs (with outcome)
  - Follow-ups scheduled/completed
  - Notes added
  - Sales recorded
- Each item shows:
  - Icon (based on type)
  - Title and description
  - Staff member who did it
  - Timestamp
- "Add Note" button at bottom

RIGHT COLUMN - Follow-ups & Tasks:
- Upcoming follow-ups (date, time, note)
  - Mark as completed checkbox
- "Schedule Follow-up" button → ScheduleFollowUpModal
  - Date picker
  - Time picker
  - Note textarea
- Past follow-ups (completed, collapsed)

Use React Query: useQuery for lead detail, useMutation for updates
Use shadcn/ui components
Timeline component: custom or use a library
```

---

## Campaigns Pages

### PAGE 8 — `src/pages/campaigns/CampaignsPage.jsx`

```javascript
Generate src/pages/campaigns/CampaignsPage.jsx for the Bindu Jewellery React frontend.

Permission: Owner & Manager

Three tabs:

TAB 1 - Campaigns:
- Table with columns:
  - Name
  - Type (badge: festival, bridal, investment, promotion, special_day)
  - Status (badge: draft, scheduled, active, completed, failed)
  - Total Leads
  - Sent Count
  - Converted Count
  - ROI % (color-coded)
  - Scheduled At
  - Actions: View, Edit, Launch, Delete
- Top bar:
  - "Create Campaign" button → CreateCampaignModal
  - Filter: Type, Status, Branch, Segment, Date Range
  - Search: Campaign name
- CreateCampaignModal fields:
  - Name (required)
  - Type (dropdown)
  - Branch (dropdown)
  - Segment (dropdown)
  - WhatsApp Template (dropdown or custom message textarea)
  - Scheduled At (datetime picker)
  - Target Leads (auto-fetch based on branch+segment)
- Launch campaign: POST /campaigns/{id}/launch/ → sets status to active, triggers send

TAB 2 - WhatsApp Templates:
- List of templates with cards
- Each card:
  - Template name
  - Trigger type (birthday, anniversary, promotion, etc.)
  - Message preview
  - Is Active toggle
  - Edit, Delete actions
- "Create Template" button (Owner only)

TAB 3 - Special Day Messages:
- Table of special day configs:
  - Date (e.g., Diwali, Christmas)
  - Message template
  - Is Active
  - Edit, Delete
- "Add Special Day" button

Use React Query
Use shadcn/ui components
Show campaign progress bar for active campaigns
```

### PAGE 9 — `src/pages/campaigns/CampaignDetailPage.jsx` (Optional but recommended)

```javascript
Generate src/pages/campaigns/CampaignDetailPage.jsx for the Bindu Jewellery React frontend.

URL: /campaigns/:id

Show detailed campaign analytics:
- Campaign info card (name, type, status, dates)
- Performance metrics:
  - Total leads targeted
  - Messages sent
  - Delivered count
  - Read count
  - Converted count
  - ROI calculation
- Charts:
  - Send progress over time (line chart)
  - Conversion funnel (funnel chart)
  - Lead outcomes (pie chart: delivered, read, converted, failed)
- Campaign leads table:
  - Lead name, phone
  - Status badges: Sent, Delivered, Read, Converted
  - Sent at timestamp
  - Error message (if failed)
  - Action: Retry send (if failed)

Use Recharts for visualizations
Use React Query
```

---

## Sales Pages

### PAGE 10 — `src/pages/sales/SalesPage.jsx`

```javascript
Generate src/pages/sales/SalesPage.jsx for the Bindu Jewellery React frontend.

Permission: All staff (role-based filtering on backend)

Features:
- Table with columns:
  - Date & Time
  - Lead Name (linked to lead detail)
  - Branch
  - Segment
  - Amount (formatted with ₹ symbol)
  - Item Description
  - Recorded By (staff name)
  - Actions: View, Edit, Delete (own sales only)
- Top bar:
  - "Record Sale" button → RecordSaleModal
  - Filters: Branch, Segment, Date Range, Recorded By
  - Search: Lead name, item description
  - Export to CSV
- Summary cards at top:
  - Total Sales (count)
  - Total Revenue (sum)
  - Average Sale Value
  - Top Selling Segment

- RecordSaleModal form:
  - Lead (searchable dropdown - optional, can be null for walk-ins)
  - Amount (required, number input with ₹ prefix)
  - Item Description (textarea, required)
  - Branch (auto-filled from user.branch, disabled)
  - Segment (dropdown)
  - Date (defaults to today)

Use React Query
Use shadcn/ui components
Format currency with Intl.NumberFormat or custom helper
```

---

## Reports Pages

### PAGE 11 — `src/pages/reports/ReportsPage.jsx`

```javascript
Generate src/pages/reports/ReportsPage.jsx for the Bindu Jewellery React frontend.

Permission: Owner & Manager (Manager sees own branch only)

Three sections:

SECTION 1 - Dashboard Snapshot:
- Filter bar:
  - Branch dropdown (Owner only - Manager auto-filtered)
  - Period: Daily / Monthly
  - Date picker
- 4 stat cards:
  - Total Leads
  - Total Calls
  - Sales Count
  - Sales Amount
- Charts:
  - Leads trend (last 30 days) - Line chart
  - Sales vs Calls comparison - Bar chart
  - Segment-wise revenue - Pie chart
- "Trigger EOD Report" button (Manager only)
  - POST /reports/eod/trigger/
  - Shows success toast

SECTION 2 - Historical Reports:
- Table of past reports:
  - Date
  - Branch
  - Period (daily/monthly)
  - Leads, Calls, Sales Count, Revenue
  - Download as PDF button (per row)
- Filters: Branch, Period, Date Range
- Pagination

SECTION 3 - Custom Reports (Advanced):
- Form to build custom report:
  - Metrics: Multi-select (Leads, Calls, Sales, Revenue, Conversions)
  - Group By: Branch, Segment, Staff, Date Range
  - Date Range picker
  - "Generate Report" button
- Show results in table + export to CSV/Excel

Use React Query
Use Recharts
Use shadcn/ui components
```

---

## Attendance Pages

### PAGE 12 — `src/pages/attendance/AttendancePage.jsx`

```javascript
Generate src/pages/attendance/AttendancePage.jsx for the Bindu Jewellery React frontend.

Permission: All staff

Two tabs:

TAB 1 - My Attendance:
- Check-in card (if not checked in today):
  - "Check In" button
  - Requests geolocation (browser API)
  - Optional: Upload photo (camera or file)
  - Shows current time
  - POST /attendance/checkin/ with lat, lng, photo
- Check-out card (if already checked in):
  - Shows check-in time
  - "Check Out" button
  - POST /attendance/checkout/
- Today's attendance summary card:
  - Check-in time
  - Check-out time (if done)
  - Status badge (Present, Late, Absent)
  - Hours worked (calculated)
- My attendance history table (last 30 days):
  - Date
  - Check-in time
  - Check-out time
  - Status
  - Hours worked
  - Notes

TAB 2 - Team Attendance (Manager & Owner only):
- Calendar view showing all staff attendance
- Filter by: Branch, Date, Status
- Table view:
  - Staff name
  - Date
  - Check-in/out times
  - Status
  - Photo thumbnail (click to view full)
- Export attendance report (CSV)

Use browser Geolocation API for lat/lng
Use FileReader API for photo preview before upload
Use shadcn/ui Calendar component
Use React Query
```

---

## Field Visits Pages

### PAGE 13 — `src/pages/fieldvisits/FieldVisitsPage.jsx`

```javascript
Generate src/pages/fieldvisits/FieldVisitsPage.jsx for the Bindu Jewellery React frontend.

Permission: Field staff, Manager, Owner

Two views based on role:

FIELD STAFF VIEW:
- Active visit card (if any visit is in_progress):
  - Lead name, started time
  - "GPS Check-In" button (POST /fieldvisits/{id}/checkin/)
    - Gets current geolocation
  - "End Visit & Submit Report" button → SubmitReportModal
- Start new visit card (if no active visit):
  - Lead dropdown (searchable)
  - "Start Visit" button
  - Requests geolocation
  - POST /fieldvisits/start/ with lead_id, lat, lng
- My visits history:
  - Table: Date, Lead, Status, Started At, Ended At, Report
  - Click row to view full visit details

MANAGER/OWNER VIEW:
- Live map showing active field visits:
  - Markers for each field staff currently on visit
  - Popup shows: Staff name, lead name, start time
  - Real-time updates (polling every 30 seconds)
- Visits table:
  - Staff name
  - Lead name
  - Status (badge: in_progress, completed, cancelled)
  - Started at
  - Ended at
  - Actions: View Report
- Filters: Staff, Date, Status
- Export button

- SubmitReportModal form:
  - Summary (textarea, required)
  - Outcome (dropdown: successful, needs_followup, not_interested, no_response)
  - Follow-up Required (checkbox)
  - Next follow-up date (if checkbox checked)
  - Submit button → POST /fieldvisits/{id}/report/

Use Geolocation API
Use Google Maps or Leaflet for map view
Use React Query with polling for real-time updates
Use shadcn/ui components
```

---

## Call Logs Pages

### PAGE 14 — `src/pages/calls/CallLogsPage.jsx`

```javascript
Generate src/pages/calls/CallLogsPage.jsx for the Bindu Jewellery React frontend.

Permission: Telecaller, Staff, Manager, Owner

Features:
- Table with columns:
  - Date & Time
  - Lead Name (linked to detail)
  - Called By (staff name)
  - Outcome (badge: interested, callback, not_interested, no_answer, converted)
  - Duration (formatted as MM:SS)
  - Notes
  - Actions: View

- Top bar:
  - "Log Call" button → LogCallModal
  - Filters: Outcome, Called By, Date Range
  - Search: Lead name
  - Export button

- Summary cards:
  - Total Calls Today
  - Interested Count
  - Converted Count
  - Avg Call Duration

- LogCallModal form:
  - Lead (searchable dropdown, required)
  - Outcome (dropdown: interested, callback, not_interested, no_answer, converted)
  - Duration (number input in seconds OR mm:ss format)
  - Notes (textarea)
  - Date/Time (defaults to now)

- Stats view (Manager only):
  - GET /calls/stats/
  - Staff performance table:
    - Staff name
    - Total calls
    - Interested count
    - Converted count
    - Conversion rate %
  - Leaderboard (sorted by conversion rate)

Use React Query
Use shadcn/ui components
Format duration: `${Math.floor(sec/60)}:${sec%60}`
```

---

## Notifications Pages

### PAGE 15 — `src/pages/notifications/NotificationsPage.jsx`

```javascript
Generate src/pages/notifications/NotificationsPage.jsx for the Bindu Jewellery React frontend.

Permission: All authenticated users

Features:
- List of notifications (infinite scroll or pagination):
  - Each notification card:
    - Icon (based on type: report, alert, reminder, campaign, system)
    - Title (bold if unread)
    - Message
    - Timestamp (relative: "2 hours ago")
    - Type badge
    - Mark as read button (if unread)
  - Unread notifications at top (highlighted background)
  - Read notifications below (muted style)

- Top bar:
  - "Mark All as Read" button
    - POST /notifications/read-all/
  - Filter dropdown: All / Unread / By Type
  - Search: Notification text

- Empty state if no notifications:
  - Icon + "No notifications yet"

- Click on notification card:
  - Marks as read automatically (PATCH /notifications/{id}/read/)
  - If notification has related entity (lead, campaign), navigate to detail page

Use React Query with infinite scroll (useInfiniteQuery)
Use date-fns for relative time formatting (formatDistanceToNow)
Use shadcn/ui components
Real-time updates: Optional WebSocket or polling every 60 seconds
```

---

## Shared Components

### COMPONENT 1 — `src/components/DataTable.jsx`

```javascript
Generate src/components/DataTable.jsx reusable component for the Bindu Jewellery React frontend.

Props:
- columns: Array of column definitions
  - {key: string, label: string, sortable?: boolean, render?: (row) => ReactNode}
- data: Array of row data
- isLoading: boolean
- pagination: {currentPage, totalPages, onPageChange}
- onSort?: (column: string, direction: 'asc'|'desc') => void
- onRowClick?: (row) => void
- emptyMessage?: string

Features:
- Render table with headers and rows
- Show loading spinner overlay when isLoading
- Sortable columns (click header to toggle asc/desc)
- Pagination controls at bottom (prev, page numbers, next)
- Empty state when no data
- Responsive: Horizontal scroll on mobile

Use shadcn/ui Table components
Use Lucide icons for sort indicators
```

### COMPONENT 2 — `src/components/StatCard.jsx`

```javascript
Generate src/components/StatCard.jsx reusable component for the Bindu Jewellery React frontend.

Props:
- title: string
- value: string | number
- icon?: LucideIcon
- trend?: {value: number, isPositive: boolean} (e.g., +12% or -5%)
- color?: 'gold' | 'navy' | 'green' | 'red' (theme color)
- onClick?: () => void (make card clickable)

Design:
- Card with shadow and border
- Icon on left (if provided)
- Title and value stacked
- Trend indicator on bottom right (green up arrow or red down arrow)
- Hover effect if clickable

Use shadcn/ui Card
Use Tailwind for styling
Use Lucide icons (TrendingUp, TrendingDown)
```

### COMPONENT 3 — `src/components/SearchInput.jsx`

```javascript
Generate src/components/SearchInput.jsx reusable component for the Bindu Jewellery React frontend.

Props:
- value: string
- onChange: (value: string) => void
- placeholder?: string
- debounceMs?: number (default 500)

Features:
- Input with search icon (Lucide Search)
- Debounced onChange to avoid excessive API calls
- Clear button (X icon) when value is not empty
- Loading spinner when debouncing (optional)

Use shadcn/ui Input
Use Lucide icons
Use custom debounce hook or lodash.debounce
```

### COMPONENT 4 — `src/components/FilterBar.jsx`

```javascript
Generate src/components/FilterBar.jsx reusable component for the Bindu Jewellery React frontend.

Props:
- filters: Array of filter definitions
  - {key: string, label: string, type: 'select'|'date'|'daterange', options?: Array}
- values: Object (current filter values)
- onChange: (key: string, value: any) => void
- onReset: () => void

Features:
- Render filter inputs based on type
- Select dropdown (searchable with react-select or shadcn Select)
- Date picker (react-datepicker)
- Date range picker (start & end dates)
- "Reset Filters" button

Use shadcn/ui Select, Popover for date pickers
Responsive: Stack vertically on mobile
```

### COMPONENT 5 — `src/components/Modal.jsx` (Generic Modal Wrapper)

```javascript
Generate src/components/Modal.jsx reusable modal wrapper for the Bindu Jewellery React frontend.

Props:
- isOpen: boolean
- onClose: () => void
- title: string
- children: ReactNode
- size?: 'sm' | 'md' | 'lg' | 'xl' (width)
- showCloseButton?: boolean (default true)

Features:
- Overlay with fade animation
- Modal card slides in from top
- Close on overlay click or ESC key
- Responsive: Full screen on mobile

Use shadcn/ui Dialog component or custom with Radix UI
Use Tailwind for animations
```

### COMPONENT 6 — `src/components/LoadingSpinner.jsx`

```javascript
Generate src/components/LoadingSpinner.jsx component for the Bindu Jewellery React frontend.

Props:
- fullScreen?: boolean (default false)
- size?: 'sm' | 'md' | 'lg' (default 'md')
- message?: string (optional loading text)

Design:
- Spinning circle icon (Lucide Loader2 with spin animation)
- If fullScreen: center on full viewport
- If not: center within container
- Show message below spinner if provided

Use Lucide Loader2 icon
Use Tailwind for centering and animation
```

### COMPONENT 7 — `src/components/EmptyState.jsx`

```javascript
Generate src/components/EmptyState.jsx component for the Bindu Jewellery React frontend.

Props:
- icon?: LucideIcon
- title: string
- message?: string
- action?: {label: string, onClick: () => void} (optional CTA button)

Design:
- Centered icon (large, muted color)
- Title below icon
- Message text (muted)
- Action button at bottom (if provided)

Use Lucide icons
Use Tailwind for layout
```

---

## Utility Functions & Hooks

### UTILITY 1 — `src/utils/formatters.js`

```javascript
Generate src/utils/formatters.js utility functions for the Bindu Jewellery React frontend.

Export these functions:
1. formatCurrency(amount: number) → string
   - Format as ₹ symbol with Indian number formatting
   - Example: formatCurrency(150000) → "₹1,50,000"
   - Use Intl.NumberFormat('en-IN', {style: 'currency', currency: 'INR'})

2. formatDate(date: Date | string, format?: string) → string
   - Default format: "DD MMM YYYY, HH:mm"
   - Use date-fns format function
   - Example: formatDate(new Date()) → "02 May 2026, 14:30"

3. formatRelativeTime(date: Date | string) → string
   - Use date-fns formatDistanceToNow
   - Example: "2 hours ago", "3 days ago"

4. formatPhoneNumber(phone: string) → string
   - Format Indian phone numbers
   - Example: "9876543210" → "+91 98765 43210"

5. formatDuration(seconds: number) → string
   - Format call duration as MM:SS
   - Example: 125 → "02:05"

6. truncate(text: string, maxLength: number) → string
   - Truncate with ellipsis
   - Example: truncate("Long text here", 10) → "Long te..."
```

### UTILITY 2 — `src/utils/validators.js`

```javascript
Generate src/utils/validators.js Zod schemas for the Bindu Jewellery React frontend.

Export Zod schemas for forms:
1. loginSchema — email (email format), password (min 8)
2. userSchema — email, phone (10 digits), role (enum), full_name, branch
3. leadSchema — name, phone, segment (enum), source (enum), budget (positive number)
4. changePasswordSchema — old_password, new_password (min 8), confirm_password (match)
5. campaignSchema — name, type (enum), branch, segment, scheduled_at (future date)
6. saleSchema — amount (positive), item_description, segment
7. attendanceSchema — lat (number -90 to 90), lng (number -180 to 180)

Use Zod library for schema definitions
Export each schema
```

### HOOK 1 — `src/hooks/useDebounce.js`

```javascript
Generate src/hooks/useDebounce.js custom hook for the Bindu Jewellery React frontend.

Hook that debounces a value:
- Input: value (any), delay (number, default 500ms)
- Output: debouncedValue
- Uses useEffect to set timeout and clear on cleanup

Example usage:
const [search, setSearch] = useState('')
const debouncedSearch = useDebounce(search, 500)
// Use debouncedSearch in API call
```

### HOOK 2 — `src/hooks/useMediaQuery.js`

```javascript
Generate src/hooks/useMediaQuery.js custom hook for the Bindu Jewellery React frontend.

Hook for responsive design:
- Input: query (string, e.g., '(min-width: 768px)')
- Output: matches (boolean)
- Uses window.matchMedia and event listener
- Cleanup on unmount

Example usage:
const isMobile = useMediaQuery('(max-width: 640px)')
```

### HOOK 3 — `src/hooks/useLocalStorage.js`

```javascript
Generate src/hooks/useLocalStorage.js custom hook for the Bindu Jewellery React frontend.

Hook for syncing state with localStorage:
- Input: key (string), initialValue (any)
- Output: [value, setValue] (like useState)
- Reads from localStorage on mount
- Updates localStorage on value change
- Handles JSON stringify/parse

Example usage:
const [theme, setTheme] = useLocalStorage('theme', 'light')
```

---

## Environment Variables

### `.env.development`

```
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_NAME=Bindu Jewellery
VITE_GOOGLE_MAPS_API_KEY=your-api-key-here
VITE_ENABLE_ANALYTICS=false
```

### `.env.production`

```
VITE_API_BASE_URL=https://api.bindujewellery.com/api/v1
VITE_APP_NAME=Bindu Jewellery
VITE_GOOGLE_MAPS_API_KEY=your-production-api-key
VITE_ENABLE_ANALYTICS=true
VITE_SENTRY_DSN=your-sentry-dsn-here
```

---

## Missing / Additional Recommendations

### Missing API Endpoints (Backend needs to add):
1. **GET /api/v1/dashboard/stats/** — Aggregated stats for dashboard (leads count, sales sum, etc.)
   - Query params: ?branch_id=&period=daily|monthly&from=&to=
2. **GET /api/v1/leads/leaderboard/** — Top performing staff by conversions
3. **GET /api/v1/analytics/conversion-funnel/** — Funnel data (stages with counts)
4. **GET /api/v1/analytics/revenue-trend/** — Time series data for charts

### Additional Features to Consider:
1. **Dark Mode Toggle** — Use Tailwind dark: classes, store preference in localStorage
2. **Export to PDF** — For reports, use jsPDF or react-pdf
3. **Real-time Notifications** — WebSocket connection for live notifications (Socket.io)
4. **Offline Support** — Service Worker + IndexedDB for offline access (PWA)
5. **Multi-language Support** — i18next for internationalization (English, Malayalam, Hindi)
6. **Advanced Filters** — Save filter presets, custom date ranges
7. **Bulk Actions** — Select multiple rows, bulk delete/update
8. **Activity Log** — System-wide audit log (who did what, when)
9. **File Uploads** — Drag & drop for photos, documents (react-dropzone)
10. **Charts Library Upgrade** — Consider Recharts + ApexCharts for advanced visualizations

### Performance Optimizations:
1. **Code Splitting** — React.lazy() for all pages (already in App.jsx)
2. **Image Optimization** — Use next-gen formats (WebP), lazy loading
3. **Bundle Analysis** — Use `vite-bundle-visualizer`
4. **Memoization** — React.memo, useMemo, useCallback for expensive components
5. **Virtual Scrolling** — For large lists (react-window or react-virtualized)

### Security Enhancements:
1. **CSRF Protection** — Add CSRF token to all mutation requests
2. **XSS Prevention** — Sanitize user inputs (DOMPurify)
3. **Rate Limiting** — Show user-friendly error when rate limited
4. **Session Timeout** — Auto-logout after 30 mins inactivity
5. **2FA Support** — Two-factor authentication (optional)

### Testing:
1. **Unit Tests** — Vitest + React Testing Library
2. **E2E Tests** — Playwright or Cypress
3. **Accessibility** — axe-core for a11y testing

---

## Generation Checklist

Follow this order when generating components:

### Phase 1 - Core Setup
- [ ] Project initialization (Vite + deps)
- [ ] Tailwind config
- [ ] API service (`src/services/api.js`)
- [ ] Auth service (`src/services/authService.js`)
- [ ] Auth store (`src/store/authStore.js`)
- [ ] useAuth hook
- [ ] Protected Route component
- [ ] Layouts (Dashboard, Auth)

### Phase 2 - Shared Components
- [ ] LoadingSpinner
- [ ] EmptyState
- [ ] StatCard
- [ ] DataTable
- [ ] SearchInput
- [ ] FilterBar
- [ ] Modal wrapper

### Phase 3 - Utility Functions
- [ ] Formatters (currency, date, phone)
- [ ] Validators (Zod schemas)
- [ ] Custom hooks (useDebounce, useMediaQuery, useLocalStorage)

### Phase 4 - Authentication
- [ ] Login page
- [ ] Profile page

### Phase 5 - Core Pages (High Priority)
- [ ] Dashboard page (role-based)
- [ ] Leads page (Kanban + Table)
- [ ] Lead Detail page
- [ ] Users page

### Phase 6 - Secondary Pages
- [ ] Branches page
- [ ] Campaigns page
- [ ] Sales page
- [ ] Call Logs page

### Phase 7 - Supporting Pages
- [ ] Field Visits page
- [ ] Attendance page
- [ ] Reports page
- [ ] Notifications page

### Phase 8 - Testing & Polish
- [ ] Test all API integrations
- [ ] Test role-based permissions
- [ ] Responsive design check (mobile, tablet, desktop)
- [ ] Error handling (network errors, 404s, permissions)
- [ ] Loading states on all data fetches
- [ ] Toast notifications for all actions

### Phase 9 - Deployment Prep
- [ ] Build production bundle (`npm run build`)
- [ ] Environment variable check
- [ ] Performance audit (Lighthouse)
- [ ] Security audit
- [ ] Deploy to hosting (Vercel, Netlify, AWS S3)

---

## Quick Start Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code (if using Prettier)
npm run format

# Run tests (if configured)
npm run test
```

---

## Important Notes

1. **Always check user permissions before showing UI elements** — Use `useAuth().hasRole(['owner', 'manager'])` to conditionally render
2. **Handle all API errors gracefully** — Show toast notifications, don't let app crash
3. **Use React Query for all data fetching** — Automatic caching, refetching, and loading states
4. **Keep components small and reusable** — Extract common patterns into shared components
5. **Follow the design system** — Stick to Tailwind theme colors, spacing, and shadcn/ui components
6. **Test on mobile** — Many users will access on phones, ensure responsive design
7. **Optimize images** — Compress before upload, use lazy loading
8. **Use TypeScript where helpful** — At minimum, type your API responses and component props
9. **Document complex logic** — Add comments for business rules and non-obvious code
10. **Keep dependencies updated** — Regularly check for security updates

---

**END OF FRONTEND MASTER PROMPT**

Use this document as a reference when building the Bindu Jewellery React frontend. Generate each file/component as needed, following the structure and guidelines provided. Good luck! 🚀