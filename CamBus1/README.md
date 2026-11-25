# CamBus — Bus Booking Starter

A React + Vite + Tailwind frontend and Express + Prisma Client backend for a student bus-booking project. The frontend talks only to the REST API. Local development uses the SQLite Prisma schema in `backend/Prisma/schema.prisma`; the public deployment uses the equivalent PostgreSQL schema in `backend/Prisma/schema.postgres.prisma`.

## Requirements

- Node.js 18+
- SQLite database configured in `backend/.env`
- Prisma Client generated from the checked-in schema

## 1. Use the checked-in Prisma contract

The schema defines the `User`, `Bus`, and `Booking` models used by the backend. Model IDs are integers. `Booking.seats` is stored as a JSON-encoded string in SQLite; booking API responses expose it as an array of seat IDs.

## 2. Configure and run the backend

```bash
cd backend
npm install
cp .env.example .env
npx prisma generate --schema Prisma/schema.prisma
```

Edit `.env` and set `DATABASE_URL` for SQLite, a long random `JWT_SECRET`, and `ADMIN_EMAILS`. The admin allowlist is a comma-separated list of account email addresses. Generate/update the local database from the checked-in schema with `npx prisma db push --schema Prisma/schema.prisma`. For a separately hosted frontend, set `FRONTEND_ORIGIN` to its origin; the default is `http://localhost:5173`.

Seed the six demo departures:

```bash
npm run seed
```

For backend-only debugging, run:

```bash
npm run dev
```

The backend reuses an existing healthy API if one is already running between ports 5000 and 5100. Otherwise, it uses the configured `PORT` if free or selects another available port in that range. Health checks are available at `http://localhost:<port>/api/health`.
For normal local development, start both services using the frontend command in the next section.

## 3. Configure and run the frontend and API

```bash
cd frontend
npm install
npm run dev
```

`npm run dev` starts the backend API and Vite frontend. It reuses a healthy API already running between ports 5000 and 5100, or selects another available port in that range if needed. Open the Vite URL shown in the terminal; frontend API requests use Vite's `/api` proxy. For a separately hosted frontend, set `VITE_API_URL` to the backend API base URL (for example, `https://api.example.com/api`).

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

## Public team test deployment

The Render Blueprint at the repository root deploys the frontend and API together as one web service, with Neon PostgreSQL for shared accounts and bookings. Local development continues to use SQLite.

1. In Neon, create a PostgreSQL project and copy both its pooled connection string and direct connection string.
2. In Render, create a Blueprint from this repository and select `render.yaml`. The service root directory is `CamBus1`.
3. When prompted, set `DATABASE_URL` to Neon's pooled connection string, `DIRECT_URL` to its direct connection string, and `ADMIN_EMAILS` to the email address that should have admin access. Render generates `JWT_SECRET`.
4. Wait for the first deployment and its seed hook to finish. Render's service URL is the public site URL to share.
5. Register an account using the email in `ADMIN_EMAILS`, then log in and open `/admin`. Teammates can register their own accounts; all accounts and bookings use the same hosted database.

Do not commit either database connection string or any other secrets. The free Render web service can sleep while idle, so its first request after a pause may take longer. The hosted database starts empty; accounts and bookings in a local SQLite database are not transferred.
