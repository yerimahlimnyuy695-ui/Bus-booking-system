import 'dotenv/config';
import { createApp } from './app.js';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is missing. Copy .env.example to .env and configure it.');
}

const app = createApp({ serveFrontend: process.env.NODE_ENV === 'production' });

const port = Number(process.env.PORT || 5000);
app.listen(port, () => console.log(`Bus Booking API running at http://localhost:${port}`));
