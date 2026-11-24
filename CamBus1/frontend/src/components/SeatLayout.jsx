import { useMemo } from 'react';

const rows = ['A', 'B', 'C', 'D'];
export default function SeatLayout({ totalSeats = 40, takenSeats = [], selectedSeats = [], onChange }) {
  const taken = useMemo(() => new Set(takenSeats), [takenSeats]);
  const selected = useMemo(() => new Set(selectedSeats), [selectedSeats]);
  const seatNames = rows.flatMap((row) => Array.from({ length: 10 }, (_, i) => `${row}${i + 1}`)).slice(0, totalSeats);

  function toggle(seat) {
    if (taken.has(seat)) return;
    onChange(selected.has(seat) ? selectedSeats.filter((item) => item !== seat) : [...selectedSeats, seat]);
  }

  return <div className="rounded-2xl border bg-white p-5">
    <div className="mx-auto mb-5 max-w-xs rounded-t-[3rem] border-2 border-slate-300 bg-slate-50 px-5 py-3 text-center text-xs font-bold uppercase tracking-widest text-slate-500">Front / Driver</div>
    <div className="mx-auto grid max-w-sm grid-cols-[1fr_1fr_20px_1fr_1fr] gap-2">
      {seatNames.map((seat) => {
        const isTaken = taken.has(seat), isSelected = selected.has(seat);
        const style = isTaken ? 'bg-red-500 text-white cursor-not-allowed' : isSelected ? 'bg-blue-600 text-white' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200';
        return <button key={seat} type="button" disabled={isTaken} onClick={() => toggle(seat)}
          className={`${style} rounded-lg py-3 text-xs font-bold transition ${seat[0] === 'A' || seat[0] === 'C' ? 'col-start-1' : ''}`}
          style={{ gridColumn: seat[0] === 'A' ? 1 : seat[0] === 'B' ? 2 : seat[0] === 'C' ? 4 : 5, gridRow: Number(seat.slice(1)) }}>
          {seat}
        </button>;
      })}
      <div className="col-start-3 row-span-10 flex items-center justify-center text-[10px] text-slate-300 [writing-mode:vertical-rl]">AISLE</div>
    </div>
    <div className="mt-5 flex flex-wrap justify-center gap-4 text-xs">
      <span><i className="mr-1 inline-block h-3 w-3 rounded bg-emerald-200" />Free</span>
      <span><i className="mr-1 inline-block h-3 w-3 rounded bg-blue-600" />Selected</span>
      <span><i className="mr-1 inline-block h-3 w-3 rounded bg-red-500" />Taken</span>
    </div>
  </div>;
}
