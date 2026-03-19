import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Filter, ArrowLeftRight, Calendar, ExternalLink } from 'lucide-react';
import { getMerchantTransactions } from '../services/api';
import { StatusBadge, PageLoader, Pagination, SectionHeader, EmptyState } from '../components/ui';
import Header from '../components/Header';

const STATUSES = ['', 'CREATED', 'PENDING', 'SUCCESS', 'FAILED', 'EXPIRED'];

export default function MerchantTransactions() {
  const { setSidebarOpen } = useOutletContext();
  const [data, setData] = useState({ payments: [], total: 0 });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(() => parseInt(localStorage.getItem('rf_limit_pref')) || 20);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async (p = page, l = limit, s = status) => {
    setLoading(true);
    const params = { page: p, limit: l };
    if (s) params.status = s;
    const res = await getMerchantTransactions(params);
    setData(res.data.data);
    setLoading(false);
  };

  useEffect(() => { load(page, limit, status); }, [page, limit, status]);

  const handleLimitChange = (l) => {
    setLimit(l);
    setPage(1);
    localStorage.setItem('rf_limit_pref', l);
  };

  return (
    <>
      <Header
        title="Merchant Transactions"
        subtitle="Manage and search all payments"
        onMenuClick={() => setSidebarOpen(true)}
      />
      {/* Light background wrapping the page content */}
      <div className="p-6 page-enter bg-gray-50/50 min-h-[calc(100vh-64px)]">
        <SectionHeader title="Transaction History" subtitle={`${data.total} total payments`} />

        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Filter size={14} className="text-gray-500" />
          {STATUSES.map(s => (
            <button key={s || 'all'} onClick={() => { setStatus(s); setPage(1); }}
              className={`text-xs px-3.5 py-1.5 rounded-full border transition-all font-medium shadow-sm ${
                status === s 
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-700' 
                  : 'border-gray-200 bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}>
              {s || 'All'}
            </button>
          ))}
        </div>

        {/* Replaced glass-card with a clean white enterprise card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? <PageLoader /> : (
            <>
              <div className="overflow-x-auto">
                {/* Added inline overrides to ensure light mode compliance over global table-base styles */}
                <table className="table-base w-full text-left">
                  <thead className="text-gray-600 border-b border-gray-100 bg-gray-50/50">
                    <tr>
                      <th className="font-medium py-3 px-5 text-sm">Payment ID</th>
                      <th className="font-medium py-3 px-5 text-sm">Order ID</th>
                      <th className="font-medium py-3 px-5 text-sm">Customer</th>
                      <th className="font-medium py-3 px-5 text-sm">Amount</th>
                      <th className="font-medium py-3 px-5 text-sm">Status</th>
                      <th className="font-medium py-3 px-5 text-sm">UTR</th>
                      <th className="font-medium py-3 px-5 text-sm">MID</th>
                      <th className="font-medium py-3 px-5 text-sm">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.payments.length === 0 ? (
                      <tr><td colSpan={8} className="py-12"><EmptyState icon={ArrowLeftRight} title="No transactions found" /></td></tr>
                    ) : data.payments.map(tx => (
                      <tr key={tx._id} className="hover:bg-gray-50/50 transition-colors">
                        {/* Swapped text-emerald-400 to text-emerald-600 for light background contrast */}
                        <td className="py-3 px-5"><span className="font-mono text-xs text-emerald-600 font-medium">{tx.payment_id}</span></td>
                        <td className="py-3 px-5 font-mono text-xs text-gray-500">{tx.order_id}</td>
                        <td className="py-3 px-5 text-sm text-gray-900 font-medium">{tx.customer_name || '—'}</td>
                        <td className="py-3 px-5"><span className="font-mono font-bold text-gray-900">₹{tx.amount?.toLocaleString('en-IN')}</span></td>
                        <td className="py-3 px-5"><StatusBadge status={tx.status} /></td>
                        <td className="py-3 px-5"><span className="font-mono text-xs text-gray-500">{tx.utr || '—'}</span></td>
                        {/* Kept blue specifically for MID identifier to differentiate from payment ID */}
                        <td className="py-3 px-5"><span className="font-mono text-xs text-blue-600 font-medium">{tx.mid_id?.mid_code || '—'}</span></td>
                        <td className="py-3 px-5 text-xs text-gray-500">
                          {new Date(tx.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination 
                page={page} 
                total={data.total} 
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