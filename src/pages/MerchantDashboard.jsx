import { useEffect, useState } from 'react';
import { ArrowLeftRight, CheckCircle2, Clock, XCircle, TrendingUp, ExternalLink } from 'lucide-react';
import { getMerchantTransactions, getMerchantProfile } from '../services/api';
import { StatsCard, StatusBadge, SectionHeader, PageLoader } from '../components/ui';
import Header from '../components/Header';
import { Link } from 'react-router-dom';

export default function MerchantDashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getMerchantTransactions({ limit: 8 }),
      getMerchantProfile(),
    ]).then(([txRes, profileRes]) => {
      const txData = txRes.data.data;
      const payments = txData.payments || [];
      const total = txData.total || 0;
      const success = payments.filter(p => p.status === 'SUCCESS').length;
      const failed = payments.filter(p => p.status === 'FAILED').length;
      const pending = payments.filter(p => ['CREATED','PENDING'].includes(p.status)).length;

      setStats({ total, success, failed, pending });
      setRecent(payments.slice(0, 6));
      setProfile(profileRes.data.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <>
      <Header title="Dashboard" />
      <div className="p-6"><PageLoader /></div>
    </>
  );

  return (
    <>
      <Header title="Dashboard" subtitle={profile?.name} />
      <div className="p-6 space-y-6 page-enter">

        {/* Welcome Banner */}
        <div className="glass-card p-5 flex items-center justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/20 to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 w-64 h-full bg-grid-pattern opacity-20" />
          <div className="relative">
            <div className="text-xs text-emerald-400 font-medium uppercase tracking-widest mb-1">Welcome back</div>
            <div className="text-2xl font-semibold text-white">{profile?.name}</div>
            <div className="text-sm text-slate-400 mt-0.5">{profile?.email}</div>
          </div>
          <Link to="/merchant/create-payment" className="btn-primary relative flex items-center gap-2 whitespace-nowrap">
            <TrendingUp size={15} /> Create Payment
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatsCard title="Total Payments" value={stats.total} icon={ArrowLeftRight} color="violet" />
          <StatsCard title="Successful" value={stats.success} icon={CheckCircle2} color="emerald" />
          <StatsCard title="Pending" value={stats.pending} icon={Clock} color="amber" />
          <StatsCard title="Failed" value={stats.failed} icon={XCircle} color="red" />
        </div>

        {/* Recent Payments */}
        <div className="glass-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <div>
              <h3 className="text-sm font-semibold text-white">Recent Payments</h3>
              <p className="text-xs text-slate-500 mt-0.5">Your last 6 transactions</p>
            </div>
            <Link to="/merchant/transactions" className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
              View all <ExternalLink size={12} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Order ID</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>UTR</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {recent.length === 0 ? (
                  <tr><td colSpan={6} className="text-center text-slate-600 py-10">No payments yet</td></tr>
                ) : recent.map(tx => (
                  <tr key={tx._id}>
                    <td><span className="font-mono text-xs text-emerald-400">{tx.payment_id}</span></td>
                    <td className="font-mono text-xs text-slate-400">{tx.order_id}</td>
                    <td><span className="font-mono font-semibold text-white">₹{tx.amount?.toLocaleString('en-IN')}</span></td>
                    <td><StatusBadge status={tx.status} /></td>
                    <td className="font-mono text-xs text-slate-500">{tx.utr || '—'}</td>
                    <td className="text-xs text-slate-500">
                      {new Date(tx.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MIDs assigned */}
        {profile?.mids?.length > 0 && (
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Assigned MIDs</h3>
            <div className="flex gap-2 flex-wrap">
              {profile.mids.map(mid => (
                <div key={mid._id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/8">
                  <span className="font-mono text-xs text-emerald-400 font-semibold">{mid.mid_code}</span>
                  <span className="text-xs text-slate-500 capitalize">{mid.provider}</span>
                  <StatusBadge status={mid.status} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
