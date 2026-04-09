import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, CheckCircle2, AlertCircle, ArrowRight, Smartphone } from 'lucide-react';
import { generateMerchantOnboardingOtp, checkMerchantOnboardingStatus, verifyMerchantOnboarding } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/ui';

export default function MerchantOnboarding() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [mobile, setMobile] = useState('');
  const [requestId, setRequestId] = useState('');
  const [intent, setIntent] = useState('');
  const [qr, setQr] = useState('');
  const [status, setStatus] = useState('idle'); // idle, pending, verified
  const [loading, setLoading] = useState(false);
  const [manualLoading, setManualLoading] = useState(false);
  const [err, setErr] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!mobile) return setErr('Mobile number is required');
    setLoading(true); setErr('');
    try {
      const res = await generateMerchantOnboardingOtp(mobile);
      const data = res.data.data;
      setRequestId(data.requestId);
      setIntent(data.intent);
      setQr(data.qr);
      setStatus('pending');
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed to initiate verification');
    }
    setLoading(false);
  };

  const checkStatus = async (isManual = false) => {
    if (isManual) setManualLoading(true);
    try {
      const res = await checkMerchantOnboardingStatus(requestId);
      if (res.data?.data?.status === 'verified') {
        setStatus('verified');
        // Finalize verification on backend
        await handleFinalize(requestId, mobile);
      } else if (isManual) {
        setErr('Verification not yet detected. Please send the SMS and try again.');
      }
    } catch (e) { 
      if (isManual) setErr('Failed to check status. Please try again.');
    } finally {
      if (isManual) setManualLoading(false);
    }
  };

  useEffect(() => {
    let interval;
    if (status === 'pending' && requestId) {
      interval = setInterval(async () => {
        checkStatus();
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [status, requestId, mobile]);

  const handleFinalize = async (rid, mob) => {
    try {
      const res = await verifyMerchantOnboarding({ requestId: rid, mobile_no: mob });
      // Update local auth context with new user data
      const updatedUser = { ...user, mobile_no: mob, is_mobile_verified: true };
      login(updatedUser, localStorage.getItem('rf_token'));
      // Wait a bit to show success then redirect
      setTimeout(() => navigate('/merchant'), 2000);
    } catch (e) {
      setErr('Verification succeeded but failed to link account. Please contact support.');
    }
  };

  if (status === 'verified') {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4 bg-grid-pattern">
        <div className="glass-card p-8 max-w-sm w-full text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-xl font-semibold text-white">Verified Successfully!</h2>
          <p className="text-slate-400 text-sm">Your account has been secured. Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4 bg-grid-pattern">
      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4"><Logo /></div>
          <h1 className="text-xl font-semibold text-white mb-1">Account Verification</h1>
          <p className="text-slate-500 text-sm">Please verify your mobile number to continue</p>
        </div>

        <div className="glass-card p-7">
          {err && (
            <div className="text-red-400 text-sm bg-red-900/20 border border-red-800/40 rounded-lg p-3 mb-5 flex gap-2">
              <AlertCircle size={16} className="shrink-0" /> {err}
            </div>
          )}

          {status === 'idle' ? (
            <form onSubmit={handleGenerate} className="space-y-5">
              <div>
                <label className="label">Mobile Number</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="tel" 
                    placeholder="+91 9876543210" 
                    className="input-field !pl-9"
                    value={mobile}
                    onChange={e => setMobile(e.target.value)}
                    required 
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-2 px-1">
                  We'll use this for secure SMS verification via ReverseOTP.
                </p>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-2.5">
                {loading ? 'Processing...' : <>Verify Mobile <ArrowRight size={14} /></>}
              </button>
            </form>
          ) : (
            <div className="space-y-6 text-center">
              <div className="p-4 bg-slate-800/40 rounded-xl border border-white/5 space-y-4">
                <p className="text-sm text-slate-300">
                  Please send the verification SMS from <br />
                  <b className="text-white text-lg">{mobile}</b>
                </p>
                
                {qr && (
                  <div className="bg-white p-2 rounded-lg inline-block mx-auto">
                    <img src={qr} alt="Verification QR" className="w-32 h-32" />
                  </div>
                )}

                <div className="space-y-3">
                  <a href={intent} className="btn-primary w-full flex items-center justify-center gap-2 py-2.5">
                    <Smartphone size={16} /> Click to Send SMS
                  </a>
                  <button 
                    onClick={() => checkStatus(true)} 
                    disabled={manualLoading}
                    className="btn-secondary w-full py-2.5 flex items-center justify-center gap-2"
                  >
                    {manualLoading ? 'Checking...' : 'Check Status Manually'}
                  </button>
                  <p className="text-xs text-slate-500">
                    After sending the message, we'll automatically detect your verification.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 text-emerald-400/70 text-sm">
                <div className="w-4 h-4 border-2 border-emerald-400/20 border-t-emerald-400 rounded-full animate-spin" />
                Waiting for verification...
              </div>

              <button 
                onClick={() => setStatus('idle')} 
                className="text-xs text-slate-500 hover:text-white transition-colors"
              >
                Use a different number
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
