import { Router } from 'express';
import prisma from '../prismaClient.js';
import { authRequired, adminRequired } from '../middleware/auth.js';
import { asyncHandler, parseStoredSeats } from '../utils.js';

const router = Router();
router.use(authRequired, adminRequired);

router.get('/stats', asyncHandler(async (_req, res) => {
  const [totalBuses, totalBookings, confirmed, cancelled, revenue] = await Promise.all([
    prisma.bus.count(),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: 'confirmed' } }),
    prisma.booking.count({ where: { status: 'cancelled' } }),
    prisma.booking.aggregate({ where: { status: 'confirmed' }, _sum: { totalPrice: true } })
  ]);
  return res.json({ totalBuses, totalBookings, confirmed, cancelled, revenue: revenue._sum.totalPrice || 0 });
}));

router.get('/bookings', asyncHandler(async (_req, res) => {
  const bookings = await prisma.booking.findMany({ include: { user: { select: { name: true, email: true } }, bus: true }, orderBy: { id: 'desc' } });
  return res.json(bookings.map((booking) => ({
    ...booking,
    seats: parseStoredSeats(booking.seats)
  })));
}));

router.get('/buses', asyncHandler(async (_req, res) => {
  const buses = await prisma.bus.findMany({ orderBy: { departureTime: 'asc' } });
  return res.json(buses);
}));

router.delete('/buses/:id', asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(404).json({ message: 'Bus not found.' });

  const bus = await prisma.bus.findUnique({ where: { id } });
  if (!bus) return res.status(404).json({ message: 'Bus not found.' });
  const related = await prisma.booking.count({ where: { busId: bus.id } });
  if (related) return res.status(409).json({ message: 'This bus has bookings. Cancel or remove its bookings before deleting it.' });
  await prisma.bus.delete({ where: { id: bus.id } });
  return res.json({ message: 'Bus deleted.' });
}));

router.delete('/bookings/:id', asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(404).json({ message: 'Booking not found.' });

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) return res.status(404).json({ message: 'Booking not found.' });
  await prisma.booking.delete({ where: { id: booking.id } });
  return res.json({ message: 'Booking deleted.' });
}));

export default router;
