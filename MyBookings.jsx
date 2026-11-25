import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api.js';
import { jsPDF } from 'jspdf';

const money = (value) => `${Number(value).toLocaleString()} FCFA`;
export default function MyBookings() {
  const [bookings, setBookings] = useState([]), [error, setError] = useState('');
  const location = useLocation();
  async function load() { try { const { data } = await api.get('/bookings/my'); setBookings(data); } catch (e) { setError(getErrorMessage(e)); } }
  useEffect(() => { load(); }, []);
  function downloadTicket(b) {
    if (b.status !== 'confirmed') return;
    const doc = new jsPDF({ unit: 'mm', format: 'a5' });
    doc.setFillColor(15, 31, 56); doc.rect(0, 0, 148, 210, 'F');
    doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(22);
    doc.text('CamBus', 14, 20); doc.setFontSize(10); doc.setFont('helvetica','normal');
    doc.text('PASSENGER E-TICKET', 14, 29);
    doc.setDrawColor(245, 184, 0); doc.line(14, 36, 134, 36);
    doc.setFontSize(9); doc.setTextColor(245,184,0); doc.text('BOOKING REFERENCE',14,48);
    doc.setFontSize(16); doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.text(String(b.bookingRef),14,57);
    doc.setFont('helvetica','normal'); doc.setFontSize(10);
    const rows = [
      ['Passenger', b.passengerName], ['Phone', b.phone], ['Company', b.bus.company],
      ['From', b.bus.fromCity], ['To', b.bus.toCity],
      ['Departure', new Date(b.bus.departureTime).toLocaleString()],
      ['Seats', (b.seats || []).join(', ')], ['Total', `${Number(b.totalPrice).toLocaleString()} FCFA`],
      ['Status', b.status.toUpperCase()]
    ];
    let y=72;
    rows.forEach(([label,value]) => { doc.setTextColor(190,204,220); doc.text(label.toUpperCase(),14,y); doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.text(String(value ?? '—').slice(0,55),60,y); doc.setFont('helvetica','normal'); y+=13; });
    doc.setDrawColor(245,184,0); doc.line(14, y+2, 134, y+2); doc.setFontSize(8); doc.setTextColor(190,204,220);
    doc.text('Please arrive early and keep this ticket for boarding.',14,y+12);
    doc.save(`CamBus-${b.bookingRef}.pdf`);
  }
  async function cancel(id) {
    if (!window.confirm('Cancel this booking?')) return;
    try { await api.delete(`/bookings/${id}`); await load(); } catch (e) { setError(getErrorMessage(e)); }
  }
  return <main className="mx-auto max-w-5xl px-4 py-10"><h1 className="text-3xl font-black">My bookings</h1>
    {location.state?.message && <p className="mt-4 rounded-lg bg-emerald-100 p-3 text-emerald-800">{location.state.message}</p>}
    {error && <p className="mt-4 text-red-600">{error}</p>}
    <div className="mt-6 space-y-4">{bookings.map(b => <article key={b.id} className="rounded-2xl border bg-white p-5">
      <div className="flex flex-wrap justify-between gap-3"><div><p className="font-black">{b.bookingRef}</p><p className="mt-1">{b.bus.fromCity} → {b.bus.toCity}</p><p className="text-sm text-slate-500">{b.bus.company} · {new Date(b.bus.departureTime).toLocaleString()}</p></div>
      <span className={`h-fit rounded-full px-3 py-1 text-xs font-bold ${b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{b.status}</span></div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4 text-sm"><span>Seats: <b>{b.seats.join(', ')}</b></span><span>Total: <b>{money(b.totalPrice)}</b></span>
      {b.status === 'confirmed' && <button onClick={() => downloadTicket(b)} className="rounded-lg bg-yellow-400 px-4 py-2 font-bold text-slate-950">Download ticket (PDF)</button>}
      {b.status === 'confirmed' && <button onClick={() => cancel(b.id)} className="rounded-lg border border-red-200 px-4 py-2 font-semibold text-red-600">Cancel</button>}</div>
    </article>)}</div>
    {bookings.length === 0 && !error && <p className="mt-8 rounded-xl bg-white p-8 text-center text-slate-500">You have no bookings yet.</p>}
  </main>;
}
