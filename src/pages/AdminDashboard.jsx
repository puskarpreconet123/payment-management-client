import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Users, ArrowLeftRight, CheckCircle2, XCircle, TrendingUp, Clock } from 'lucide-react';
import { getAdminDashboard, getMerchants, getAdminTransactions } from '../services/api';
import { StatsCard, StatusBadge, PageLoader, SectionHeader } from '../components/ui';
import Header from '../components/Header';

export default function AdminDashboard() {
  const { setSidebarOpen } = useOutletContext();
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
      const success = txData.success_count || 0;
      const failed = txData.failed_count || 0;
      const pending = txData.pending_count || 0;

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
      <Header title="Dashboard" subtitle="Platform overview" onMenuClick={() => setSidebarOpen(true)} />
      <div className="p-6 bg-gray-50/50 min-h-screen"><PageLoader /></div>
    </>
  );

  return (
    <>
      <Header title="Dashboard" subtitle="Platform overview" onMenuClick={() => setSidebarOpen(true)} />
      <div className="p-6 space-y-6 page-enter bg-gray-50/50 min-h-[calc(100vh-64px)]">

        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatsCard title="Total Merchants" value={stats.merchants} icon={Users} color="blue" />
          <StatsCard title="Total Transactions" value={stats.total} icon={ArrowLeftRight} color="violet" />
          <StatsCard title="Successful" value={stats.success} icon={CheckCircle2} color="emerald" subtitle={stats.successRate} />
          <StatsCard title="Failed" value={stats.failed} icon={XCircle} color="red" />
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-bold text-gray-900 tracking-tight">Recent Transactions</h3>
              <p className="text-xs font-medium text-gray-500 mt-0.5">Last 8 payments across all merchants</p>
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100">
              <TrendingUp size={16} className="text-emerald-600" />
            </div>
          </div>
          <div className="overflow-x-auto">
            {/* Inline overrides for light mode compliance */}
            <table className="table-base w-full text-left">
              <thead className="text-gray-600 border-b border-gray-100 bg-gray-50/50">
                <tr>
                  <th className="font-medium py-3 px-6 text-sm">Payment ID</th>
                  <th className="font-medium py-3 px-6 text-sm">Merchant</th>
                  <th className="font-medium py-3 px-6 text-sm">Amount</th>
                  <th className="font-medium py-3 px-6 text-sm">Status</th>
                  <th className="font-medium py-3 px-6 text-sm">UTR</th>
                  <th className="font-medium py-3 px-6 text-sm">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentTx.length === 0 ? (
                  <tr><td colSpan={6} className="text-center text-gray-500 py-10 font-medium">No transactions yet</td></tr>
                ) : recentTx.map(tx => (
                  <tr key={tx._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-6"><span className="font-mono text-xs text-emerald-600 font-bold">{tx.payment_id}</span></td>
                    <td className="py-3 px-6 text-sm font-medium text-gray-700">{tx.merchant_id?.name || '—'}</td>
                    <td className="py-3 px-6"><span className="font-mono text-sm font-bold text-gray-900">₹{tx.amount?.toLocaleString()}</span></td>
                    <td className="py-3 px-6"><StatusBadge status={tx.status} /></td>
                    <td className="py-3 px-6"><span className="font-mono text-xs text-gray-500 font-medium">{tx.utr || '—'}</span></td>
                    <td className="py-3 px-6 text-xs text-gray-500 font-medium">{new Date(tx.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick stats row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Pending Payments', value: stats.pending, icon: Clock, iconColor: 'text-amber-600', bgClass: 'bg-amber-50 border border-amber-100' },
            { label: 'Success Rate', value: stats.successRate, icon: TrendingUp, iconColor: 'text-emerald-600', bgClass: 'bg-emerald-50 border border-emerald-100' },
            { label: 'Active MIDs', value: '—', icon: ArrowLeftRight, iconColor: 'text-blue-600', bgClass: 'bg-blue-50 border border-blue-100' },
          ].map(item => (
            <div key={item.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center gap-4 hover:shadow-md transition-shadow duration-200">
              <div className={`p-3 rounded-xl ${item.bgClass}`}>
                <item.icon size={20} className={item.iconColor} />
              </div>
              <div>
                <div className="font-mono text-2xl font-bold text-gray-900 tracking-tight">{item.value}</div>
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{item.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}