import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Webhook, Save, ExternalLink, CheckCircle2, Info } from 'lucide-react';
import { getMerchantProfile, updateWebhookUrl } from '../services/api';
import { SectionHeader, PageLoader } from '../components/ui';
import Header from '../components/Header';

export default function WebhookSettings() {
  const { setSidebarOpen } = useOutletContext();
  const [profile, setProfile] = useState(null);
// ... existing states ...
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    getMerchantProfile().then(res => {
      setProfile(res.data.data);
      setUrl(res.data.data.webhook_url || '');
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setErr(''); setSaving(true);
    try {
      await updateWebhookUrl(url);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed to update webhook URL');
    }
    setSaving(false);
  };

  if (loading) return (
    <>
      <Header title="Webhook Settings" onMenuClick={() => setSidebarOpen(true)} />
      <div className="p-6"><PageLoader /></div>
    </>
  );

  return (
    <>
      <Header 
        title="Webhook Settings" 
        subtitle="Configure payment event callbacks" 
        onMenuClick={() => setSidebarOpen(true)}
      />
      <div className="p-6 page-enter max-w-2xl space-y-5">
        <SectionHeader title="Webhook Configuration" subtitle="We'll send payment events to your endpoint" />

        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-violet-900/30 border border-violet-800/30">
              <Webhook size={18} className="text-violet-400" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Webhook Endpoint URL</div>
              <div className="text-xs text-slate-500">HTTPS endpoint that receives payment events</div>
            </div>
          </div>

          {err && <div className="text-red-400 text-sm bg-red-900/20 border border-red-800/40 rounded-lg p-3 mb-4">{err}</div>}
          {saved && (
            <div className="text-emerald-400 text-sm bg-emerald-900/20 border border-emerald-800/40 rounded-lg p-3 mb-4 flex items-center gap-2">
              <CheckCircle2 size={15} /> Webhook URL updated successfully
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-widest block mb-2">Endpoint URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://yourdomain.com/payment/callback"
                  className="bg-navy-950 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-slate-300 flex-1 focus:outline-none focus:border-emerald-500/50"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  required
                />
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 px-6">
                  {saving ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  {saving ? 'Saving…' : 'Save URL'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Payload reference */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-emerald-900/30 border border-emerald-800/30">
              <CheckCircle2 size={18} className="text-emerald-400" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Webhook Payload</div>
              <div className="text-xs text-slate-500">Sample JSON sent to your server</div>
            </div>
          </div>
          <div className="bg-navy-950 rounded-xl p-4 border border-white/5 relative group">
            <pre className="font-mono text-xs text-emerald-300 leading-relaxed overflow-x-auto">{`{
  "payment_id":   "PAY_M5X3K1_A2B3",
  "order_id":     "ORD_20240601_001",
  "status":       "SUCCESS",
  "amount":       500,
  "currency":     "INR",
  "utr":          "UTR123456789",
  "customer_name": "John Doe",
  "timestamp":    "${new Date().toISOString()}"
}`}</pre>
          </div>
        </div>

        {/* Retry info */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Info size={15} className="text-blue-400" />
            <div className="text-sm font-semibold text-white">Retry Policy</div>
          </div>
          <div className="space-y-2">
            {[
              { attempt: '1st attempt', time: 'Immediately after payment event' },
              { attempt: '2nd attempt', time: '1 minute after failure' },
              { attempt: '3rd attempt', time: '5 minutes after failure' },
              { attempt: '4th attempt', time: '15 minutes after failure' },
            ].map(r => (
              <div key={r.attempt} className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-300">{r.attempt}</span>
                <span className="text-slate-500 text-xs">{r.time}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-white/5 text-xs text-slate-500">
            Your endpoint must return a <code className="text-emerald-400 font-mono">2xx</code> status code to acknowledge receipt.
          </div>
        </div>
      </div>
    </>
  );
}
