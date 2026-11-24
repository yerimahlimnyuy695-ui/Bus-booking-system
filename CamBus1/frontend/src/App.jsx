import { Link, NavLink, Navigate, Route, Routes } from 'react-router-dom';
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
  const linkClass = ({ isActive }) => `text-sm font-semibold ${isActive ? 'text-yellow-500' : 'text-slate-600 hover:text-slate-950'}`;
  return <div className="min-h-screen">
    <header className="border-b bg-white"><nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
      <Link to="/" className="text-xl font-black tracking-tight">Cam<span className="text-yellow-500">Bus</span></Link>
      <div className="flex flex-wrap items-center gap-5"><NavLink to="/" className={linkClass}>Search</NavLink>
        {user && <NavLink to="/my-bookings" className={linkClass}>My Bookings</NavLink>}
        {user && <NavLink to="/admin" className={({isActive}) => `text-sm font-bold ${isActive ? 'text-yellow-600' : 'text-yellow-500'}`}>Admin</NavLink>}
        {user ? <><span className="hidden text-sm text-slate-500 sm:inline">{user.name}</span><button onClick={logout} className="text-sm font-semibold text-slate-600">Logout</button></> : <NavLink to="/auth" className={linkClass}>Login / Register</NavLink>}
      </div>
    </nav></header>
    <Routes>
      <Route path="/" element={<Home />} /><Route path="/results" element={<Results />} /><Route path="/buses/:id" element={<Seats />} /><Route path="/seats/:id" element={<Seats />} /><Route path="/auth" element={<Auth />} /><Route path="/login" element={<Auth />} /><Route path="/register" element={<Auth />} />
      <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    <footer className="mt-16 border-t bg-white py-6 text-center text-xs text-slate-400">CamBus · Student project demo · No real payments</footer>
  </div>;
}
export default function App() { return <AuthProvider><Layout /></AuthProvider>; }
