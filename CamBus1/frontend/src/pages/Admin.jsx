import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../services/api.js';

const money = n => `${Number(n || 0).toLocaleString()} FCFA`;
const initial = { company: '', fromCity: 'Yaoundé', toCity: 'Douala', departureTime: '', price: 5000, totalSeats: 40 };
export default function Admin() {
  const [tab, setTab] = useState('Overview'), [stats, setStats] = useState(null), [buses, setBuses] = useState([]), [bookings, setBookings] = useState([]);
  const [form, setForm] = useState(initial), [error, setError] = useState(''), [notice, setNotice] = useState('');
  async function load() {
    try {
      const [s, b, k] = await Promise.all([api.get('/admin/stats'), api.get('/admin/buses'), api.get('/admin/bookings')]);
      setStats(s.data); setBuses(b.data); setBookings(k.data);
    } catch (e) { setError(getErrorMessage(e)); }
  }
  useEffect(() => { load(); }, []);
  async function addBus(e) {
    e.preventDefault(); setError(''); setNotice('');
    try { await api.post('/buses', { ...form, price: Number(form.price), totalSeats: Number(form.totalSeats), departureTime: new Date(form.departureTime).toISOString() }); setForm(initial); setNotice('Bus added.'); await load(); }
    catch (e) { setError(getErrorMessage(e)); }
  }
  async function remove(url, label) {
    if (!window.confirm(`Delete this ${label}?`)) return;
    try { await api.delete(url); setNotice(`${label} deleted.`); await load(); } catch (e) { setError(getErrorMessage(e)); }
  }
  const tabs = ['Overview', 'Add Bus', 'Buses', 'Bookings'];
  return <main className="mx-auto max-w-6xl px-4 py-10"><h1 className="text-3xl font-black">Admin dashboard</h1>
    <div className="mt-6 flex flex-wrap gap-2">{tabs.map(t => <button key={t} onClick={() => setTab(t)} className={`rounded-lg px-4 py-2 text-sm font-bold ${tab === t ? 'bg-slate-900 text-white' : 'bg-white'}`}>{t}</button>)}</div>
    {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}{notice && <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-emerald-700">{notice}</p>}
    {tab === 'Overview' && <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{[['Total buses',stats?.totalBuses],['Total bookings',stats?.totalBookings],['Confirmed',stats?.confirmed],['Cancelled',stats?.cancelled],['Revenue',money(stats?.revenue)]].map(([label,value]) => <div key={label} className="rounded-2xl border bg-white p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-black">{value ?? '—'}</p></div>)}</div>}
    {tab === 'Add Bus' && <form onSubmit={addBus} className="mt-6 grid max-w-2xl gap-4 rounded-2xl border bg-white p-6 sm:grid-cols-2">
      <label className="text-sm font-semibold sm:col-span-2">Company<input required value={form.company} onChange={e => setForm({...form,company:e.target.value})} className="mt-1 w-full rounded-lg border p-3" /></label>
      {['fromCity','toCity'].map(key => <label key={key} className="text-sm font-semibold">{key === 'fromCity' ? 'From' : 'To'}<input required value={form[key]} onChange={e => setForm({...form,[key]:e.target.value})} className="mt-1 w-full rounded-lg border p-3" /></label>)}
      <label className="text-sm font-semibold">Departure<input required type="datetime-local" value={form.departureTime} onChange={e => setForm({...form,departureTime:e.target.value})} className="mt-1 w-full rounded-lg border p-3" /></label>
      <label className="text-sm font-semibold">Price (FCFA)<input required type="number" min="0" value={form.price} onChange={e => setForm({...form,price:e.target.value})} className="mt-1 w-full rounded-lg border p-3" /></label>
      <label className="text-sm font-semibold">Total seats<input required type="number" min="1" value={form.totalSeats} onChange={e => setForm({...form,totalSeats:e.target.value})} className="mt-1 w-full rounded-lg border p-3" /></label>
      <button className="rounded-lg bg-yellow-400 p-3 font-bold sm:col-span-2">Add bus</button>
    </form>}
    {tab === 'Buses' && <div className="mt-6 space-y-3">{buses.map(b => <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-4"><div><b>{b.company}</b><p className="text-sm text-slate-500">{b.fromCity} → {b.toCity} · {new Date(b.departureTime).toLocaleString()} · {money(b.price)}</p></div><button onClick={() => remove(`/admin/buses/${b.id}`,'bus')} className="text-sm font-bold text-red-600">Delete</button></div>)}</div>}
    {tab === 'Bookings' && <div className="mt-6 space-y-3">{bookings.map(b => <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-4"><div><b>{b.bookingRef} · {b.user?.name || 'User'}</b><p className="text-sm text-slate-500">{b.bus?.fromCity} → {b.bus?.toCity} · Seats {b.seats.join(', ')} · {money(b.totalPrice)} · {b.status}</p></div><button onClick={() => remove(`/admin/bookings/${b.id}`,'booking')} className="text-sm font-bold text-red-600">Delete</button></div>)}</div>}
  </main>;
}
