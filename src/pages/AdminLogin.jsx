import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { adminLogin } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/ui';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true);
    try {
      const res = await adminLogin(form);
      const { token, admin } = res.data.data;
      login({ ...admin, type: 'admin' }, token);
      navigate('/admin');
    } catch (e) { setErr(e.response?.data?.message || 'Login failed'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4 bg-grid-pattern">
      {/* Glow effect */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <h1 className="text-xl font-semibold text-white mb-1">Admin Portal</h1>
          <p className="text-slate-500 text-sm">Sign in to manage the platform</p>
        </div>

        <div className="glass-card p-7 glow-emerald">
          <div className="flex items-center gap-2 mb-5 text-xs text-slate-500">
            <ShieldCheck size={13} className="text-emerald-400" />
            <span>Secured with JWT authentication</span>
          </div>

          {err && (
            <div className="text-red-400 text-sm bg-red-900/20 border border-red-800/40 rounded-lg p-3 mb-5">
              {err}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="email" placeholder="admin@rupeeflow.com" className="input-field !pl-9"
                  value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type={show ? 'text' : 'password'} placeholder="••••••••" className="input-field !pl-9 !pr-10"
                  value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
                <button type="button" onClick={() => setShow(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                  {show ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2 flex items-center justify-center gap-2 py-2.5">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in…</>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-white/5 text-center">
            <a href="/merchant/login" className="text-xs text-slate-500 hover:text-emerald-400 transition-colors">
              Merchant portal →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
