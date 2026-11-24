# CamBus — Bus Booking Starter

A React + Vite + Tailwind frontend and Express + Prisma Client backend for a student bus-booking project. The frontend talks only to the REST API. The backend uses the Prisma Client generated from your teammate's schema; **this project does not include or modify `schema.prisma`**.

## Requirements

- Node.js 18+
- PostgreSQL running locally or remotely
- Your teammate's Prisma schema and generated Prisma Client
- Two terminals

## 1. Agree on the Prisma contract

The backend expects these Prisma model/delegate names and fields:

- `User`: `id`, `name`, `email` (unique), `password`, relation `bookings`
- `Bus`: `id`, `company`, `fromCity`, `toCity`, `departureTime`, `price`, `totalSeats`, relation `bookings`
- `Booking`: `id`, `userId`, `busId`, `seats` (`String[]`), `passengerName`, `phone`, `totalPrice`, `status`, `bookingRef` (unique)

The `Booking` model must also expose a `user` relation because the admin bookings endpoint includes the user's name/email. Use the exact relation field names `user`, `bus`, and `bookings` or adjust the includes to match the team's agreed contract. IDs may be strings or another scalar supported by Prisma; the API passes IDs through unchanged.

## 2. Configure and run the backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and set the PostgreSQL `DATABASE_URL`, a long random `JWT_SECRET`, and `ADMIN_EMAILS`. The admin allowlist is a comma-separated list of account email addresses. The database teammate owns schema and migrations; coordinate with them to apply migrations and generate the client from the shared schema before starting this API.

If the teammate's Prisma project is in a separate directory, make sure this backend resolves the generated `@prisma/client` from the correct workspace/package setup. In a shared repository, the simplest approach is usually to install backend dependencies and run Prisma generation from the directory containing the teammate's schema, or configure the Prisma schema path in the team's package scripts.

Seed the six demo departures:

```bash
npm run seed
```

Start the API:

```bash
npm run dev
```

API runs at `http://localhost:5000`. Health check: `http://localhost:5000/api/health`.

## 3. Configure and run the frontend

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Demo admin account

1. Add the email you want to use to `ADMIN_EMAILS` in `backend/.env`.
2. Register that email through the app.
3. Log in with it. The backend checks the JWT email against the allowlist for admin endpoints.

There is intentionally no `role` field added to the agreed User model.

## API routes

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/buses/search?from=Yaoundé&to=Douala` | Public | Search |
| GET | `/api/buses/:id` | Public | Bus and taken seats |
| POST | `/api/buses` | Admin | Add bus |
| POST | `/api/bookings` | User | Create booking |
| GET | `/api/bookings/my` | User | Current user's bookings |
| DELETE | `/api/bookings/:id` | Owner | Cancel booking |
| GET | `/api/admin/stats` | Admin | Dashboard statistics |
| GET | `/api/admin/bookings` | Admin | All bookings |
| GET | `/api/admin/buses` | Admin | All buses |
| DELETE | `/api/admin/buses/:id` | Admin | Delete bus with no bookings |
| DELETE | `/api/admin/bookings/:id` | Admin | Delete booking |

## Important implementation notes

- Seat IDs in the starter seat picker are `A1`–`A10`, `B1`–`B10`, `C1`–`C10`, and `D1`–`D10`. The picker visually places A/B on one side and C/D on the other, with an aisle between.
- Search date is optional. The seed creates departures for the next calendar day at local server time.
- Admin access uses `ADMIN_EMAILS` because the agreed User contract has no role field. Do not expose the admin email allowlist in frontend code.
- Booking creation checks confirmed bookings inside a Prisma transaction. For production-grade concurrency safety, coordinate a database-level uniqueness/locking strategy with the database teammate; a read-then-create check alone can still race under simultaneous requests.
- Deleting a bus with any booking is blocked to avoid foreign-key failures and loss of booking history. Admin can delete individual bookings using the admin endpoint.
- Checkout is simulated. No payment provider or real payment is integrated.
- Add production validation, rate limiting, secure deployment settings, and tests before using this beyond a classroom demo.


## Architecture

### Backend (MVC-style)
- `backend/src/models/` is the Prisma-backed model access layer (`UserModel`, `BusModel`, `BookingModel`). It uses the schema supplied by the database teammate; this project does not define or alter `schema.prisma`.
- `backend/src/controllers/` contains request handling and application logic, separated by feature.
- `backend/src/routes/` contains the route entry points mounted by `server.js`.
- `backend/src/middleware/` contains authentication and admin authorization middleware.

### Frontend (Atomic Design)
- `frontend/src/components/atoms/`: small UI primitives such as buttons and labels.
- `frontend/src/components/molecules/`: combinations of atoms, such as labeled form fields.
- `frontend/src/components/organisms/`: larger reusable page sections.
- `frontend/src/components/templates/`: page-level layout wrappers.
- `frontend/src/pages/`: route-level screens.

### Main routes
- `/` home/search; `/results` search results; `/buses/:id` bus/seat selection.
- `/login` and `/register` authentication screen (also available at `/auth`).
- `/my-bookings` passenger bookings; `/admin` administration.

## Downloadable tickets
Confirmed bookings on **My Bookings** now have a **Download ticket (PDF)** action. It creates a PDF locally in the browser using jsPDF. Cancelled bookings cannot be downloaded as valid boarding tickets.
