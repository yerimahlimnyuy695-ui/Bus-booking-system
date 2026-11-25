import { Link, NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { BusFront, LogOut } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Results from './pages/Results.jsx';
import Seats from './pages/Seats.jsx';
import MyBookings from './pages/MyBookings.jsx';
import Auth from './pages/Auth.jsx';
import Admin from './pages/Admin.jsx';

function Layout() {
  const { user, logout } = useAuth();
  const linkClass = ({ isActive }) => `nav-link text-sm font-semibold ${isActive ? 'text-slate-950' : 'text-slate-600 hover:text-slate-950'}`;
  return <div className="min-h-screen">
    <header className="site-header"><nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3">
      <Link to="/" className="brand-mark text-xl font-black tracking-tight"><span className="brand-icon"><BusFront size={19} /></span><span>Cam<span className="text-yellow-500">Bus</span></span></Link>
      <div className="flex flex-wrap items-center gap-5"><NavLink to="/" className={linkClass}>Search</NavLink>
        {user && <NavLink to="/my-bookings" className={linkClass}>My Bookings</NavLink>}
        {user && <NavLink to="/admin" className={({isActive}) => `nav-link text-sm font-bold ${isActive ? 'text-yellow-700' : 'text-yellow-600'}`}>Admin</NavLink>}
        {user ? <><span className="hidden rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 sm:inline">{user.name}</span><button onClick={logout} className="nav-action inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600"><LogOut size={15} />Logout</button></> : <NavLink to="/auth" className={linkClass}>Login / Register</NavLink>}
      </div>
    </nav></header>
    <Routes>
      <Route path="/" element={<Home />} /><Route path="/results" element={<Results />} /><Route path="/buses/:id" element={<Seats />} /><Route path="/seats/:id" element={<Seats />} /><Route path="/auth" element={<Auth />} /><Route path="/login" element={<Auth />} /><Route path="/register" element={<Auth />} />
      <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    <footer className="relative mt-16 border-t border-slate-200/80 bg-white/70 py-7 text-center text-xs text-slate-400"><span className="footer-glow absolute inset-x-0 top-0 h-px" />CamBus · Travel made simple · No real payments</footer>
  </div>;
}
export default function App() { return <AuthProvider><Layout /></AuthProvider>; }
