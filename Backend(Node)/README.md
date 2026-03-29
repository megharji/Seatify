# Taski Ticket Booking Backend

Node.js + Express + MongoDB backend for the take-home assessment: ticket booking, wallet, reservation expiry, and admin flows.

## Features Covered

- User signup/login with JWT
- Admin login (seed script provided)
- Wallet top-up with integer-only amount handling
- Wallet transaction ledger
- Event listing
- Seat inventory per event
- Seat reservation with 5-minute expiry
- Booking confirmation with wallet debit
- Atomic booking + payment using MongoDB transactions
- Booking history for users
- Admin event management
- Admin bulk seat creation
- Admin booking monitoring
- Admin transaction monitoring
- Admin cancellation + wallet refund
- Basic idempotency support using `Idempotency-Key`
- Reservation expiry cleanup job every minute

## Important Note

MongoDB transactions require a **replica set**. Use:
- MongoDB Atlas, or
- local MongoDB replica set

If you use a plain standalone local MongoDB without replica set, transactional flows will fail.

## Project Structure

```bash
src/
  config/
  controllers/
  jobs/
  middleware/
  models/
  routes/
  services/
  utils/
```

## Setup

```bash
npm install
cp .env.example .env
npm run seed:admin
npm run dev
```

## Default Admin Credentials

After running `npm run seed:admin`, log in with:

```
Email:    admin@example.com
Password: Admin@123
```

These are configurable via `DEFAULT_ADMIN_EMAIL` and `DEFAULT_ADMIN_PASSWORD` in `.env`.

## Environment Variables

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/taski_assessment
JWT_SECRET=change_this_secret
JWT_EXPIRES_IN=7d
RESERVATION_HOLD_MINUTES=5
DEFAULT_ADMIN_NAME=Admin
DEFAULT_ADMIN_EMAIL=admin@example.com
DEFAULT_ADMIN_PASSWORD=Admin@123
```

## API Summary

### Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Wallet
- `GET /api/wallet`
- `POST /api/wallet/add-money`

### Events
- `GET /api/events`
- `GET /api/events/:eventId/seats`

### Bookings
- `GET /api/bookings/my`
- `POST /api/bookings/reserve`
- `POST /api/bookings/confirm`

### Admin
- `POST /api/admin/events`
- `PATCH /api/admin/events/:eventId`
- `DELETE /api/admin/events/:eventId`
- `POST /api/admin/events/:eventId/seats/bulk`
- `GET /api/admin/bookings`
- `GET /api/admin/transactions`
- `POST /api/admin/bookings/cancel`

## Example Flow

1. Signup as user
2. Seed admin and login as admin
3. Admin creates event
4. Admin bulk creates seats
5. User adds wallet money
6. User reserves seats
7. User confirms booking
8. Admin can cancel booking and refund wallet

## Idempotency

Use the `Idempotency-Key` header on:
- `POST /api/wallet/add-money`
- `POST /api/bookings/reserve`
- `POST /api/bookings/confirm`
- `POST /api/admin/bookings/cancel`

Duplicate requests with the same key return the stored response and include `"idempotentReplay": true` in the body.

## Design Decisions

### Two-Step Booking Flow (Reserve → Confirm)
Seats are first locked for 5 minutes without charging the user. Only on explicit confirm does the wallet get debited. This lets users check seat availability and price before committing funds — and naturally handles browser back-button or abandoned checkouts without leaving orphaned charges.

### Atomic Booking + Payment via MongoDB Transactions
The confirm step wraps wallet debit, seat status update, and booking status update in a single MongoDB session. If any step fails (e.g. insufficient balance), the entire transaction rolls back. This guarantees the wallet and seat inventory are never out of sync. **Requires a MongoDB replica set.**

### Idempotency via Stored Response Replay
Each state-changing endpoint (reserve, confirm, add-money, cancel) requires an `Idempotency-Key` header. The key, route, and userId are stored alongside the full response. On a duplicate request, the stored response is returned verbatim. This handles network retries safely without re-executing business logic.

### Reservation Expiry: Proactive + Background
Expiry is handled in two layers:
- **Proactive**: When a user tries to reserve a seat, any existing reservation that has expired is released inline before the new reservation is created. This prevents stale locks from blocking legitimate bookings between cleanup runs.
- **Background job**: A cron job runs every minute to sweep and release all bookings in `RESERVED` state past their `reservationExpiresAt` timestamp. Ensures cleanup even if no new reservations come in.

### Service Layer Owns MongoDB Sessions
Complex multi-document operations (`reserveSeats`, `confirmBooking`) create their own Mongoose sessions internally. Controllers do not manage sessions. This keeps controller code clean and ensures sessions are always properly closed — even when errors are thrown mid-transaction.

### Custom HTTP Error + express-async-errors
All business errors are thrown as plain `Error` objects with a `.status` property. `express-async-errors` catches async throws automatically, so no try/catch in controllers. The global error handler converts MongoDB validation errors (400), duplicate key errors (409), and custom status errors consistently.

## Assumptions / Simplifications

- Wallet add money is simulated; no payment gateway integration.
- Reservation expiry cleanup runs every minute.
- Idempotency is implemented using stored response replay.
- Frontend is not included in this package.
- No rate limiting or API docs UI added yet.
- `role` field can be passed at signup but would be restricted in a production system.

## Postman Collection

A full Postman collection is included at `taski.postman_collection.json` in the root of this repo. Import it into Postman to test all endpoints.

**Collection variables** (set these after importing):
- `base_url` — default `http://localhost:5000/api`
- `user_token` — filled by running "Login (User)"
- `admin_token` — filled by running "Login (Admin)"
- `event_id`, `seat_ids`, `booking_id` — filled as you run the flow in order

## Suggested Next Improvements

- Swagger / OpenAPI docs
- Proper request validation via Joi / Zod
- Redis-based distributed locks for high-scale concurrency
- Background queue for expiry handling
- Pagination and search on admin dashboards
- Integration tests for race conditions
