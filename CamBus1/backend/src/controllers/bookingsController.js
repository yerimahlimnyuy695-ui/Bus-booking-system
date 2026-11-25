import { Router } from 'express';
import prisma from '../prismaClient.js';
import { authRequired } from '../middleware/auth.js';
import { asyncHandler, parseSeats, parseStoredSeats } from '../utils.js';

const router = Router();
router.use(authRequired);

router.post('/', asyncHandler(async (req, res) => {
  const busId = Number(req.body.busId);
  const seats = parseSeats(req.body.seats);
  const passengerName = String(req.body.passengerName || '').trim();
  const phone = String(req.body.phone || '').trim();

  if (!Number.isSafeInteger(busId) || busId < 1 || !seats.length || !passengerName || !phone) {
    return res.status(400).json({ message: 'Bus, at least one seat, passenger name, and phone are required.' });
  }

  const booking = await prisma.$transaction(async (tx) => {
    const bus = await tx.bus.findUnique({ where: { id: busId } });
    if (!bus) {
      const error = new Error('Bus not found.'); error.status = 404; throw error;
    }

    const invalidSeats = seats.filter((seat) => !/^[A-D](?:[1-9]|10)$/.test(seat));
    if (invalidSeats.length || seats.length > bus.totalSeats) {
      const error = new Error('One or more seat numbers are invalid.'); error.status = 400; throw error;
    }

    const activeBookings = await tx.booking.findMany({
      where: { busId, status: 'confirmed' },
      select: { seats: true }
    });
    const taken = new Set(activeBookings.flatMap((item) => parseStoredSeats(item.seats)));
    const conflicts = seats.filter((seat) => taken.has(seat));
    if (conflicts.length) {
      const error = new Error(`These seats have already been booked: ${conflicts.join(', ')}`); error.status = 409; throw error;
    }

    const bookingRef = `BUS-${Date.now()}`;
    return tx.booking.create({
      data: {
        userId: req.user.id, busId, seats: JSON.stringify(seats), passengerName, phone,
        totalPrice: bus.price * seats.length, bookingRef, status: 'confirmed'
      },
      include: { bus: true }
    });
  });

  return res.status(201).json({ ...booking, seats: parseStoredSeats(booking.seats) });
}));

router.get('/my', asyncHandler(async (req, res) => {
  const bookings = await prisma.booking.findMany({
    where: { userId: req.user.id },
    include: { bus: true },
    orderBy: { id: 'desc' }
  });
  return res.json(bookings.map((booking) => ({
    ...booking,
    seats: parseStoredSeats(booking.seats)
  })));
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(404).json({ message: 'Booking not found.' });

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) return res.status(404).json({ message: 'Booking not found.' });
  if (booking.userId !== req.user.id) return res.status(403).json({ message: 'You cannot cancel another user’s booking.' });
  if (booking.status === 'cancelled') return res.status(400).json({ message: 'Booking is already cancelled.' });

  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: { status: 'cancelled' },
    include: { bus: true }
  });
  return res.json({ ...updated, seats: parseStoredSeats(updated.seats) });
}));

export default router;
