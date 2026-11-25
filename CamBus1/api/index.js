import app from '../backend/src/app.js';

export default function handler(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const route = url.searchParams.get('__vercel_path');

  if (route !== null) {
    url.searchParams.delete('__vercel_path');
    req.url = `/api/${route}${url.search}`;
  }

  return app(req, res);
}
