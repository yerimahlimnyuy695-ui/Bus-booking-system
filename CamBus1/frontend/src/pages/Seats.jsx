import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  if (!bus) return <main className="mx-auto max-w-5xl px-4 py-10">{error || 'Loading bus…'}</main>;
  return <main className="mx-auto grid max-w-6xl gap-6 px-4 py-10 lg:grid-cols-[1fr_380px]">
    <section><h1 className="text-2xl font-black">{bus.fromCity} → {bus.toCity}</h1><p className="mb-5 mt-1 text-slate-500">{bus.company} · {new Date(bus.departureTime).toLocaleString()}</p>
      <SeatLayout totalSeats={bus.totalSeats} takenSeats={bus.takenSeats} selectedSeats={selected} onChange={setSelected} /></section>
    <form onSubmit={book} className="h-fit rounded-2xl border bg-white p-6"><h2 className="text-xl font-bold">Checkout</h2>
      <label className="mt-5 block text-sm font-semibold">Passenger name<input required value={passengerName} onChange={e => setPassengerName(e.target.value)} className="mt-2 w-full rounded-lg border p-3" /></label>
      <label className="mt-4 block text-sm font-semibold">Phone number<input required value={phone} onChange={e => setPhone(e.target.value)} className="mt-2 w-full rounded-lg border p-3" /></label>
      <div className="mt-5 border-t pt-4 text-sm"><p>Selected seats: <b>{selected.join(', ') || 'None'}</b></p><p className="mt-2 flex justify-between"><span>Price per seat</span><b>{money(bus.price)}</b></p><p className="mt-3 flex justify-between text-lg"><span>Total</span><b>{money(bus.price * selected.length)}</b></p></div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <button disabled={saving} className="mt-5 w-full rounded-lg bg-yellow-400 p-3 font-bold disabled:opacity-60">{saving ? 'Confirming…' : 'Confirm Booking'}</button>
      <p className="mt-3 text-xs text-slate-500">Demo checkout only. No payment is collected.</p>
    </form>
  </main>;
}
