import { createServer } from 'node:net';

export async function isHealthyApi(port) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1000);

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/health`, {
      signal: controller.signal
    });
    if (!response.ok) return false;
    const health = await response.json();
    return health.status === 'ok';
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

export async function findHealthyApiPort(start = 5000, end = 5100) {
  for (let port = start; port <= end; port += 1) {
    if (await isHealthyApi(port)) return port;
  }
  return null;
}

export function isPortAvailable(port) {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once('error', (error) => {
      if (error.code === 'EADDRINUSE') resolve(false);
      else reject(error);
    });
    server.listen(port, () => {
      server.close((error) => {
        if (error) reject(error);
        else resolve(true);
      });
    });
  });
}

export async function findAvailableApiPort(start = 5000, end = 5100) {
  for (let port = start; port <= end; port += 1) {
    if (await isPortAvailable(port)) return port;
  }

  throw new Error(`No available API port found between ${start} and ${end}.`);
}
