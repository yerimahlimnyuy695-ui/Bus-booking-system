import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function getErrorMessage(error) {
  if (!error.response) {
    return 'Cannot reach the API. Start the app with "npm run dev" from the frontend folder, or check VITE_API_URL.';
  }
  return error.response?.data?.message || error.message || 'Something went wrong.';
}
export default api;
