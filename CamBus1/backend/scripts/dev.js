import 'dotenv/config';
import {
  findAvailableApiPort,
  findHealthyApiPort,
  isHealthyApi,
  isPortAvailable
} from './dev-utils.js';

const existingPort = await findHealthyApiPort();
if (existingPort !== null) {
  console.log(`Bus Booking API is already running on port ${existingPort}; not starting a duplicate.`);
  process.exit(0);
}

const requestedPort = Number(process.env.PORT || 5000);
let port;

if (await isHealthyApi(requestedPort)) {
  console.log(`Bus Booking API is already running on port ${requestedPort}; not starting a duplicate.`);
  process.exit(0);
}

if (await isPortAvailable(requestedPort)) {
  port = requestedPort;
} else {
  if (process.env.API_PORT) {
    throw new Error(`Port ${requestedPort} became unavailable while starting the frontend and API.`);
  }
  port = await findAvailableApiPort();
  console.log(`Port ${requestedPort} is occupied; using port ${port} instead.`);
}

process.env.PORT = String(port);
console.log(`Starting the Bus Booking API on port ${port}.`);
await import('../src/server.js');
