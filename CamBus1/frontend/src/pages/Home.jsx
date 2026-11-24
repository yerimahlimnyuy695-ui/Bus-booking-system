import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const cities = ['Yaoundé', 'Douala', 'Bafoussam', 'Garoua', 'Bamenda', 'Ngaoundéré', 'Kribi', 'Limbe', 'Bertoua', 'Maroua'];
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
  return <div className="mx-auto max-w-6xl px-4 py-12">
    <section className="overflow-hidden rounded-3xl bg-slate-900 px-6 py-14 text-white md:px-12">
      <p className="mb-3 text-sm font-bold uppercase tracking-[.25em] text-yellow-400">Travel across Cameroon</p>
      <h1 className="max-w-2xl text-4xl font-black leading-tight md:text-6xl">Your next journey starts here.</h1>
      <p className="mt-4 max-w-xl text-slate-300">Find your bus, choose your seat, and book your trip in minutes.</p>
      <form onSubmit={submit} className="mt-9 grid gap-3 rounded-2xl bg-white p-4 text-slate-900 md:grid-cols-4">
        <label className="text-xs font-bold uppercase text-slate-500">From<select className="mt-2 w-full rounded-lg border p-3 text-sm" value={from} onChange={(e) => setFrom(e.target.value)}>{cities.map(c => <option key={c}>{c}</option>)}</select></label>
        <label className="text-xs font-bold uppercase text-slate-500">To<select className="mt-2 w-full rounded-lg border p-3 text-sm" value={to} onChange={(e) => setTo(e.target.value)}>{cities.map(c => <option key={c}>{c}</option>)}</select></label>
        <label className="text-xs font-bold uppercase text-slate-500">Travel date<input type="date" min={new Date().toISOString().slice(0,10)} value={date} onChange={(e) => setDate(e.target.value)} className="mt-2 w-full rounded-lg border p-3 text-sm" /></label>
        <button className="self-end rounded-lg bg-yellow-400 p-3 font-bold text-slate-900 hover:bg-yellow-300">Search buses</button>
      </form>
    </section>
    <div className="mt-8 grid gap-4 md:grid-cols-3">{[['Simple booking','Choose your route and departure.'],['Pick your seat','See available seats before you book.'],['Booking details','Keep track of your bookings in one place.']].map(([title,desc]) => <div key={title} className="rounded-2xl border bg-white p-5"><h3 className="font-bold">{title}</h3><p className="mt-2 text-sm text-slate-500">{desc}</p></div>)}</div>
  </div>;
}
