import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { KeyRound, RefreshCw, Eye, EyeOff, Copy, ShieldAlert, Check } from 'lucide-react';
import { getMerchantProfile, regenerateToken } from '../services/api';
import { SectionHeader, PageLoader } from '../components/ui';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

export default function APISettings() {
  const { setSidebarOpen } = useOutletContext();
  const { user, login } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regen, setRegen] = useState(false);
  const [show, setShow] = useState(false);
  const [copiedId, setCopiedId] = useState(null); // Track WHICH item was copied
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

  const copy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) return (
    <>
      <Header title="API Settings" onMenuClick={() => setSidebarOpen(true)} />
      <div className="p-6 bg-gray-50/50 min-h-screen"><PageLoader /></div>
    </>
  );

  const token = profile?.api_token || '—';
  const masked = token.replace(/.(?=.{8})/g, '•');

  return (
    <>
      <Header 
        title="API Settings" 
        subtitle="Manage your API token and credentials" 
        onMenuClick={() => setSidebarOpen(true)}
      />
        <div className="centered-content-wrapper page-enter px-6 space-y-5 bg-gray-50/50 min-h-[calc(100vh-64px)] pt-6 pb-12">
          <div className="w-full max-w-2xl mx-auto">
        <SectionHeader title="API Settings" subtitle="Integrate Paynexa into your application" />

        {/* Token Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
              <KeyRound size={18} className="text-emerald-600" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900">API Token</div>
              <div className="text-xs font-medium text-gray-500">Use this in the Authorization header</div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-4 shadow-inner">
            <div className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Bearer Token</div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <code className="font-mono text-sm text-gray-500 flex-1 break-all bg-white py-1.5 px-3 rounded border border-gray-200 shadow-sm">
                {show ? token : masked}
              </code>
              <div className="flex items-center gap-2">
                <button onClick={() => setShow(s => !s)} className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-gray-900 transition-colors flex-shrink-0 shadow-sm">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button onClick={() => copy(token, 'main-token')} className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-emerald-50 text-gray-500 hover:text-emerald-600 transition-colors flex-shrink-0 shadow-sm w-[34px] h-[34px] flex items-center justify-center">
                  {copiedId === 'main-token' ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div className="text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5 flex items-start gap-2 shadow-sm">
            <ShieldAlert size={15} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <span className="leading-relaxed">Keep this token secret. Never expose it in client-side code or public repositories.</span>
          </div>

          {confirm && (
            <div className="text-sm font-medium text-red-800 bg-red-50 border border-red-200 rounded-lg p-3 mb-5 shadow-sm flex items-start gap-2">
              <span className="text-red-600 mt-0.5 flex-shrink-0">⚠️</span>
              <span className="leading-relaxed">This will invalidate your current token immediately. All integrations will break until updated. Click again to confirm.</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <button
              onClick={handleRegenerate}
              disabled={regen}
              className={`flex items-center justify-center gap-2 text-sm px-5 py-2 rounded-lg font-semibold transition-all shadow-sm ${
                confirm 
                  ? 'bg-red-600 hover:bg-red-700 text-white border border-red-700 disabled:opacity-70' 
                  : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 disabled:opacity-50'
              }`}
            >
              <RefreshCw size={14} className={regen ? 'animate-spin' : ''} />
              {regen ? 'Regenerating…' : confirm ? 'Confirm Regenerate' : 'Regenerate Token'}
            </button>
            {confirm && (
              <button onClick={() => setConfirm(false)} className="px-5 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-semibold transition-colors shadow-sm w-full sm:w-auto mt-2 sm:mt-0">
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Usage example */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100">
              <RefreshCw size={18} className="text-blue-600" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900">Integration Guide</div>
              <div className="text-xs font-medium text-gray-500">Quick start examples for your backend</div>
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
            ].map((ex, index) => (
              <div key={ex.label} className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <div className="text-sm font-bold text-gray-900">{ex.label}</div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{ex.desc}</div>
                </div>
                <div className="relative group">
                  <pre className="bg-gray-900 rounded-xl p-4 text-[13px] font-mono text-emerald-400 overflow-x-auto border border-gray-800 leading-relaxed shadow-inner">
                    {ex.code}
                  </pre>
                  {/* Copy button stays visible if it was just clicked, otherwise uses group-hover */}
                  <button 
                    onClick={() => copy(ex.code, `snippet-${index}`)} 
                    className={`absolute top-3 right-3 w-[30px] h-[30px] flex items-center justify-center rounded-lg transition-all backdrop-blur-sm border ${
                      copiedId === `snippet-${index}` 
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 opacity-100' 
                        : 'bg-white/10 hover:bg-white/20 text-gray-400 hover:text-emerald-300 opacity-0 group-hover:opacity-100 border-transparent hover:border-white/10'
                    }`}
                  >
                    {copiedId === `snippet-${index}` ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>
      </div>
    </>
  );
}