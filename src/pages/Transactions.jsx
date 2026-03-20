import { useEffect, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Filter, ArrowLeftRight } from 'lucide-react';
import { getAdminTransactions } from '../services/api';
import { StatusBadge, Pagination, EmptyState, SectionHeader, PageLoader } from '../components/ui';
import Header from '../components/Header';

const STATUSES = ['', 'CREATED', 'PENDING', 'SUCCESS', 'FAILED', 'EXPIRED'];

export default function Transactions() {
  const { setSidebarOpen } = useOutletContext();
  const [payments, setPayments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(() => parseInt(localStorage.getItem('rf_limit_pref')) || 20);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [successRate, setSuccessRate] = useState('0%');

  const load = useCallback(async (p = page, l = limit, s = status) => {
    setLoading(true);
    try {
      const params = { page: p, limit: l };
      if (s) params.status = s;
      const res = await getAdminTransactions(params);
      
      // Safety check for API response structure
      const data = res.data?.data?.payments || [];
      setPayments(Array.isArray(data) ? data : []);
      setTotal(res.data?.data?.total || 0);
      setSuccessRate(res.data?.data?.success_rate || '0%');
    } catch (e) { 
      console.error("Transaction load failed:", e); 
    } finally {
      setLoading(false);
    }
  }, [page, limit, status]);

  useEffect(() => { 
    load(); 
  }, [load]);

  const handleLimitChange = (l) => {
    setLimit(l);
    setPage(1);
    localStorage.setItem('rf_limit_pref', l);
  };

  const handleStatusChange = (s) => { 
    setStatus(s); 
    setPage(1); 
  };

  return (
    <>
      <Header 
        title="Transactions" 
        subtitle="All payments across the platform" 
        onMenuClick={() => setSidebarOpen(true)}
      />
      <div className="p-6 page-enter">
        <SectionHeader
          title="All Transactions"
          subtitle={`${total} total · ${successRate} success rate`}
        />

        {/* Filters */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto whitespace-nowrap pb-2 hide-scrollbar">
          <Filter size={14} className="text-slate-500 shrink-0" />
          {STATUSES.map(s => (
            <button
              key={s || 'all'}
              onClick={() => handleStatusChange(s)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium shrink-0 ${
                status === s
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-500'
                  : 'border-white/10 text-slate-500 hover:text-slate-300 hover:border-white/20'
              }`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>

        <div className="glass-card overflow-hidden">
          {loading ? (
            <div className="p-20"><PageLoader /></div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="table-base">
                  <thead>
                    <tr>
                      <th>Payment ID</th>
                      <th>Merchant</th>
                      <th>Order ID</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>UTR</th>
                      <th>MID</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan={8}>
                          <EmptyState icon={ArrowLeftRight} title="No transactions found" />
                        </td>
                      </tr>
                    ) : payments.map(tx => (
                      <tr key={tx._id}>
                        <td>
                          <span className="font-mono text-xs text-emerald-400 font-semibold">
                            {tx.payment_id}
                          </span>
                        </td>
                        {/* Use text-white for auto-theme switching to dark text in light mode */}
                        <td className="text-sm text-white font-medium">
                          {tx.merchant_id?.name || '—'}
                        </td>
                        <td className="font-mono text-xs text-slate-400">
                          {tx.order_id}
                        </td>
                        <td>
                          <span className="font-mono font-bold text-white">
                            ₹{tx.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td><StatusBadge status={tx.status} /></td>
                        <td>
                          <span className="font-mono text-xs text-slate-400">
                            {tx.utr || '—'}
                          </span>
                        </td>
                        <td>
                          <span className="font-mono text-xs text-blue-400">
                            {tx.mid_id?.mid_code || '—'}
                          </span>
                        </td>
                        <td className="text-xs text-slate-500">
                          {new Date(tx.createdAt).toLocaleString('en-IN', { 
                            dateStyle: 'short', 
                            timeStyle: 'short' 
                          })}
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
      </div>
    </>
  );
}