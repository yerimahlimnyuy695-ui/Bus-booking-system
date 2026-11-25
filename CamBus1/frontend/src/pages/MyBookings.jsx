import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Armchair, ArrowRight, BusFront, Download, Ticket } from 'lucide-react';
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
  return <main className="page-enter mx-auto max-w-6xl px-4 py-8 md:py-12">
    <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div><span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-yellow-800"><Ticket size={13} /> Your travel plans</span><h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">My bookings</h1><p className="mt-2 text-sm text-slate-500">Your trips and ticket details, all in one place.</p></div>
      <span className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-500 shadow-sm sm:flex"><BusFront size={17} className="text-yellow-600" />Ready for the road</span>
    </header>
    {location.state?.message && <p role="status" className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">{location.state.message}</p>}
    {error && <p role="alert" className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    <div className="stagger-grid mt-6 space-y-4">{bookings.map((b, index) => <article key={b.id} className="booking-card rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm md:p-6" style={{ '--stagger-index': index }}>
      <div className="flex flex-wrap justify-between gap-3"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700"><Ticket size={19} /></span><div><p className="font-black tracking-wide text-slate-950">{b.bookingRef}</p><p className="mt-1 text-lg font-bold">{b.bus.fromCity} <span className="text-yellow-600">→</span> {b.bus.toCity}</p><p className="mt-1 text-sm text-slate-500">{b.bus.company} · {new Date(b.bus.departureTime).toLocaleString()}</p></div></div>
      <span className={`h-fit rounded-full px-3 py-1 text-xs font-bold ${b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{b.status}</span></div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4 text-sm">
        <div className="flex flex-wrap gap-x-6 gap-y-2"><span className="inline-flex items-center gap-1.5 text-slate-500"><Armchair size={15} />Seats <b className="text-slate-800">{b.seats.join(', ')}</b></span><span className="text-slate-500">Total <b className="text-slate-900">{money(b.totalPrice)}</b></span></div>
        <div className="flex flex-wrap gap-2">
          {b.status === 'confirmed' && <button onClick={() => downloadTicket(b)} className="primary-action inline-flex items-center gap-2 rounded-lg bg-yellow-400 px-4 py-2.5 font-bold text-slate-950"><Download size={15} />Download ticket</button>}
          {b.status === 'confirmed' && <button onClick={() => cancel(b.id)} className="rounded-lg border border-red-200 px-4 py-2.5 font-semibold text-red-600 transition hover:bg-red-50">Cancel</button>}
        </div>
      </div>
    </article>)}</div>
    {bookings.length === 0 && !error && <div className="dashboard-panel mt-8 px-6 py-14 text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-500"><BusFront size={26} /></span><h2 className="mt-4 text-lg font-bold text-slate-800">No trips booked yet</h2><p className="mt-1 text-sm text-slate-500">Search a route and your confirmed bookings will show up here.</p><Link to="/" className="primary-action mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white">Find a bus <ArrowRight size={15} /></Link></div>}
  </main>;
}
