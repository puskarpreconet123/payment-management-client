import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import {
  Smartphone, QrCode, Copy, CheckCircle2, XCircle, Clock,
  ArrowLeft, RefreshCw, ShieldCheck, IndianRupee, Loader2
} from 'lucide-react';
import { getPaymentStatus, cancelPayment } from '../services/api';
import { StatusBadge } from '../components/ui';
import { Logo } from '../components/ui';

const STATUS_CONFIG = {
  CREATED: { icon: QrCode, color: 'text-blue-400', bg: 'bg-blue-900/20', msg: 'Waiting for payment…', spin: true },
  PENDING: { icon: Loader2, color: 'text-amber-400', bg: 'bg-amber-900/20', msg: 'Payment in progress…', spin: true },
  SUCCESS: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-900/20', msg: 'Payment successful!', spin: false },
  FAILED: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-900/20', msg: 'Payment failed', spin: false },
  EXPIRED: { icon: Clock, color: 'text-slate-400', bg: 'bg-slate-800/40', msg: 'Payment expired', spin: false },
  CANCELLED: { icon: XCircle, color: 'text-slate-400', bg: 'bg-slate-800/40', msg: 'Payment cancelled', spin: false },
};

export default function CheckoutPage() {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const pollRef = useRef(null);
  const timerRef = useRef(null);

  const fetchPayment = async () => {
    try {
      const res = await getPaymentStatus(paymentId);
      const p = res.data.data;
      setPayment(p);

      if (p.upi_link || p.qr_string) {
        const qr = await QRCode.toDataURL(p.qr_string || p.upi_link, {
          width: 240,
          margin: 1,
          color: { dark: '#0a1628', light: '#ffffff' },
        });
        setQrDataUrl(qr);
      }

      // Stop polling on terminal status
      if (['SUCCESS', 'FAILED', 'EXPIRED'].includes(p.status)) {
        clearInterval(pollRef.current);
        clearInterval(timerRef.current);

        // Auto-redirect on success if URL exists
        if (p.status === 'SUCCESS' && p.redirect_url) {
          setTimeout(() => {
            window.location.href = p.redirect_url;
          }, 3000);
        }
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => {
    fetchPayment();
    pollRef.current = setInterval(fetchPayment, 5000);
    return () => { clearInterval(pollRef.current); clearInterval(timerRef.current); };
  }, [paymentId]);

  // Countdown timer
  useEffect(() => {
    if (!payment?.expiry_time) return;
    const update = () => {
      const diff = Math.max(0, new Date(payment.expiry_time) - new Date());
      setTimeLeft(diff);
    };
    update();
    timerRef.current = setInterval(update, 1000);
    return () => clearInterval(timerRef.current);
  }, [payment?.expiry_time]);

  const copyUpi = () => {
    navigator.clipboard.writeText(payment.upi_link || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this payment?')) return;
    try {
      await cancelPayment(paymentId);
      fetchPayment();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to cancel payment');
    }
  };

  const formatTime = (ms) => {
    if (!ms) return '00:00';
    const s = Math.floor(ms / 1000);
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={36} className="text-emerald-400 animate-spin" />
          <span className="text-slate-500">Loading payment…</span>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="text-center">
          <XCircle size={48} className="text-red-400 mx-auto mb-4" />
          <div className="text-white font-medium">Payment not found</div>
          <button onClick={() => navigate(-1)} className="btn-secondary mt-4">Go back</button>
        </div>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[payment.status] || STATUS_CONFIG.PENDING;
  const StatusIcon = cfg.icon;
  const isActive = ['CREATED', 'PENDING'].includes(payment.status);

  return (
    <div className="min-h-screen bg-navy-950 bg-grid-pattern flex flex-col">
      {/* Top bar */}
      <div className="border-b border-white/5 bg-navy-950/80 backdrop-blur-sm px-6 py-3 flex items-center justify-between">
        <Logo size="sm" />
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck size={13} className="text-emerald-400" />
          Secured by Paynexa
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center p-6 pt-10">
        <div className="w-full max-w-md">

          {/* Payment card */}
          <div className="glass-card overflow-hidden glow-emerald">

            {/* Amount header */}
            <div className="bg-gradient-to-br from-navy-800 to-navy-900 px-6 py-5 border-b border-white/5">
              <div className="text-xs text-slate-500 uppercase tracking-widest mb-2">Amount to Pay</div>
              <div className="flex items-baseline gap-1 mb-3">
                <IndianRupee size={20} className="text-white mb-0.5" />
                <span className="text-4xl font-mono font-bold text-white">
                  {payment.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={payment.status} />
                {isActive && timeLeft !== null && (
                  <span className={`font-mono text-xs font-medium ${timeLeft < 60000 ? 'text-red-400' : 'text-slate-400'}`}>
                    <Clock size={11} className="inline mr-1" />
                    {formatTime(timeLeft)}
                  </span>
                )}
              </div>
            </div>

            {/* Main content */}
            <div className="p-6 space-y-5">

              {/* Status icon for terminal states */}
              {!isActive && (
                <div className={`flex flex-col items-center justify-center py-8 rounded-xl ${cfg.bg} border border-white/5`}>
                  <StatusIcon
                    size={48}
                    className={`${cfg.color} mb-3 ${cfg.spin ? 'animate-spin' : ''}`}
                  />
                  <div className={`text-lg font-semibold ${cfg.color}`}>{cfg.msg}</div>
                  {payment.utr && (
                    <div className="mt-2 text-xs text-slate-400 font-mono">
                      UTR: {payment.utr}
                    </div>
                  )}
                </div>
              )}

              {/* QR Code */}
              {isActive && qrDataUrl && (
                <div className="flex flex-col items-center">
                  <div className="bg-white p-3 rounded-xl shadow-2xl">
                    <img src={qrDataUrl} alt="UPI QR Code" className="w-52 h-52" />
                  </div>
                  <p className="text-xs text-slate-500 mt-3 text-center">
                    Scan with any UPI app to pay
                  </p>
                </div>
              )}

              {/* UPI Apps */}
              {isActive && (
                <div>
                  <div className="text-xs text-slate-500 text-center mb-3 uppercase tracking-widest">Or pay via UPI app</div>
                  <a
                    href={payment.upi_link}
                    className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-3"
                  >
                    <Smartphone size={16} />
                    Open UPI App
                  </a>

                  <button
                    onClick={copyUpi}
                    className="btn-secondary w-full flex items-center justify-center gap-2 mt-2 text-sm"
                  >
                    <Copy size={14} />
                    {copied ? 'Copied!' : 'Copy UPI Link'}
                  </button>

                  <button
                    onClick={handleCancel}
                    className="w-full flex items-center justify-center gap-2 mt-6 text-xs text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <XCircle size={12} />
                    Cancel Payment
                  </button>
                </div>
              )}

              {/* Details */}
              <div className="border-t border-white/5 pt-4 space-y-2">
                {[
                  { label: 'Payment ID', value: payment.payment_id, mono: true },
                  { label: 'Order ID', value: payment.order_id, mono: true },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">{row.label}</span>
                    <span className={`text-xs text-slate-300 ${row.mono ? 'font-mono' : ''}`}>{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Auto-refresh indicator */}
              {isActive && (
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600">
                  <RefreshCw size={11} className="animate-spin-slow" />
                  Auto-refreshing every 5s
                </div>
              )}

              {/* Back button for terminal states */}
              {!isActive && (
                <button onClick={() => navigate(-1)} className="btn-secondary w-full flex items-center justify-center gap-2">
                  <ArrowLeft size={14} /> Back
                </button>
              )}
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mt-5 text-xs text-slate-600">
            <span className="flex items-center gap-1"><ShieldCheck size={11} /> SSL Secured</span>
            <span>·</span>
            <span className="flex items-center gap-1">NPCI Compliant</span>
            <span>·</span>
            <span className="flex items-center gap-1">256-bit Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
}
