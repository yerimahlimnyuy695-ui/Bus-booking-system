import 'dotenv/config';
import prisma from './prismaClient.js';

const routes = [
  ['Touristique Express', 'Yaoundé', 'Douala', 6, 5000],
  ['Garanti Express', 'Yaoundé', 'Bafoussam', 7, 4500],
  ['United Express', 'Yaoundé', 'Garoua', 9, 12000],
  ['Touristique Express', 'Douala', 'Yaoundé', 8, 5000],
  ['Global Voyage', 'Douala', 'Bafoussam', 10, 6500],
  ['General Express', 'Yaoundé', 'Douala', 12, 5500]
];

async function main() {
  for (const [company, fromCity, toCity, hour, price] of routes) {
    const departureTime = new Date();
    departureTime.setDate(departureTime.getDate() + 1);
    departureTime.setHours(hour, 0, 0, 0);

    const exists = await prisma.bus.findFirst({
      where: { company, fromCity, toCity, departureTime }
    });
    if (!exists) {
      await prisma.bus.create({
        data: { company, fromCity, toCity, departureTime, price, totalSeats: 40 }
      });
    }
  }
  console.log('Demo buses seeded.');
}

main()
  .catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(async () => prisma.$disconnect());
