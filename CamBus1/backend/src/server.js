import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import busRoutes from './routes/busesRoutes.js';
import bookingRoutes from './routes/bookingsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is missing. Copy .env.example to .env and configure it.');
}

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` }));
app.use((error, _req, res, _next) => {
  console.error(error);
  const status = error.status || (error.code === 'P2002' ? 409 : 500);
  res.status(status).json({ message: status === 500 ? 'Internal server error.' : error.message });
});

const port = Number(process.env.PORT || 5000);
app.listen(port, () => console.log(`Bus Booking API running at http://localhost:${port}`));
