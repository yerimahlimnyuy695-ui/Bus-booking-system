import { Router } from 'express';
import prisma from '../prismaClient.js';
import { authRequired, adminRequired } from '../middleware/auth.js';
import { asyncHandler } from '../utils.js';

const router = Router();

router.get('/search', asyncHandler(async (req, res) => {
  const from = String(req.query.from || '').trim();
  const to = String(req.query.to || '').trim();
  const date = req.query.date ? new Date(String(req.query.date)) : null;

  if (!from || !to) return res.status(400).json({ message: 'Both from and to cities are required.' });
  if (from.toLowerCase() === to.toLowerCase()) return res.status(400).json({ message: 'Departure and destination must differ.' });
  if (date && Number.isNaN(date.getTime())) return res.status(400).json({ message: 'Invalid travel date.' });

  const where = { fromCity: { equals: from, mode: 'insensitive' }, toCity: { equals: to, mode: 'insensitive' } };
  if (date) {
    const start = new Date(date); start.setHours(0, 0, 0, 0);
    const end = new Date(date); end.setHours(23, 59, 59, 999);
    where.departureTime = { gte: start, lte: end };
  }

  const buses = await prisma.bus.findMany({ where, orderBy: { departureTime: 'asc' } });
  return res.json(buses);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const bus = await prisma.bus.findUnique({
    where: { id: req.params.id },
    include: { bookings: { where: { status: 'confirmed' }, select: { seats: true } } }
  });
  if (!bus) return res.status(404).json({ message: 'Bus not found.' });

  const takenSeats = [...new Set(bus.bookings.flatMap((booking) => booking.seats))];
  const { bookings, ...busData } = bus;
  return res.json({ ...busData, takenSeats });
}));

router.post('/', authRequired, adminRequired, asyncHandler(async (req, res) => {
  const { company, fromCity, toCity, departureTime, price, totalSeats = 40 } = req.body;
  const parsedDate = new Date(departureTime);
  const parsedPrice = Number(price);
  const parsedSeats = Number(totalSeats);

  if (!company || !fromCity || !toCity || fromCity === toCity ||
      !departureTime || Number.isNaN(parsedDate.getTime()) ||
      !Number.isInteger(parsedPrice) || parsedPrice < 0 ||
      !Number.isInteger(parsedSeats) || parsedSeats < 1) {
    return res.status(400).json({ message: 'Provide valid company, different cities, departure time, non-negative integer price, and positive seat count.' });
  }

  const bus = await prisma.bus.create({
    data: { company: String(company).trim(), fromCity: String(fromCity).trim(), toCity: String(toCity).trim(), departureTime: parsedDate, price: parsedPrice, totalSeats: parsedSeats }
  });
  return res.status(201).json(bus);
}));

export default router;
