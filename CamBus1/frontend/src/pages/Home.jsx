import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Armchair, BusFront, CalendarDays, Clock3, MapPin, ShieldCheck, Sparkles } from 'lucide-react';

const cities = ['Yaoundé', 'Douala', 'Bafoussam', 'Garoua', 'Bamenda', 'Ngaoundéré', 'Kribi', 'Limbe', 'Bertoua', 'Maroua'];
const features = [
  { icon: BusFront, title: 'Find your route', description: 'Compare departures and choose a trip that fits your day.' },
  { icon: Armchair, title: 'Choose your seat', description: 'See seat availability and pick the spot you prefer.' },
  { icon: ShieldCheck, title: 'Book with ease', description: 'Keep your journey details together in one place.' }
];

export default function Home() {
  const [from, setFrom] = useState('Yaoundé');
  const [to, setTo] = useState('Douala');
  const [date, setDate] = useState('');
  const navigate = useNavigate();

  function submit(event) {
    event.preventDefault();
    if (from === to) return alert('Choose two different cities.');
    navigate(`/results?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}${date ? `&date=${date}` : ''}`);
  }

  return <main className="page-enter mx-auto max-w-7xl px-4 py-8 md:py-12">
    <section className="hero-panel px-5 py-7 md:px-10 md:py-12 xl:px-14">
      <div className="relative grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12">
        <div className="hero-copy">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-yellow-200">
            <Sparkles size={14} /> Travel across Cameroon
          </div>
          <h1 className="mt-6 max-w-2xl text-4xl font-black leading-[1.05] tracking-[-0.055em] md:text-6xl">
            Your next journey,
            <span className="mt-1 block animated-gradient-text">made easy.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 md:text-lg">
            Find a departure, choose your seat, and get on your way. Your next great trip starts with a few simple steps.
          </p>

          <form onSubmit={submit} className="search-panel mt-8 grid gap-3 rounded-2xl bg-white p-4 text-slate-900 sm:grid-cols-2 md:p-5">
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">
              <span className="mb-1.5 flex items-center gap-1.5"><MapPin size={14} className="text-yellow-600" />From</span>
              <select className="p-3 text-sm font-medium normal-case tracking-normal" value={from} onChange={(event) => setFrom(event.target.value)}>
                {cities.map((city) => <option key={city}>{city}</option>)}
              </select>
            </label>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">
              <span className="mb-1.5 flex items-center gap-1.5"><MapPin size={14} className="text-yellow-600" />To</span>
              <select className="p-3 text-sm font-medium normal-case tracking-normal" value={to} onChange={(event) => setTo(event.target.value)}>
                {cities.map((city) => <option key={city}>{city}</option>)}
              </select>
            </label>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">
              <span className="mb-1.5 flex items-center gap-1.5"><CalendarDays size={14} className="text-yellow-600" />Travel date</span>
              <input type="date" min={new Date().toISOString().slice(0, 10)} value={date} onChange={(event) => setDate(event.target.value)} className="p-3 text-sm font-medium normal-case tracking-normal" />
            </label>
            <button className="primary-action mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-400 p-3.5 font-bold text-slate-950 hover:bg-yellow-300">
              Search buses <ArrowRight size={17} />
            </button>
          </form>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-slate-300">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck size={15} className="text-yellow-300" />Simple, secure booking</span>
            <span className="inline-flex items-center gap-1.5"><Clock3 size={15} className="text-yellow-300" />Plan at your pace</span>
          </div>
        </div>

        <div className="hero-visual relative mx-auto w-full max-w-lg">
          <div className="floating-badge absolute -right-2 top-1 z-10 inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white px-4 py-3 text-sm font-bold text-slate-800 shadow-xl sm:-right-4 sm:top-5">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-yellow-100 text-yellow-700"><BusFront size={17} /></span>
            10 destinations
          </div>
          <div className="hero-route-card rounded-[1.8rem] p-5 pt-14 sm:p-7 sm:pt-16">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-200">Trip preview</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">Your route, your way.</h2>
              </div>
              <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-[11px] font-bold text-emerald-200">FLEXIBLE SEARCH</span>
            </div>

            <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-2xl bg-slate-950/20 p-4 sm:p-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-300">From</p>
                <p className="mt-1 truncate text-base font-bold text-white sm:text-lg">{from}</p>
              </div>
              <div className="relative flex w-12 items-center justify-center">
                <span className="absolute h-px w-full border-t border-dashed border-yellow-200/70" />
                <span className="relative grid h-8 w-8 place-items-center rounded-full bg-yellow-400 text-slate-900 shadow-lg"><ArrowRight size={15} /></span>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-300">To</p>
                <p className="mt-1 truncate text-base font-bold text-white sm:text-lg">{to}</p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-5">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-yellow-200"><CalendarDays size={18} /></span>
                <div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300">Travel date</p><p className="mt-0.5 text-sm font-semibold text-white">{date ? new Date(`${date}T12:00:00`).toLocaleDateString() : 'Choose when to go'}</p></div>
              </div>
              <span className="hidden text-xs font-medium text-slate-300 sm:inline">CamBus · Cameroon</span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-300" /> Select a route to get started
          </div>
        </div>
      </div>
    </section>

    <section className="mt-10 md:mt-14">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-700">A smoother trip</p><h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Travel, made simple</h2></div>
        <p className="max-w-md text-sm leading-6 text-slate-500">Everything you need to plan and manage your next bus journey.</p>
      </div>
      <div className="stagger-grid grid gap-4 md:grid-cols-3">
        {features.map(({ icon: Icon, title, description }, index) => <article key={title} className="feature-card rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm" style={{ '--stagger-index': index }}>
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-yellow-50 text-yellow-700"><Icon size={20} /></span>
          <h3 className="mt-5 text-base font-bold text-slate-900">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
        </article>)}
      </div>
    </section>
  </main>;
}
