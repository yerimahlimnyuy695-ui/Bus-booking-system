import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, BusFront, ShieldCheck } from 'lucide-react';
import SeatLayout from '../components/SeatLayout.jsx';
import api, { getErrorMessage } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const money = (value) => `${Number(value).toLocaleString()} FCFA`;
export default function Seats() {
  const { id } = useParams(), navigate = useNavigate(), { user } = useAuth();
  const [bus, setBus] = useState(null), [selected, setSelected] = useState([]);
  const [passengerName, setPassengerName] = useState(user?.name || ''), [phone, setPhone] = useState('');
  const [error, setError] = useState(''), [saving, setSaving] = useState(false);
  useEffect(() => { api.get(`/buses/${id}`).then(({ data }) => setBus(data)).catch(e => setError(getErrorMessage(e))); }, [id]);
  async function book(event) {
    event.preventDefault(); setError('');
    if (!user) return navigate('/auth');
    if (!selected.length) return setError('Select at least one seat.');
    setSaving(true);
    try {
      const { data } = await api.post('/bookings', { busId: id, seats: selected, passengerName, phone });
      navigate('/my-bookings', { state: { message: `Booking confirmed: ${data.bookingRef}` } });
    } catch (e) { setError(getErrorMessage(e)); }
    finally { setSaving(false); }
  }
  if (!bus) return <main className="page-enter mx-auto max-w-5xl px-4 py-10">{error || <p className="inline-flex items-center gap-2 text-sm text-slate-500"><span className="h-4 w-4 animate-spin rounded-full border-2 border-yellow-500 border-t-transparent" />Loading bus…</p>}</main>;
  return <main className="page-enter mx-auto grid max-w-7xl gap-6 px-4 py-8 md:py-12 lg:grid-cols-[1fr_390px]">
    <section><div className="mb-5 flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-700"><BusFront size={21} /></span><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-yellow-700">Choose your seat</p><h1 className="text-2xl font-black tracking-tight">{bus.fromCity} <span className="text-yellow-600">→</span> {bus.toCity}</h1></div></div><p className="mb-5 ml-14 -mt-3 text-sm text-slate-500">{bus.company} · {new Date(bus.departureTime).toLocaleString()}</p>
      <SeatLayout totalSeats={bus.totalSeats} takenSeats={bus.takenSeats} selectedSeats={selected} onChange={setSelected} /></section>
    <form onSubmit={book} className="dashboard-panel h-fit p-5 md:sticky md:top-24 md:p-6"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-yellow-700">Almost there</p><h2 className="mt-1 text-xl font-black">Trip details</h2></div><span className="grid h-10 w-10 place-items-center rounded-xl bg-yellow-50 text-yellow-700"><ShieldCheck size={19} /></span></div>
      <label className="auth-field mt-5 block text-sm font-semibold">Passenger name<input required value={passengerName} onChange={e => setPassengerName(e.target.value)} className="mt-2 p-3 text-sm" /></label>
      <label className="auth-field mt-4 block text-sm font-semibold">Phone number<input required value={phone} onChange={e => setPhone(e.target.value)} className="mt-2 p-3 text-sm" /></label>
      <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm"><p className="flex justify-between gap-3"><span className="text-slate-500">Selected seats</span><b className="text-right">{selected.join(', ') || 'None'}</b></p><p className="mt-3 flex justify-between"><span className="text-slate-500">Price per seat</span><b>{money(bus.price)}</b></p><p className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-lg"><span className="font-semibold">Total</span><b>{money(bus.price * selected.length)}</b></p></div>
      {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button disabled={saving} className="primary-action mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 p-3.5 font-bold text-slate-950 disabled:opacity-60">{saving ? 'Confirming…' : 'Confirm booking'} {!saving && <ArrowRight size={17} />}</button>
      <p className="mt-3 text-center text-xs text-slate-500">Demo checkout only. No payment is collected.</p>
    </form>
  </main>;
}
