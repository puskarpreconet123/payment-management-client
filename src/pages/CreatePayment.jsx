import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Zap, ArrowRight, QrCode, IndianRupee, Copy, CheckCircle2, RefreshCw } from 'lucide-react';
import { createPayment } from '../services/api';
import { SectionHeader } from '../components/ui';
import Header from '../components/Header';

export default function CreatePayment() {
  const { setSidebarOpen } = useOutletContext();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    amount: '', order_id: '', customer_name: '',
    customer_email: '', customer_mobile: '', webhook_url: '', redirect_url: ''
  });
  const [loading, setLoading] = useState(null); // 'intent' or 'copy'
  const [err, setErr] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e, type = 'intent') => {
    if (e) e.preventDefault();
    setErr(''); setLoading(type);
    try {
      const res = await createPayment({ ...form, amount: parseFloat(form.amount) });
      const { payment_id, checkout_url } = res.data.data;

      if (type === 'copy') {
        navigator.clipboard.writeText(checkout_url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        navigate(`/checkout/${payment_id}`);
      }
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed to create payment');
    }
    setLoading(null);
  };

  const f = (key, value) => setForm(p => ({ ...p, [key]: value }));

  return (
    <>
      <Header 
        title="Create Payment" 
        subtitle="Generate a new UPI payment link" 
        onMenuClick={() => setSidebarOpen(true)}
      />
        <div className="centered-content-wrapper page-enter px-6 bg-gray-50/50 min-h-screen pt-6">
          <div className="w-full max-w-2xl mx-auto">
        <SectionHeader
          title="New Payment"
          subtitle="Fill in the details to generate a UPI payment link"
        />

        {/* Changed from glass-card to a clean white card with subtle shadows */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Header accent */}
          <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100">
            {/* Swapped emerald/dark backgrounds for a clean emerald enterprise accent */}
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <QrCode size={20} className="text-emerald-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">UPI Payment Order</div>
              <div className="text-xs text-gray-500">Generates a QR code and UPI deep link</div>
            </div>
          </div>

          {err && (
            // Updated error state to a clean light red theme
            <div className="text-red-700 text-sm bg-red-50 border border-red-200 rounded-lg p-3 mb-5">
              {err}
            </div>
          )}

          <form onSubmit={(e) => handleSubmit(e, 'intent')} className="space-y-5">
            {/* Amount + Order ID */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label text-gray-700 font-medium mb-1 block text-sm">Amount (INR)</label>
                <div className="relative">
                  <IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    placeholder="500.00"
                    step="0.01"
                    min="1"
                    className="input-field !pl-8 font-mono bg-white border border-gray-300 text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-full rounded-lg px-3 py-2 transition-all"
                    value={form.amount}
                    onChange={e => f('amount', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="label text-gray-700 font-medium mb-1 block text-sm">Order ID</label>
                <input
                  type="text"
                  placeholder="ORD_20240601_001"
                  className="input-field font-mono text-sm bg-white border border-gray-300 text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-full rounded-lg px-3 py-2 transition-all"
                  value={form.order_id}
                  onChange={e => f('order_id', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Optional URLs */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label text-gray-700 font-medium mb-1 block text-sm">CallBack URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://merchant.com/api/callback"
                  className="input-field font-mono text-xs bg-white border border-gray-300 text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-full rounded-lg px-3 py-2 transition-all"
                  value={form.webhook_url}
                  onChange={e => f('webhook_url', e.target.value)}
                />
              </div>
              <div>
                <label className="label text-gray-700 font-medium mb-1 block text-sm">Redirect URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://merchant.com/success"
                  className="input-field font-mono text-xs bg-white border border-gray-300 text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-full rounded-lg px-3 py-2 transition-all"
                  value={form.redirect_url}
                  onChange={e => f('redirect_url', e.target.value)}
                />
              </div>
            </div>
            <p className="text-[10px] text-gray-500 mt-1 italic">
              * Overrides default merchant URLs for this specific transaction.
            </p>

            {/* Customer details */}
            <div className="pt-2 border-t border-gray-100 mt-2">
              <div className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-4 mt-4">Customer Details</div>
              <div className="space-y-4">
                <div>
                  <label className="label text-gray-700 font-medium mb-1 block text-sm">Customer Name</label>
                  <input
                    type="text"
                    placeholder="Rahul Sharma"
                    className="input-field bg-white border border-gray-300 text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-full rounded-lg px-3 py-2 transition-all"
                    value={form.customer_name}
                    onChange={e => f('customer_name', e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label text-gray-700 font-medium mb-1 block text-sm">Email Address</label>
                    <input
                      type="email"
                      placeholder="rahul@example.com"
                      className="input-field bg-white border border-gray-300 text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-full rounded-lg px-3 py-2 transition-all"
                      value={form.customer_email}
                      onChange={e => f('customer_email', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="label text-gray-700 font-medium mb-1 block text-sm">Mobile Number</label>
                    <input
                      type="tel"
                      placeholder="9876543210"
                      className="input-field font-mono bg-white border border-gray-300 text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-full rounded-lg px-3 py-2 transition-all"
                      value={form.customer_mobile}
                      onChange={e => f('customer_mobile', e.target.value)}
                      maxLength={10}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={() => setForm({ amount: '', order_id: '', customer_name: '', customer_email: '', customer_mobile: '' })}
                className="btn-secondary px-6 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors font-medium text-sm"
                disabled={!!loading}
              >
                Clear
              </button>

              <div className="flex-1 flex gap-3">
                {/* Copy URL Button */}
                <button
                  type="button"
                  onClick={() => handleSubmit(null, 'copy')}
                  disabled={!!loading}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors shadow-sm font-medium text-sm"
                >
                  {loading === 'copy' ? (
                    <RefreshCw size={15} className="animate-spin text-gray-500" />
                  ) : copied ? (
                    <CheckCircle2 size={15} className="text-green-600" />
                  ) : (
                    <Copy size={15} className="text-gray-500" />
                  )}
                  {copied ? 'URL Copied!' : 'Copy URL'}
                </button>

                {/* Intent Button */}
                <button
                  type="submit"
                  disabled={!!loading}
                  className="btn-primary flex-[1.5] flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm font-medium text-sm disabled:opacity-70"
                >
                  {loading === 'intent' ? (
                    <RefreshCw size={15} className="animate-spin" />
                  ) : (
                    <>
                      <Zap size={15} />
                      Open Intent
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
        </div>
      </div>
    </>
  );
}