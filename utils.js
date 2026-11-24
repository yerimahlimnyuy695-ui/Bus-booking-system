export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

export function parseSeats(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((seat) => String(seat).trim()).filter(Boolean))];
}

export function parseStoredSeats(value) {
  const seats = JSON.parse(value);
  if (!Array.isArray(seats) || !seats.every((seat) => typeof seat === 'string')) {
    throw new Error('Stored booking seats are invalid.');
  }
  return seats;
}
