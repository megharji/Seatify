# Seatify — Ticket Booking + Wallet + Admin System

A full stack event booking platform with wallet payments, seat reservation, and an admin dashboard.

---

## Tech Stack

**Frontend**
- React 19 + Vite
- Material UI (MUI v6)
- Redux Toolkit
- React Router v6
- Axios
- Day.js

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication

---

## Setup Steps

### Frontend

```bash
cd seatify-frontend
npm install
cp .env.example .env       # set VITE_API_BASE_URL
npm run dev
```

### Environment Variables

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Backend

```bash
cd seatify-backend
npm install
cp .env.example .env       # set MONGO_URI, JWT_SECRET, PORT
npm run dev
```

---

## Pages

### User
| Page | Route |
|---|---|
| Login / Signup | `/login`, `/signup` |
| Dashboard | `/dashboard` |
| Event listing | `/events` |
| Seat selection & booking | `/events/:eventId` |
| Booking history + confirm | `/bookings` |
| Wallet (top-up + history) | `/wallet` |

### Admin
| Page | Route |
|---|---|
| Analytics dashboard | `/admin` |
| Event management (create/update/delete + seats) | `/admin/events` |
| Transactions dashboard | `/admin/transactions` |
| Cancel & Refund | `/admin/cancel-refund` |

---

## Design Decisions

### 1. Redux Toolkit for all state
All server state (auth, bookings, events, wallet, admin) lives in Redux slices. This keeps components thin and makes loading/error states consistent across the app.

### 2. Role-based routing
A single `ProtectedRoute` component wraps every private route and checks `user.role` against `allowedRoles`. Unauthenticated users are redirected to `/login`. Wrong-role users are redirected to `/`.

### 3. Two-step booking flow (Reserve → Confirm)
Seats are first reserved (locked for 5 minutes), then confirmed with wallet debit. This matches the assessment's atomic booking flow and prevents double-booking under concurrent requests.

### 4. Reserved booking persisted in localStorage
After reserving seats, the booking is saved to `localStorage` with an expiry check. This ensures the "Confirm booking" button survives a page refresh within the 5-minute window.

### 5. Idempotency keys on mutations
Reserve and confirm booking API calls include an `Idempotency-Key` header generated from a combination of action type + timestamp. This prevents duplicate charges on retried requests.

### 6. Admin and user pages in separate folders
Pages are organised as `src/pages/auth/`, `src/pages/user/`, and `src/pages/admin/` to keep role-specific code clearly separated.

### 7. Booking filter (user / event / status)
The admin booking dashboard has three independent filter fields — by user, by event name, and by status — matching the assessment requirement exactly. All filtering is client-side on the already-fetched bookings list.

---

## Assumptions

1. **Admin accounts are created via signup** with "Admin" selected as account type. The backend must accept and persist the `role` field from the signup request body.

2. **Wallet uses integer values (paise)** on the backend. The frontend displays values as-is (divided by 100 for display is not done — assumes backend already stores in rupees for this implementation).

3. **Seat expiry is handled by the backend.** The frontend shows an "expired" label based on `reservationExpiresAt` but does not auto-release seats — that is a backend responsibility.

4. **`/admin/transactions` returns all users' transactions.** The Transactions dashboard is built on this assumption. If the endpoint is scoped to the current user, it would not be useful as an admin view.

5. **JWT token is stored in Redux (in-memory) only.** There is no `localStorage` token persistence — refreshing the page requires re-login. This is intentional to avoid XSS token theft.

6. **No pagination** is implemented on any list. All bookings, transactions, and events are fetched in full. For a production system, server-side pagination would be needed.
