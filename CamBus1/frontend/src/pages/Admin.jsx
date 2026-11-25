import { useEffect, useState } from 'react';
import { BusFront, CircleCheck, CircleX, LayoutDashboard, Plus, Ticket, Trash2, Wallet } from 'lucide-react';
import api, { getErrorMessage } from '../services/api.js';

const money = (amount) => `${Number(amount || 0).toLocaleString()} FCFA`;
const initial = { company: '', fromCity: 'Yaoundé', toCity: 'Douala', departureTime: '', price: 5000, totalSeats: 40 };
const tabs = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Add Bus', icon: Plus },
  { label: 'Buses', icon: BusFront },
  { label: 'Bookings', icon: Ticket }
];

export default function Admin() {
  const [tab, setTab] = useState('Overview');
  const [stats, setStats] = useState(null);
  const [buses, setBuses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function load() {
    try {
      const [statsResponse, busesResponse, bookingsResponse] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/buses'),
        api.get('/admin/bookings')
      ]);
      setStats(statsResponse.data);
      setBuses(busesResponse.data);
      setBookings(bookingsResponse.data);
      setError('');
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  useEffect(() => { load(); }, []);

  async function addBus(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    try {
      await api.post('/buses', {
        ...form,
        price: Number(form.price),
        totalSeats: Number(form.totalSeats),
        departureTime: new Date(form.departureTime).toISOString()
      });
      setForm(initial);
      setNotice('Bus added successfully.');
      await load();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  async function remove(url, label) {
    if (!window.confirm(`Delete this ${label}?`)) return;
    setError('');
    setNotice('');
    try {
      await api.delete(url);
      setNotice(`${label[0].toUpperCase()}${label.slice(1)} deleted.`);
      await load();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  const cards = [
    { label: 'Total buses', value: stats?.totalBuses, icon: BusFront, color: 'bg-blue-50 text-blue-700' },
    { label: 'Total bookings', value: stats?.totalBookings, icon: Ticket, color: 'bg-violet-50 text-violet-700' },
    { label: 'Confirmed', value: stats?.confirmed, icon: CircleCheck, color: 'bg-emerald-50 text-emerald-700' },
    { label: 'Cancelled', value: stats?.cancelled, icon: CircleX, color: 'bg-rose-50 text-rose-700' },
    { label: 'Revenue', value: money(stats?.revenue), icon: Wallet, color: 'bg-amber-50 text-amber-700' }
  ];

  return <main className="page-enter mx-auto max-w-7xl px-4 py-8 md:py-12">
    <section className="dashboard-hero px-6 py-7 md:px-9 md:py-8">
      <div className="relative z-10 flex flex-wrap items-end justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-yellow-200">
            <LayoutDashboard size={14} /> Operations
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Admin dashboard</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">A clear view of your routes, reservations, and day-to-day operations.</p>
        </div>
        <div className="hidden items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-slate-200 sm:flex">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-yellow-400 text-slate-950"><BusFront size={19} /></span>
          CamBus <span className="text-slate-400">/</span> Admin
        </div>
      </div>
    </section>

    {error && <p role="alert" className="mt-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-700">{error}</p>}
    {notice && <p role="status" className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">{notice}</p>}

    <div className="mt-7 flex justify-start">
      <div className="dashboard-tabs" role="tablist" aria-label="Admin dashboard sections">
        {tabs.map(({ label, icon: Icon }) => <button key={label} type="button" role="tab" aria-selected={tab === label} onClick={() => setTab(label)} className="dashboard-tab inline-flex items-center justify-center gap-2">
          <Icon size={16} />{label}
        </button>)}
      </div>
    </div>

    {tab === 'Overview' && <section className="mt-6">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[0.15em] text-yellow-700">At a glance</p><h2 className="mt-1 text-xl font-black tracking-tight text-slate-900">Your business overview</h2></div>
        <p className="text-xs font-medium text-slate-400">Live account totals</p>
      </div>
      <div className="stagger-grid grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map(({ label, value, icon: Icon, color }, index) => <article key={label} className="dashboard-stat rounded-2xl p-5" style={{ '--stagger-index': index }}>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-slate-500">{label}</span>
            <span className={`grid h-10 w-10 place-items-center rounded-xl ${color}`}><Icon size={19} /></span>
          </div>
          <p className={`mt-5 font-black tracking-tight text-slate-950 ${label === 'Revenue' ? 'text-2xl' : 'text-3xl'}`}>{value ?? '—'}</p>
          <div className="mt-4 h-1 overflow-hidden rounded-full bg-slate-100"><span className="block h-full w-2/3 rounded-full bg-gradient-to-r from-yellow-300 to-yellow-500" /></div>
        </article>)}
      </div>
    </section>}

    {tab === 'Add Bus' && <section className="dashboard-panel page-enter mt-6 max-w-3xl p-5 md:p-8">
      <div className="mb-6 flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-yellow-50 text-yellow-700"><Plus size={21} /></span>
        <div><h2 className="text-xl font-black text-slate-950">Add a departure</h2><p className="mt-1 text-sm text-slate-500">Enter the route and schedule details for the new bus.</p></div>
      </div>
      <form onSubmit={addBus} className="grid gap-4 sm:grid-cols-2">
        <label className="auth-field text-sm font-semibold text-slate-700 sm:col-span-2">Company
          <input required value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} className="mt-2 p-3 text-sm" placeholder="Bus company" />
        </label>
        {['fromCity', 'toCity'].map((key) => <label key={key} className="auth-field text-sm font-semibold text-slate-700">{key === 'fromCity' ? 'Departure city' : 'Destination'}
          <input required value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} className="mt-2 p-3 text-sm" />
        </label>)}
        <label className="auth-field text-sm font-semibold text-slate-700">Departure time
          <input required type="datetime-local" value={form.departureTime} onChange={(event) => setForm({ ...form, departureTime: event.target.value })} className="mt-2 p-3 text-sm" />
        </label>
        <label className="auth-field text-sm font-semibold text-slate-700">Price (FCFA)
          <input required type="number" min="0" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} className="mt-2 p-3 text-sm" />
        </label>
        <label className="auth-field text-sm font-semibold text-slate-700">Total seats
          <input required type="number" min="1" value={form.totalSeats} onChange={(event) => setForm({ ...form, totalSeats: event.target.value })} className="mt-2 p-3 text-sm" />
        </label>
        <button className="primary-action mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 p-3.5 font-bold text-white sm:col-span-2"><Plus size={17} />Add bus</button>
      </form>
    </section>}

    {tab === 'Buses' && <section className="dashboard-panel page-enter mt-6 overflow-hidden">
      <div className="border-b border-slate-100 px-5 py-5 md:px-6">
        <h2 className="text-lg font-black text-slate-950">Scheduled buses <span className="ml-1 text-sm font-semibold text-slate-400">({buses.length})</span></h2>
        <p className="mt-1 text-sm text-slate-500">Manage the departures available to passengers.</p>
      </div>
      {buses.length ? <div className="divide-y divide-slate-100">{buses.map((bus) => <div key={bus.id} className="dashboard-row flex flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700"><BusFront size={19} /></span>
          <div className="min-w-0"><p className="truncate font-bold text-slate-900">{bus.company}</p><p className="mt-0.5 text-sm text-slate-500">{bus.fromCity} <span className="mx-1 text-yellow-600">→</span> {bus.toCity} · {new Date(bus.departureTime).toLocaleString()}</p></div>
        </div>
        <div className="flex items-center gap-4"><span className="text-sm font-bold text-slate-800">{money(bus.price)}</span><button type="button" aria-label={`Delete ${bus.company} bus`} onClick={() => remove(`/admin/buses/${bus.id}`, 'bus')} className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"><Trash2 size={17} /></button></div>
      </div>)}</div> : <div className="px-6 py-14 text-center"><BusFront className="mx-auto text-slate-300" size={30} /><p className="mt-3 font-semibold text-slate-700">No buses yet</p><p className="mt-1 text-sm text-slate-500">Add a departure to make it available to passengers.</p></div>}
    </section>}

    {tab === 'Bookings' && <section className="dashboard-panel page-enter mt-6 overflow-hidden">
      <div className="border-b border-slate-100 px-5 py-5 md:px-6">
        <h2 className="text-lg font-black text-slate-950">Passenger bookings <span className="ml-1 text-sm font-semibold text-slate-400">({bookings.length})</span></h2>
        <p className="mt-1 text-sm text-slate-500">Review reservations and booking details.</p>
      </div>
      {bookings.length ? <div className="divide-y divide-slate-100">{bookings.map((booking) => <div key={booking.id} className="dashboard-row flex flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-700"><Ticket size={19} /></span>
          <div className="min-w-0"><p className="truncate font-bold text-slate-900">{booking.bookingRef} <span className="font-medium text-slate-500">· {booking.user?.name || 'Passenger'}</span></p><p className="mt-0.5 truncate text-sm text-slate-500">{booking.bus?.fromCity} → {booking.bus?.toCity} · Seats {booking.seats.join(', ')} · {money(booking.totalPrice)}</p></div>
        </div>
        <div className="flex items-center gap-3"><span className={`rounded-full px-3 py-1 text-xs font-bold ${booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{booking.status}</span><button type="button" aria-label={`Delete booking ${booking.bookingRef}`} onClick={() => remove(`/admin/bookings/${booking.id}`, 'booking')} className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"><Trash2 size={17} /></button></div>
      </div>)}</div> : <div className="px-6 py-14 text-center"><Ticket className="mx-auto text-slate-300" size={30} /><p className="mt-3 font-semibold text-slate-700">No bookings yet</p><p className="mt-1 text-sm text-slate-500">Passenger reservations will appear here.</p></div>}
    </section>}
  </main>;
}
