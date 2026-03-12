import { useEffect, useState } from 'react';
import { Users, ArrowLeftRight, CheckCircle2, XCircle, TrendingUp, Clock } from 'lucide-react';
import { getAdminDashboard, getMerchants, getAdminTransactions } from '../services/api';
import { StatsCard, StatusBadge, PageLoader, SectionHeader } from '../components/ui';
import Header from '../components/Header';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentTx, setRecentTx] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getMerchants({ limit: 1 }),
      getAdminTransactions({ limit: 8 }),
    ]).then(([merchantsRes, txRes]) => {
      const txData = txRes.data.data;
      const payments = txData.payments || [];
      const total = txData.total || 0;
      const success = payments.filter(p => p.status === 'SUCCESS').length;
      const failed = payments.filter(p => p.status === 'FAILED').length;
      const pending = payments.filter(p => ['CREATED','PENDING'].includes(p.status)).length;

      setStats({
        merchants: merchantsRes.data.data.total || 0,
        total,
        success,
        failed,
        pending,
        successRate: txData.success_rate || '0%',
      });
      setRecentTx(payments.slice(0, 8));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <>
      <Header title="Dashboard" subtitle="Platform overview" />
      <div className="p-6"><PageLoader /></div>
    </>
  );

  return (
    <>
      <Header title="Dashboard" subtitle="Platform overview" />
      <div className="p-6 space-y-6 page-enter">

        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatsCard title="Total Merchants" value={stats.merchants} icon={Users} color="blue" />
          <StatsCard title="Total Transactions" value={stats.total} icon={ArrowLeftRight} color="violet" />
          <StatsCard title="Successful" value={stats.success} icon={CheckCircle2} color="emerald" subtitle={stats.successRate} />
          <StatsCard title="Failed" value={stats.failed} icon={XCircle} color="red" />
        </div>

        {/* Recent Transactions */}
        <div className="glass-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <div>
              <h3 className="text-sm font-semibold text-white">Recent Transactions</h3>
              <p className="text-xs text-slate-500 mt-0.5">Last 8 payments across all merchants</p>
            </div>
            <TrendingUp size={16} className="text-emerald-400" />
          </div>
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Merchant</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>UTR</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentTx.length === 0 ? (
                  <tr><td colSpan={6} className="text-center text-slate-600 py-10">No transactions yet</td></tr>
                ) : recentTx.map(tx => (
                  <tr key={tx._id}>
                    <td><span className="font-mono text-xs text-emerald-400">{tx.payment_id}</span></td>
                    <td className="text-xs">{tx.merchant_id?.name || '—'}</td>
                    <td><span className="font-mono text-sm font-medium">₹{tx.amount?.toLocaleString()}</span></td>
                    <td><StatusBadge status={tx.status} /></td>
                    <td><span className="font-mono text-xs text-slate-400">{tx.utr || '—'}</span></td>
                    <td className="text-xs text-slate-400">{new Date(tx.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick stats row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Pending Payments', value: stats.pending, icon: Clock, color: 'text-amber-400 bg-amber-900/20' },
            { label: 'Success Rate', value: stats.successRate, icon: TrendingUp, color: 'text-emerald-400 bg-emerald-900/20' },
            { label: 'Active MIDs', value: '—', icon: ArrowLeftRight, color: 'text-blue-400 bg-blue-900/20' },
          ].map(item => (
            <div key={item.label} className="glass-card p-4 flex items-center gap-4">
              <div className={`p-2.5 rounded-xl ${item.color.split(' ')[1]}`}>
                <item.icon size={18} className={item.color.split(' ')[0]} />
              </div>
              <div>
                <div className="font-mono text-xl font-semibold text-white">{item.value}</div>
                <div className="text-xs text-slate-500">{item.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
