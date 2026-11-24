# BUS BOOKING SYSTEM - FRONTEND SPEC (for AI code generation)
Owner: Queensline. Currency: FCFA (no decimals). Regions: Cameroon (Douala, Yaounde, Kribi, Bafoussam, Bamenda).
Note: API endpoints below are assumed. Replace them with the leader's final API list when ready.

## 1. STACK
- React 18 + TypeScript + Vite
- React Router v6, Tailwind CSS, Axios, React Hook Form + Zod
- Auth: JWT, roles PASSENGER and ADMIN, AuthContext, ProtectedRoute
- Money helper: formatFCFA(n) => n.toLocaleString('fr-FR') + ' FCFA'   e.g. 5 000 FCFA

## 2. FOLDER STRUCTURE (atomic design)
frontend/
  src/
    assets/images/            hero.jpg, login-side.jpg, destinations/
    styles/                   tokens.css, globals.css
    components/
      atoms/                  Button, Input, Label, Badge, Spinner, Logo
      molecules/              FormField, TripCard, SeatButton, StatCard, RouteCard
      organisms/              Navbar, SearchForm, TripList, SeatGrid, BookingSummary,
                              BookingList, AdminSidebar, DataTable
      templates/              MainLayout, AuthLayout, AdminLayout
    pages/
      LoginPage.tsx, RegisterPage.tsx, SearchTripsPage.tsx,
      SeatSelectionPage.tsx, MyBookingsPage.tsx, NotFoundPage.tsx
      admin/                  AdminDashboardPage, ManageBusesPage,
                              ManageRoutesPage, ManageTripsPage, AdminBookingsPage
    routes/                   AppRouter.tsx, ProtectedRoute.tsx
    services/                 api.ts, authService.ts, tripService.ts,
                              bookingService.ts, adminService.ts
    context/                  AuthContext.tsx
    hooks/                    useAuth.ts, useTrips.ts, useBookings.ts
    types/                    index.ts  (User, Bus, Route, Trip, Booking, Seat)
    utils/                    formatFCFA.ts, formatDate.ts
    App.tsx, main.tsx
  .env.example                VITE_API_URL=http://localhost:5000/api
  tailwind.config.ts, vite.config.ts, package.json

## 3. ROUTES (one route per page)
/                       SearchTripsPage        public        MainLayout
/login                  LoginPage              public        AuthLayout
/register               RegisterPage           public        AuthLayout
/trips/:tripId/seats    SeatSelectionPage      PASSENGER     MainLayout
/my-bookings            MyBookingsPage         PASSENGER     MainLayout
/admin                  AdminDashboardPage     ADMIN         AdminLayout
/admin/buses            ManageBusesPage        ADMIN         AdminLayout
/admin/routes           ManageRoutesPage       ADMIN         AdminLayout
/admin/trips            ManageTripsPage        ADMIN         AdminLayout
/admin/bookings         AdminBookingsPage      ADMIN         AdminLayout
*                       NotFoundPage           public

## 4. PAGE SPECS
SearchTripsPage: Navbar; hero photo with headline "Travel comfortably. Arrive refreshed.";
  SearchForm (from, to, date, passengers, button "Search trips"); results as TripList of TripCard
  (departure, arrival, duration, price in FCFA, seats left, Select button); RouteCard x3 popular routes.
  States: loading, empty ("No trips found"), error.
SeatSelectionPage: SeatGrid (2+2 layout, 40 seats), seat states available / selected / booked,
  legend, BookingSummary (seats, quantity x price, fees, total in FCFA), Confirm booking button.
  Rule: a booked seat is not clickable. Max seats = passengers chosen.
MyBookingsPage: BookingList of cards with route, date, seats, status Badge
  (Confirmed, Pending, Completed, Cancelled), Cancel button on upcoming bookings.
LoginPage / RegisterPage: AuthLayout with side photo; FormField email and password (+ name);
  Zod validation; on success store JWT, redirect by role (ADMIN to /admin, PASSENGER to /).
Admin pages: AdminSidebar (Dashboard, Buses, Routes, Trips, Bookings); dashboard StatCards
  (bookings today, revenue FCFA, active trips, seats sold %); DataTable with add / edit / delete.

## 5. API CONTRACT (assumed)
POST   /auth/register        {name,email,password}            -> {user,token}
POST   /auth/login           {email,password}                 -> {user,token}
GET    /trips?from&to&date&passengers                         -> Trip[]
GET    /trips/:id                                             -> Trip + seats[{number,status}]
POST   /bookings             {tripId,seatNumbers[]}           -> Booking
GET    /bookings/me                                           -> Booking[]
PATCH  /bookings/:id/cancel                                   -> Booking
ADMIN: GET /admin/stats ; CRUD /admin/buses, /admin/routes, /admin/trips ; GET /admin/bookings
Types: Trip {id,route{from,to},departureTime,arrivalTime,price,busId,seatsLeft}
       Booking {id,tripId,seatNumbers[],total,status}   status: PENDING|CONFIRMED|COMPLETED|CANCELLED

## 6. DESIGN TOKENS (JSON)
{
 "colors": {"navy":"#12263F","gold":"#C9A24B","teal":"#1F7A8C","ivory":"#FAF7F2",
            "slate":"#64748B","success":"#2F8F5B","danger":"#B54A4A","border":"#E5E0D6"},
 "seat": {"available":"#D6EBDD","selected":"#1F7A8C","booked":"#C8CDD3"},
 "fonts": {"heading":"Playfair Display","body":"Inter"},
 "fontSizes": {"h1":"32px","h2":"24px","h3":"20px","body":"16px","small":"14px","label":"12px"},
 "radius": {"input":"8px","button":"8px","card":"12px"},
 "spacing": "multiples of 4px",
 "breakpoints": {"sm":"640px","lg":"1024px"},
 "buttons": {"primary":"gold bg, navy text","secondary":"white bg, navy border","danger":"white bg, brick border","disabled":"grey bg"}
}

## 7. SAMPLE DATA (use as mocks)
Routes: Douala-Yaounde 5 000 FCFA | Douala-Kribi 3 500 FCFA | Yaounde-Bafoussam 4 500 FCFA | Douala-Bamenda 6 000 FCFA

## 8. PROMPT TO PASTE INTO AI (with this spec)
You are a senior React + TypeScript engineer. Using the spec above, generate the complete frontend code
structure. Create EVERY folder and file in section 2 with working, typed starter code: atoms, molecules,
organisms, templates, pages, router with ProtectedRoute (role check), AuthContext, services with a
USE_MOCK flag that returns the sample data, types, utils, Tailwind config using the tokens in section 6.
Follow the routes in section 3 exactly, one route per page. Show all prices with formatFCFA. Do not add
pages or libraries that are not in the spec. Output one file at a time with its full path as a heading.
Start with package.json, tailwind.config.ts, main.tsx, App.tsx, then the folders in order.
