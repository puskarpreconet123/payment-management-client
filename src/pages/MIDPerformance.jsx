import { useEffect, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Clock, BarChart3, TrendingUp, AlertCircle } from 'lucide-react';
import { getMidPerformance } from '../services/api';
import { SectionHeader, PageLoader, EmptyState, Pagination } from '../components/ui';
import Header from '../components/Header';

export default function MIDPerformance() {
  const { setSidebarOpen } = useOutletContext();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(() => parseInt(localStorage.getItem('rf_limit_pref')) || 15);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async (p = page, l = limit) => {
    setLoading(true);
    setError('');
    try {
      const res = await getMidPerformance({ page: p, limit: l });
      const items = res.data?.data?.mids || res.data?.data?.data || res.data?.data;
      setData(Array.isArray(items) ? items : []);
      setTotal(res.data?.data?.total || (Array.isArray(items) ? items.length : 0));
    } catch (e) {
      console.error('Failed to load performance data', e);
      setError('Failed to load real-time analytics. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLimitChange = (l) => {
    setLimit(l);
    setPage(1);
    localStorage.setItem('rf_limit_pref', l);
  };

  const getStatusColor = (rate) => {
    if (rate >= 90) return 'text-emerald-400';
    if (rate >= 75) return 'text-blue-400';
    if (rate >= 50) return 'text-amber-400';
    return 'text-red-400';
  };

  const getTimeRanges = () => ['15m', '1h', '6h'];

  return (
    <>
      <Header 
        title="MID Performance" 
        subtitle="Real-time transaction success rate monitoring" 
        onMenuClick={() => setSidebarOpen(true)}
      />
      <div className="p-6 page-enter">
        <SectionHeader
          title="Performance Analytics"
          subtitle="Success rates across different time intervals"
          action={
            <button onClick={() => loadData()} className="btn-secondary flex items-center gap-2">
              <Clock size={14} /> Refresh Data
            </button>
          }
        />

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-900/20 border border-red-800/40 flex items-center gap-3 text-red-200">
            <AlertCircle size={18} className="text-red-400" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 glass-card px-3 py-1.5 border-dashed">
            <div className="w-2 h-2 rounded-full bg-emerald-400"></div> Excellent (&gt;90%)
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 glass-card px-3 py-1.5 border-dashed">
            <div className="w-2 h-2 rounded-full bg-blue-400"></div> Good (75-90%)
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 glass-card px-3 py-1.5 border-dashed">
            <div className="w-2 h-2 rounded-full bg-amber-400"></div> Warning (50-75%)
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 glass-card px-3 py-1.5 border-dashed">
            <div className="w-2 h-2 rounded-full bg-red-400"></div> Critical (&lt;50%)
          </div>
        </div>

        {loading ? (
          <div className="glass-card p-12 text-center">
            <PageLoader />
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead>
                  <tr>
                    <th className="w-1/4">MID Details</th>
                    {getTimeRanges().map(range => (
                      <th key={range} className="text-center">
                        <div className="flex flex-col items-center">
                          <span className="capitalize">
                            {range === '15m' ? 'Last 15 Min' : `Last ${range}`}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan={4}>
                        <EmptyState 
                          icon={BarChart3} 
                          title="No transaction data found" 
                          desc="Transactions from the last 6 hours will appear here once processed." 
                        />
                      </td>
                    </tr>
                  ) : (
                    data.map((mid) => (
                      <tr key={mid._id} className="hover:bg-white/5 transition-colors">
                        <td className="py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-white">{mid.mid_code}</span>
                            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                              {mid.provider}
                            </span>
                          </div>
                        </td>
                        {getTimeRanges().map((range) => {
                          // Standard JS comment here instead of JSX comment!
                          const stats = mid?.stats?.[range] || { success_rate: 0, success: 0, total: 0 };
                          return (
                            <td key={range} className="text-center py-4">
                              <div className="flex flex-col items-center">
                                <span className={`text-lg font-bold ${getStatusColor(stats.success_rate)}`}>
                                  {stats.success_rate}%
                                </span>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <TrendingUp size={10} className="text-slate-600" />
                                  <span className="text-[10px] text-slate-500 font-medium">
                                    {stats.success} / {stats.total}
                                  </span>
                                </div>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
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
          </div>
        )}
      </div>
    </>
  );
}