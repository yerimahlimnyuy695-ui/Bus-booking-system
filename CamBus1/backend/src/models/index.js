// Prisma-backed model access layer. The schema is owned by the database teammate.
// These exports keep database access centralized without duplicating or changing schema.prisma.
import prisma from '../prismaClient.js';
export const UserModel = prisma.user;
export const BusModel = prisma.bus;
export const BookingModel = prisma.booking;
export default prisma;
