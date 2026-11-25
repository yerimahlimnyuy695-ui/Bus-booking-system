import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const frontendDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const projectDirectory = path.resolve(frontendDirectory, '..');
const backendDirectory = path.join(projectDirectory, 'backend');

async function isHealthyApi(port) {
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

function isPortAvailable(port) {
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

async function selectApiPort() {
  if (await isHealthyApi(5000)) {
    console.log('Reusing the API already running on port 5000.');
    return { port: 5000, startBackend: false };
  }

  for (let port = 5000; port <= 5100; port += 1) {
    if (await isPortAvailable(port)) return { port, startBackend: true };
  }

  throw new Error('No available API port found between 5000 and 5100.');
}

const { port, startBackend } = await selectApiPort();
const children = [];
let stopping = false;

function stop(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  process.exitCode = exitCode;
  for (const child of children) {
    if (child.exitCode === null) child.kill();
  }
}

function startProcess(command, args, options) {
  const child = spawn(command, args, { stdio: 'inherit', ...options });
  children.push(child);
  child.once('error', (error) => {
    console.error(`Failed to start ${command}:`, error);
    stop(1);
  });
  child.once('exit', (code) => {
    if (!stopping) stop(code || 0);
  });
  return child;
}

process.once('SIGINT', () => stop());
process.once('SIGTERM', () => stop());

if (startBackend) {
  console.log(`Starting the API on port ${port}.`);
  startProcess(
    process.execPath,
    [path.join(backendDirectory, 'node_modules', 'nodemon', 'bin', 'nodemon.js'), 'src/server.js'],
    { cwd: backendDirectory, env: { ...process.env, PORT: String(port) } }
  );
}

startProcess(
  process.execPath,
  [path.join(frontendDirectory, 'node_modules', 'vite', 'bin', 'vite.js')],
  { cwd: frontendDirectory, env: { ...process.env, API_PORT: String(port) } }
);
