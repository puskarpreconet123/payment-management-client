import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, UserPlus, Eye, ToggleLeft, ToggleRight, Copy, CreditCard } from 'lucide-react';
import { getMerchants, createMerchant, updateMerchantStatus, getMids, assignMids, generateOtp, verifyOtp, checkOtpStatus } from '../services/api';
import { StatusBadge, Modal, Pagination, EmptyState, SectionHeader, PageLoader, CopyButton } from '../components/ui';
import Header from '../components/Header';

export default function Merchants() {
  const { setSidebarOpen } = useOutletContext();
  const [merchants, setMerchants] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(() => parseInt(localStorage.getItem('rf_limit_pref')) || 15);
  // ... existing states ...
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showAssign, setShowAssign] = useState(null);
  const [mids, setMids] = useState([]);
  const [selectedMids, setSelectedMids] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', webhook_url: '' });
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async (p = page, l = limit) => {
    setLoading(true);
    const res = await getMerchants({ page: p, limit: l });
    setMerchants(res.data.data.merchants);
    setTotal(res.data.data.total);
    setLoading(false);
  };

  useEffect(() => { load(page, limit); }, [page, limit]);

  const handleLimitChange = (l) => {
    setLimit(l);
    setPage(1);
    localStorage.setItem('rf_limit_pref', l);
  };



  const handleCreate = async (e) => {
    e.preventDefault(); setErr(''); setSaving(true);
    try {
      // Only send the webhook_url if it's actually filled out
      const data = { ...form };
      if (!data.webhook_url) delete data.webhook_url;
      
      await createMerchant(data);
      setShowCreate(false);
      setForm({ name: '', email: '', password: '', webhook_url: '' });
      setErr('');
      load(page);
    } catch (e) { setErr(e.response?.data?.message || 'Failed to create merchant'); }
    setSaving(false);
  };

  const toggleStatus = async (m) => {
    const newStatus = m.status === 'active' ? 'inactive' : 'active';
    await updateMerchantStatus(m._id, newStatus);
    load(page);
  };

  const openAssign = async (m) => {
    try {
      setShowAssign(m);
      setSelectedMids(m.mids?.map(mid => mid._id || mid) || []);
      const res = await getMids();

      // Log this to see the actual shape of your data!
      console.log("MIDs API Response:", res.data);

      // Update this line based on your actual API response structure.
      // If the array is inside a 'mids' property, use res.data.data.mids
      const midsArray = res.data?.data?.mids || res.data?.data || [];

      // Ensure we only ever set an array into state
      setMids(Array.isArray(midsArray) ? midsArray : []);

    } catch (error) {
      console.error("Failed to fetch MIDs:", error);
      setShowAssign(null);
    }
  };

  const handleAssign = async () => {
    setSaving(true);
    await assignMids(showAssign._id, selectedMids);
    setShowAssign(null);
    load(page);
    setSaving(false);
  };

  return (
    <>
      <Header
        title="Merchants"
        subtitle="Manage all registered merchants"
        onMenuClick={() => setSidebarOpen(true)}
      />
      <div className="p-6 page-enter">
        <SectionHeader
          title="Merchants"
          subtitle={`${total} total merchants`}
          action={
            <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
              <UserPlus size={15} /> Create Merchant
            </button>
          }
        />

        <div className="glass-card overflow-hidden">
          {loading ? <PageLoader /> : (
            <>
              <div className="overflow-x-auto">
                <table className="table-base">
                  <thead>
                    <tr>
                      <th>Merchant</th>
                      <th>Email</th>
                      <th>Contact</th>
                      <th>Status</th>
                      <th>MIDs</th>
                      <th>API Token</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {merchants.length === 0 ? (
                      <tr><td colSpan={7}><EmptyState title="No merchants yet" desc="Create your first merchant to get started" /></td></tr>
                    ) : merchants.map(m => (
                      <tr key={m._id}>
                        <td className="font-medium text-white">{m.name}</td>
                        <td className="text-xs text-slate-400">{m.email}</td>
                        <td className="text-xs text-slate-400">
                          {m.mobile_no || <span className="text-slate-600">—</span>}
                          {m.is_mobile_verified && <span className="ml-1.5 text-emerald-400" title="Verified">✓ Verified</span>}
                        </td>
                        <td><StatusBadge status={m.status} /></td>
                        <td className="text-xs font-mono text-slate-400">{m.mids?.length || 0} assigned</td>
                        <td>
                          {m.api_token ? (
                            <span className="font-mono text-xs text-slate-500">{m.api_token.slice(0, 12)}…</span>
                          ) : <span className="text-slate-600 text-xs">—</span>}
                        </td>
                        <td className="text-xs text-slate-500">{new Date(m.createdAt).toLocaleDateString('en-IN')}</td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => openAssign(m)}
                              title="Assign MIDs"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-900/20 transition-colors"
                            >
                              <CreditCard size={13} />
                            </button>
                            <button
                              onClick={() => toggleStatus(m)}
                              title={m.status === 'active' ? 'Disable' : 'Enable'}
                              className={`p-1.5 rounded-lg transition-colors ${m.status === 'active'
                                  ? 'text-emerald-400 hover:bg-red-900/20 hover:text-red-400'
                                  : 'text-slate-500 hover:bg-emerald-900/20 hover:text-emerald-400'
                                }`}
                            >
                              {m.status === 'active' ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                page={page}
                total={total}
                limit={limit}
                onChange={setPage}
                onLimitChange={handleLimitChange}
              />
            </>
          )}
        </div>

        {/* Create Modal */}
        <Modal open={showCreate} onClose={() => {
          setShowCreate(false);
          setForm({ name: '', email: '', mobile_no: '', password: '', webhook_url: '' });
          setErr('');
        }} title="Create Merchant">
          <form onSubmit={handleCreate} className="space-y-4">
            {err && <div className="text-sm border rounded-lg p-3 text-red-400 bg-red-900/20 border-red-800/40">{err}</div>}
            {[
              { label: 'Merchant Name', key: 'name', type: 'text', placeholder: 'Acme Corp' },
              { label: 'Email Address', key: 'email', type: 'email', placeholder: 'contact@acme.com' },
              { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' },
              { label: 'Callback URL', key: 'webhook_url', type: 'url', placeholder: 'https://yourdomain.com/callback' },
            ].map(f => (
              <div key={f.key}>
                <label className="label">{f.label}</label>
                <input
                  type={f.type}
                  placeholder={f.placeholder}
                  className="input-field"
                  value={form[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  required={f.key !== 'webhook_url'}
                />
              </div>
            ))}

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? 'Creating…' : 'Create Merchant'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Assign MIDs Modal */}
        <Modal open={!!showAssign} onClose={() => setShowAssign(null)} title={`Assign MIDs — ${showAssign?.name}`}>
          <div className="space-y-3">
            <p className="text-sm text-slate-400">Select MIDs to assign to this merchant.</p>
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {(Array.isArray(mids) ? mids : []).map(mid => (
                <label key={mid._id} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-all ${selectedMids.includes(mid._id)
                    ? 'border-emerald-700/50 bg-emerald-50'
                    : 'border-white/5 bg-white/2 hover:border-white/10'
                  }`}>
                  <input
                    type="checkbox"
                    className="accent-emerald-500 w-4 h-4"
                    checked={selectedMids.includes(mid._id)}
                    onChange={e => {
                      setSelectedMids(p =>
                        e.target.checked ? [...p, mid._id] : p.filter(x => x !== mid._id)
                      );
                    }}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white font-mono">{mid.mid_code}</div>
                    <div className="text-xs text-slate-500">{mid.provider} · {mid.upi_id}</div>
                  </div>
                  <StatusBadge status={mid.status} />
                </label>
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowAssign(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleAssign} disabled={saving} className="btn-primary flex-1">
                {saving ? 'Saving…' : 'Assign MIDs'}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}
