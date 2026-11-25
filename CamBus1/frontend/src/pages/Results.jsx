import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, BusFront, CalendarDays, Clock3, MapPin, Search } from 'lucide-react';
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
  return <main className="page-enter mx-auto max-w-6xl px-4 py-8 md:py-12">
    <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div><span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-yellow-800"><Search size={13} /> Your search</span>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">Available buses</h1>
        <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500"><span className="inline-flex items-center gap-1"><MapPin size={14} />{from}</span><ArrowRight size={14} className="text-yellow-600" /><span>{to}</span>{date && <span className="ml-1 inline-flex items-center gap-1"><CalendarDays size={14} />{date}</span>}</p>
      </div>
      <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-500 shadow-sm sm:flex"><BusFront size={17} className="text-yellow-600" /> Find the right departure for you</div>
    </header>
    {loading && <p className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500"><span className="h-4 w-4 animate-spin rounded-full border-2 border-yellow-500 border-t-transparent" />Finding available buses…</p>}
    {error && <p role="alert" className="mt-8 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {!loading && !error && buses.length === 0 && <div className="mt-8 rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm"><BusFront className="mx-auto text-slate-300" size={34} /><h2 className="mt-4 text-lg font-bold text-slate-800">No buses found</h2><p className="mt-1 text-sm text-slate-500">Try another date or route to see more departures.</p></div>}
    <div className="stagger-grid mt-6 space-y-4">{buses.map((bus, index) => <article key={bus.id} className="route-result-card flex flex-col justify-between gap-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm md:flex-row md:items-center md:p-6" style={{ '--stagger-index': index }}>
      <div className="flex items-start gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-700"><BusFront size={22} /></span><div><p className="text-sm font-bold text-slate-500">{bus.company}</p><p className="mt-1 text-lg font-bold text-slate-950">{bus.fromCity} <span className="mx-1 text-yellow-600">→</span> {bus.toCity}</p><p className="mt-1 inline-flex items-center gap-1.5 text-sm text-slate-500"><Clock3 size={14} />{new Date(bus.departureTime).toLocaleString()}</p></div></div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0"><div><p className="text-xl font-black text-slate-950">{money(bus.price)}</p><p className="mt-1 text-xs font-medium text-slate-500">{bus.totalSeats} seats</p></div>
        <Link to={`/seats/${bus.id}`} className="primary-action inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white">Select seats <ArrowRight size={16} /></Link>
      </div>
    </article>)}</div>
  </main>;
}
