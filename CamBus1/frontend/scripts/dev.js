import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  findAvailableApiPort,
  findHealthyApiPort
} from '../../backend/scripts/dev-utils.js';

const frontendDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const projectDirectory = path.resolve(frontendDirectory, '..');
const backendDirectory = path.join(projectDirectory, 'backend');

async function selectApiPort() {
  const existingPort = await findHealthyApiPort();
  if (existingPort !== null) {
    console.log(`Reusing the API already running on port ${existingPort}.`);
    return { port: existingPort, startBackend: false };
  }

  return { port: await findAvailableApiPort(), startBackend: true };
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
    [path.join(backendDirectory, 'node_modules', 'nodemon', 'bin', 'nodemon.js'), 'scripts/dev.js'],
    {
      cwd: backendDirectory,
      env: { ...process.env, PORT: String(port), API_PORT: String(port) }
    }
  );
}

startProcess(
  process.execPath,
  [path.join(frontendDirectory, 'node_modules', 'vite', 'bin', 'vite.js')],
  { cwd: frontendDirectory, env: { ...process.env, API_PORT: String(port) } }
);
