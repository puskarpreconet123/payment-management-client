import { useEffect, useState } from 'react';
import { KeyRound, RefreshCw, Eye, EyeOff, Copy, ShieldAlert } from 'lucide-react';
import { getMerchantProfile, regenerateToken } from '../services/api';
import { SectionHeader, PageLoader } from '../components/ui';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

export default function APISettings() {
  const { user, login } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regen, setRegen] = useState(false);
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await getMerchantProfile();
    setProfile(res.data.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleRegenerate = async () => {
    if (!confirm) { setConfirm(true); return; }
    setRegen(true);
    try {
      const res = await regenerateToken();
      const newToken = res.data.data.api_token;
      // Update stored token
      login({ ...user }, newToken);
      localStorage.setItem('rf_token', newToken);
      await load();
      setConfirm(false);
    } catch (e) { console.error(e); }
    setRegen(false);
  };

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <>
      <Header title="API Settings" />
      <div className="p-6"><PageLoader /></div>
    </>
  );

  const token = profile?.api_token || '—';
  const masked = token.replace(/.(?=.{8})/g, '•');

  return (
    <>
      <Header title="API Settings" subtitle="Manage your API token and credentials" />
      <div className="p-6 page-enter max-w-2xl space-y-5">
        <SectionHeader title="API Settings" subtitle="Integrate Paynexa into your application" />

        {/* Token Card */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-emerald-900/30 border border-emerald-800/30">
              <KeyRound size={18} className="text-emerald-400" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">API Token</div>
              <div className="text-xs text-slate-500">Use this in the Authorization header</div>
            </div>
          </div>

          <div className="bg-navy-950 rounded-xl p-4 border border-white/5 mb-4">
            <div className="text-xs text-slate-500 mb-2 uppercase tracking-widest">Bearer Token</div>
            <div className="flex items-center gap-2">
              <code className="font-mono text-sm text-emerald-400 flex-1 break-all">
                {show ? token : masked}
              </code>
              <button onClick={() => setShow(s => !s)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors flex-shrink-0">
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
              <button onClick={() => copy(token)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-emerald-400 transition-colors flex-shrink-0">
                <Copy size={15} />
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-500 bg-amber-900/10 border border-amber-800/20 rounded-lg p-3 mb-4 flex items-start gap-2">
            <ShieldAlert size={13} className="text-amber-400 mt-0.5 flex-shrink-0" />
            Keep this token secret. Never expose it in client-side code or public repositories.
          </div>

          {confirm && (
            <div className="text-sm text-red-400 bg-red-900/20 border border-red-800/40 rounded-lg p-3 mb-4">
              ⚠️ This will invalidate your current token immediately. All integrations will break until updated. Click again to confirm.
            </div>
          )}

          <button
            onClick={handleRegenerate}
            disabled={regen}
            className={`flex items-center gap-2 text-sm ${confirm ? 'btn-danger' : 'btn-secondary'
              }`}
          >
            <RefreshCw size={14} className={regen ? 'animate-spin' : ''} />
            {regen ? 'Regenerating…' : confirm ? 'Confirm Regenerate' : 'Regenerate Token'}
          </button>
          {confirm && (
            <button onClick={() => setConfirm(false)} className="btn-secondary ml-2 text-sm">Cancel</button>
          )}
        </div>

        {/* Usage example */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-blue-900/30 border border-blue-800/30">
              <RefreshCw size={18} className="text-blue-400" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Integration Guide</div>
              <div className="text-xs text-slate-500">Quick start examples for your backend</div>
            </div>
          </div>

          <div className="space-y-6">
            {[
              {
                label: '1. Create Payment',
                desc: 'Initialize a transaction from your server',
                code: `curl -X POST ${window.location.origin}/api/payments/create \\
  -H "Authorization: Bearer ${show ? token : masked}" \\
  -H "Content-Type: application/json" \\
  -d '{"amount":500,"order_id":"ORD_123","customer_name":"Rahul","customer_email":"rahul@test.com","customer_mobile":"9876543210"}'`
              },
              {
                label: '2. Confirm Payment (Manual)',
                desc: 'Settle a payment manually via REST API',
                code: `curl -X POST ${window.location.origin}/api/payments/PAY_ID/confirm \\
  -H "Authorization: Bearer ${show ? token : masked}" \\
  -H "Content-Type: application/json" \\
  -d '{"utr":"1234567890"}'`
              },
            ].map(ex => (
              <div key={ex.label} className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <div className="text-sm font-medium text-slate-200">{ex.label}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-tighter">{ex.desc}</div>
                </div>
                <div className="relative group">
                  <pre className="bg-navy-950 rounded-xl p-4 text-xs font-mono text-emerald-300 overflow-x-auto border border-white/5 leading-relaxed group-hover:border-emerald-500/20 transition-colors">
                    {ex.code}
                  </pre>
                  <button onClick={() => copy(ex.code)} className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                    <Copy size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
