import { useEffect, useState } from 'react';
import { Plus, CreditCard, ToggleLeft, ToggleRight } from 'lucide-react';
import { getMids, createMid, updateMidStatus } from '../services/api';
import { StatusBadge, Modal, EmptyState, SectionHeader, PageLoader } from '../components/ui';
import Header from '../components/Header';

const PROVIDERS = ['razorpay', 'paytm', 'phonepe', 'rupeeflow', 'dummy'];

export default function MIDManagement() {
  const [mids, setMids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [form, setForm] = useState({
    mid_code: '', provider: 'dummy', api_key: '', api_secret: '',
    webhook_secret: '', upi_id: '', merchant_name: ''
  });

  const getPlaceholder = (field) => {
    if (field === 'api_key') {
      if (form.provider === 'rupeeflow') return 'RupeeFlow API Token';
      if (form.provider === 'razorpay') return 'rzp_test_xxxxx';
      return 'API Key';
    }
    if (field === 'upi_id') {
      if (form.provider === 'rupeeflow') return 'rahifab2024@nsdlpbma (Payee VPA)';
      return 'merchant@upi';
    }
    return '';
  };

  const load = async () => {
    setLoading(true);
    const res = await getMids();
    setMids(res.data.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault(); setErr(''); setSaving(true);
    try {
      await createMid(form);
      setShowCreate(false);
      setForm({ mid_code: '', provider: 'dummy', api_key: '', api_secret: '', webhook_secret: '', upi_id: '', merchant_name: '' });
      load();
    } catch (e) { setErr(e.response?.data?.message || 'Failed to create MID'); }
    setSaving(false);
  };

  const toggleStatus = async (mid) => {
    await updateMidStatus(mid._id, mid.status === 'active' ? 'inactive' : 'active');
    load();
  };

  return (
    <>
      <Header title="MID Management" subtitle="Manage merchant IDs and provider connections" />
      <div className="p-6 page-enter">
        <SectionHeader
          title="Merchant IDs (MIDs)"
          subtitle={`${mids.length} configured`}
          action={
            <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
              <Plus size={15} /> Create MID
            </button>
          }
        />

        {loading ? <div className="glass-card p-4"><PageLoader /></div> : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>MID Code</th>
                    <th>Provider</th>
                    <th>UPI ID</th>
                    <th>Merchant Name</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mids.length === 0 ? (
                    <tr><td colSpan={7}><EmptyState icon={CreditCard} title="No MIDs configured" desc="Create your first MID to start routing payments" /></td></tr>
                  ) : mids.map(mid => (
                    <tr key={mid._id}>
                      <td><span className="font-mono font-semibold text-emerald-400">{mid.mid_code}</span></td>
                      <td>
                        <span className="text-xs px-2 py-1 rounded-md bg-white/5 border border-white/10 font-mono text-slate-300 capitalize">
                          {mid.provider}
                        </span>
                      </td>
                      <td className="font-mono text-xs text-slate-300">{mid.upi_id || '—'}</td>
                      <td className="text-sm text-slate-300">{mid.merchant_name || '—'}</td>
                      <td><StatusBadge status={mid.status} /></td>
                      <td className="text-xs text-slate-500">{new Date(mid.createdAt).toLocaleDateString('en-IN')}</td>
                      <td>
                        <button
                          onClick={() => toggleStatus(mid)}
                          className={`p-1.5 rounded-lg transition-colors ${mid.status === 'active'
                            ? 'text-emerald-400 hover:bg-red-900/20 hover:text-red-400'
                            : 'text-slate-500 hover:bg-emerald-900/20 hover:text-emerald-400'
                            }`}
                        >
                          {mid.status === 'active' ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create MID Modal */}
        <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create New MID" maxWidth="max-w-xl">
          <form onSubmit={handleCreate} className="space-y-4">
            {err && <div className="text-red-400 text-sm bg-red-900/20 border border-red-800/40 rounded-lg p-3">{err}</div>}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">MID Code</label>
                <input className="input-field font-mono" placeholder="MID_001" value={form.mid_code}
                  onChange={e => setForm(p => ({ ...p, mid_code: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Provider</label>
                <select className="input-field" value={form.provider}
                  onChange={e => setForm(p => ({ ...p, provider: e.target.value }))}>
                  {PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">API Key</label>
                <input className="input-field font-mono text-xs" placeholder={getPlaceholder('api_key')} value={form.api_key}
                  onChange={e => setForm(p => ({ ...p, api_key: e.target.value }))} required />
              </div>
              <div>
                <label className="label">API Secret</label>
                <input className="input-field font-mono text-xs" type="password" placeholder="••••••••••••" value={form.api_secret}
                  onChange={e => setForm(p => ({ ...p, api_secret: e.target.value }))}
                  required={form.provider !== 'rupeeflow'} />
              </div>
            </div>

            <div>
              <label className="label">Webhook Secret</label>
              <input className="input-field font-mono text-xs" type="password" placeholder="whsec_xxxxxx" value={form.webhook_secret}
                onChange={e => setForm(p => ({ ...p, webhook_secret: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">UPI ID</label>
                <input className="input-field" placeholder={getPlaceholder('upi_id')} value={form.upi_id}
                  onChange={e => setForm(p => ({ ...p, upi_id: e.target.value }))} />
              </div>
              <div>
                <label className="label">Display Name</label>
                <input className="input-field" placeholder="Acme Payments" value={form.merchant_name}
                  onChange={e => setForm(p => ({ ...p, merchant_name: e.target.value }))} />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? 'Creating…' : 'Create MID'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </>
  );
}
