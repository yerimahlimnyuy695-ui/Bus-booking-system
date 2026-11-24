import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Auth() {
  const [mode, setMode] = useState('login'), [name, setName] = useState(''), [email, setEmail] = useState(''), [password, setPassword] = useState('');
  const [error, setError] = useState(''), [loading, setLoading] = useState(false);
  const { login } = useAuth(), navigate = useNavigate(), location = useLocation();
  async function submit(event) {
    event.preventDefault(); setError(''); setLoading(true);
    try {
      const { data } = await api.post(`/auth/${mode}`, { name, email, password });
      login(data); navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (e) { setError(getErrorMessage(e)); } finally { setLoading(false); }
  }
  return <main className="mx-auto max-w-md px-4 py-12"><form onSubmit={submit} className="rounded-2xl border bg-white p-7 shadow-sm">
    <h1 className="text-2xl font-black">{mode === 'login' ? 'Welcome back' : 'Create an account'}</h1><p className="mt-2 text-sm text-slate-500">Sign in to manage your bus bookings.</p>
    {mode === 'register' && <label className="mt-5 block text-sm font-semibold">Full name<input required value={name} onChange={e => setName(e.target.value)} className="mt-2 w-full rounded-lg border p-3" /></label>}
    <label className="mt-5 block text-sm font-semibold">Email<input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-2 w-full rounded-lg border p-3" /></label>
    <label className="mt-4 block text-sm font-semibold">Password<input required minLength={6} type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-2 w-full rounded-lg border p-3" /></label>
    {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    <button disabled={loading} className="mt-6 w-full rounded-lg bg-slate-900 p-3 font-bold text-white">{loading ? 'Please wait…' : mode === 'login' ? 'Login' : 'Register'}</button>
    <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }} className="mt-4 w-full text-sm font-semibold text-blue-700">{mode === 'login' ? 'Need an account? Register' : 'Already registered? Login'}</button>
  </form></main>;
}
