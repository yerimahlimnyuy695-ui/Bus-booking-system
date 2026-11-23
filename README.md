# Bus Booking System — Database Package

Database design assigned in the team task sheet: **User, Bus, Route, Trip, Booking and Payment**, implemented with PostgreSQL and Prisma ORM.

This package also includes `TripSeat`. It is a necessary inventory table that represents each physical seat for each scheduled trip and makes the no-double-booking rule enforceable at database level.

## Stack

- PostgreSQL
- Prisma ORM / Prisma Client
- Node.js seed script
- Mermaid ERD

## Data model overview

- `User`: passenger and administrator accounts (`PASSENGER`, `ADMIN`).
- `Bus`: vehicle details and seat capacity.
- `Route`: departure and destination cities.
- `Trip`: a scheduled journey using one bus and one route.
- `TripSeat`: one seat inventory record per seat per trip.
- `Booking`: one passenger reservation for one `TripSeat`.
- `Payment`: payment attempts/transactions for a booking.

## How duplicate seat booking is prevented

Two database constraints work together:

1. `TripSeat @@unique([tripId, seatNumber])` guarantees only one inventory row for a given seat on a given trip.
2. The initial PostgreSQL migration creates a **partial unique index** on `bookings.trip_seat_id` for rows whose status is `PENDING` or `CONFIRMED`. This guarantees at most one active booking per trip-seat while allowing cancelled/expired booking history to remain.

Prisma schema syntax does not currently express PostgreSQL partial unique indexes directly, so the partial unique index is intentionally defined in the checked-in SQL migration. Keep that SQL migration when deploying; do not replace it with `prisma db push` as the production schema deployment method.

The reservation example in `src/booking/seat-reservation.example.js` also uses a conditional `updateMany` inside a database transaction. Only one concurrent request can change a seat from `AVAILABLE` to `HELD`; another request receives an unavailable-seat error.

A seat can be used again on a different trip because the inventory unique key includes `tripId`. It can also be resold on the same trip after the previous booking is cancelled or expired and the seat is returned to `AVAILABLE`.

### Cancellation / expiry rule

Do not delete a booking to release its seat. In one database transaction:
- mark the booking `CANCELLED` or `EXPIRED`;
- update the associated `TripSeat` to `AVAILABLE`;
- clear `holdExpiresAt`.

Because the partial unique index only covers `PENDING` and `CONFIRMED`, the seat can then be assigned to a new booking while the old booking remains as history.

For successful payment, verify the provider webhook/server-to-server transaction, then in a transaction:
- mark the booking `CONFIRMED`;
- change the `TripSeat` from `HELD` to `BOOKED`;
- mark the payment `SUCCESS` and record `paidAt`.

Never confirm a booking based only on a browser redirect or frontend message.

## Requirements

- Node.js 20.19+
- PostgreSQL 14+
- npm

## Setup

1. Create a PostgreSQL database, for example `bus_booking`.
2. Copy `.env.example` to `.env`.
3. Put your PostgreSQL connection string in `DATABASE_URL`.
4. Install dependencies:

   ```bash
   npm install
   ```

5. Generate Prisma Client:

   ```bash
   npm run db:generate
   ```

6. Apply the checked-in initial migration:

   ```bash
   npm run db:migrate:deploy
   ```

   For local schema development, you can instead use:

   ```bash
   npm run db:migrate:dev
   ```

7. Insert demo records:

   ```bash
   npm run db:seed
   ```

8. Open Prisma Studio:

   ```bash
   npm run db:studio
   ```

## Demo seed accounts

Both accounts use the demo password `ChangeMe123!`:

- Admin: `admin@busbooking.test`
- Passenger: `passenger@example.com`

Change these credentials immediately and never use demo credentials in production.

The seed creates a demo bus, Yaounde–Douala route, a trip two days from the date the seed runs, 30 trip-seat rows, one confirmed booking and one successful demo payment. It is safe to run repeatedly for the same generated trip.

## Useful commands

- `npm run db:generate` — generate Prisma Client.
- `npm run db:migrate:dev` — create/apply a development migration.
- `npm run db:migrate:deploy` — apply committed migrations in production/staging.
- `npm run db:seed` — seed demo data.
- `npm run db:studio` — inspect records in Prisma Studio.
- `npm run db:validate` — validate the Prisma schema.

## Important production notes

- Store money as `Decimal`, not JavaScript floating-point numbers.
- Store timestamps as timezone-aware PostgreSQL `TIMESTAMPTZ`; use UTC in the backend.
- Do not trust payment status supplied by the browser. Verify payment provider callbacks.
- Add rate limiting, password reset, audit logging, backups and access control in the application.
- A bus must not be assigned to overlapping trips. Enforce this in the trip scheduling service, and consider a PostgreSQL exclusion constraint if concurrent schedule creation is expected.
- The included database migration is a starter migration. Review it with the team before production deployment.
