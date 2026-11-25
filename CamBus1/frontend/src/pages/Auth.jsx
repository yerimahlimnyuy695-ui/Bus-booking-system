import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Armchair, BusFront, MapPin, ShieldCheck, Sparkles } from 'lucide-react';
import api, { getErrorMessage } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Auth() {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isLogin = mode === 'login';

  async function submit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post(`/auth/${mode}`, { name, email, password });
      login(data);
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  return <main className="page-enter px-4 py-8 md:py-12">
    <div className="auth-layout">
      <section className="auth-showcase">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-yellow-200">
            <Sparkles size={14} /> The journey starts here
          </div>
          <h1 key={mode} className="auth-title">
            <span className="auth-title-line">{isLogin ? 'Welcome back.' : 'Make room for'}</span>
            <span className="auth-title-line animated-gradient-text">{isLogin ? 'Your seat awaits.' : 'new journeys.'}</span>
          </h1>
          <p className="max-w-md text-base leading-7 text-slate-300">
            {isLogin
              ? 'Sign in and pick up right where your next adventure begins.'
              : 'Create your account to discover routes, choose your seat, and keep every trip close.'}
          </p>
        </div>

        <div className="auth-route-card relative z-10">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-yellow-400 text-slate-950"><BusFront size={22} /></span>
              <div><p className="text-sm font-bold text-white">CamBus travel</p><p className="mt-0.5 text-xs text-slate-300">Thoughtful journeys across Cameroon</p></div>
            </div>
            <span className="rounded-full bg-emerald-300/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-200">Ready when you are</span>
          </div>
          <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-t border-white/10 pt-5">
            <div><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Start</p><p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-white"><MapPin size={14} className="text-yellow-300" /> Your city</p></div>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-yellow-200"><ArrowRight size={15} /></span>
            <div className="text-right"><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Next</p><p className="mt-1 flex items-center justify-end gap-1.5 text-sm font-semibold text-white">Somewhere new <MapPin size={14} className="text-yellow-300" /></p></div>
          </div>
        </div>
        <div className="relative z-10 mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-300">
          <span className="inline-flex items-center gap-1.5"><ShieldCheck size={14} className="text-yellow-200" />Your account, your trips</span>
          <span className="inline-flex items-center gap-1.5"><Armchair size={14} className="text-yellow-200" />Choose your own seat</span>
        </div>
      </section>

      <section className="auth-form-card">
        <div className="mb-7">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-yellow-50 text-yellow-700"><BusFront size={22} /></span>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-yellow-700">{isLogin ? 'Passenger account' : 'Get started'}</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{isLogin ? 'Sign in' : 'Create account'}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">{isLogin ? 'Enter your details to continue your journey.' : 'A few details and you are ready to explore.'}</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {!isLogin && <label className="auth-field block text-sm font-semibold text-slate-700">Full name
            <input required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} className="mt-2 p-3.5 text-sm" placeholder="How should we address you?" />
          </label>}
          <label className="auth-field block text-sm font-semibold text-slate-700">Email address
            <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 p-3.5 text-sm" placeholder="you@example.com" />
          </label>
          <label className="auth-field block text-sm font-semibold text-slate-700">Password
            <input required minLength={6} type="password" autoComplete={isLogin ? 'current-password' : 'new-password'} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 p-3.5 text-sm" placeholder="At least 6 characters" />
          </label>
          {error && <p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-sm text-red-700">{error}</p>}
          <button disabled={loading} className="auth-submit inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 p-3.5 font-bold text-white disabled:opacity-60">
            {loading ? 'Please wait…' : isLogin ? 'Sign in to CamBus' : 'Create your account'} {!loading && <ArrowRight size={17} />}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs font-medium text-slate-400"><span className="h-px flex-1 bg-slate-200" />YOUR NEXT TRIP IS CLOSER<span className="h-px flex-1 bg-slate-200" /></div>
        <button type="button" onClick={() => { setMode(isLogin ? 'register' : 'login'); setError(''); }} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-yellow-400 hover:bg-yellow-50/60">
          {isLogin ? 'New to CamBus? Create an account' : 'Already have an account? Sign in'}
        </button>
      </section>
    </div>
  </main>;
}
