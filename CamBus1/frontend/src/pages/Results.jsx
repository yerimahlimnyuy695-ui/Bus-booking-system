import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api.js';

const money = (value) => `${Number(value).toLocaleString()} FCFA`;
export default function Results() {
  const [params] = useSearchParams();
  const from = params.get('from') || '', to = params.get('to') || '', date = params.get('date') || '';
  const [buses, setBuses] = useState([]), [error, setError] = useState(''), [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true); setError('');
    api.get('/buses/search', { params: { from, to, ...(date ? { date } : {}) } })
      .then(({ data }) => setBuses(data)).catch((e) => setError(getErrorMessage(e))).finally(() => setLoading(false));
  }, [from, to, date]);
  return <main className="mx-auto max-w-5xl px-4 py-10">
    <h1 className="text-3xl font-black">Available buses</h1><p className="mt-2 text-slate-500">{from} → {to}{date ? ` · ${date}` : ''}</p>
    {loading && <p className="mt-8">Loading buses…</p>}{error && <p className="mt-8 text-red-600">{error}</p>}
    {!loading && !error && buses.length === 0 && <div className="mt-8 rounded-xl bg-white p-8 text-center">No buses found for this route and date.</div>}
    <div className="mt-6 space-y-4">{buses.map(bus => <article key={bus.id} className="flex flex-col justify-between gap-5 rounded-2xl border bg-white p-5 md:flex-row md:items-center">
      <div><p className="font-bold">{bus.company}</p><p className="mt-1 text-lg font-semibold">{bus.fromCity} → {bus.toCity}</p><p className="mt-1 text-sm text-slate-500">{new Date(bus.departureTime).toLocaleString()}</p></div>
      <div><p className="text-xl font-black">{money(bus.price)}</p><p className="text-xs text-slate-500">{bus.totalSeats} seats</p></div>
      <Link to={`/seats/${bus.id}`} className="rounded-lg bg-slate-900 px-5 py-3 text-center font-bold text-white">Select Seats</Link>
    </article>)}</div>
  </main>;
}
