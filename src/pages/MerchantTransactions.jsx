import { useEffect, useState } from 'react';
import { Filter, ArrowLeftRight } from 'lucide-react';
import { getMerchantTransactions } from '../services/api';
import { StatusBadge, Pagination, EmptyState, SectionHeader, PageLoader } from '../components/ui';
import Header from '../components/Header';

const STATUSES = ['', 'CREATED', 'PENDING', 'SUCCESS', 'FAILED', 'EXPIRED'];

export default function MerchantTransactions() {
  const [payments, setPayments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async (p = 1, s = status) => {
    setLoading(true);
    const params = { page: p, limit: 20 };
    if (s) params.status = s;
    const res = await getMerchantTransactions(params);
    setPayments(res.data.data.payments);
    setTotal(res.data.data.total);
    setLoading(false);
  };

  useEffect(() => { load(page, status); }, [page, status]);

  return (
    <>
      <Header title="Transactions" subtitle="Your payment history" />
      <div className="p-6 page-enter">
        <SectionHeader title="Transaction History" subtitle={`${total} total payments`} />

        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Filter size={14} className="text-slate-500" />
          {STATUSES.map(s => (
            <button key={s || 'all'} onClick={() => { setStatus(s); setPage(1); }}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${
                status === s ? 'border-emerald-600 bg-emerald-900/30 text-emerald-400' : 'border-white/10 text-slate-500 hover:text-slate-300'
              }`}>
              {s || 'All'}
            </button>
          ))}
        </div>

        <div className="glass-card overflow-hidden">
          {loading ? <PageLoader /> : (
            <>
              <div className="overflow-x-auto">
                <table className="table-base">
                  <thead>
                    <tr>
                      <th>Payment ID</th>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>UTR</th>
                      <th>MID</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.length === 0 ? (
                      <tr><td colSpan={8}><EmptyState icon={ArrowLeftRight} title="No transactions found" /></td></tr>
                    ) : payments.map(tx => (
                      <tr key={tx._id}>
                        <td><span className="font-mono text-xs text-emerald-400">{tx.payment_id}</span></td>
                        <td className="font-mono text-xs text-slate-400">{tx.order_id}</td>
                        <td className="text-sm text-slate-300">{tx.customer_name || '—'}</td>
                        <td><span className="font-mono font-semibold text-white">₹{tx.amount?.toLocaleString('en-IN')}</span></td>
                        <td><StatusBadge status={tx.status} /></td>
                        <td><span className="font-mono text-xs text-slate-400">{tx.utr || '—'}</span></td>
                        <td><span className="font-mono text-xs text-blue-300">{tx.mid_id?.mid_code || '—'}</span></td>
                        <td className="text-xs text-slate-500">
                          {new Date(tx.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={page} total={total} limit={20} onChange={setPage} />
            </>
          )}
        </div>
      </div>
    </>
  );
}
