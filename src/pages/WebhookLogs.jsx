import { useEffect, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Webhook, RefreshCw } from 'lucide-react';
import { getWebhookLogs } from '../services/api';
import { StatusBadge, Pagination, EmptyState, SectionHeader, PageLoader } from '../components/ui';
import Header from '../components/Header';

export default function WebhookLogs() {
  const { setSidebarOpen } = useOutletContext();
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(() => parseInt(localStorage.getItem('rf_limit_pref')) || 20);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (p = page, l = limit) => {
    setLoading(true);
    try {
      const res = await getWebhookLogs({ page: p, limit: l });
      // Defensive extraction of the logs array
      const items = res.data?.data?.logs || res.data?.data || [];
      setLogs(Array.isArray(items) ? items : []);
      setTotal(res.data?.data?.total || 0);
    } catch (e) {
      console.error('Failed to load logs', e);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => { 
    load(); 
  }, [load]);

  const handleLimitChange = (l) => {
    setLimit(l);
    setPage(1);
    localStorage.setItem('rf_limit_pref', l);
  };

  return (
    <>
      <Header 
        title="Webhook Logs" 
        subtitle="Monitor merchant webhook deliveries" 
        onMenuClick={() => setSidebarOpen(true)}
      />
      <div className="p-6 page-enter">
        <SectionHeader
          title="Webhook Delivery Logs"
          subtitle={`${total} total attempts`}
          action={
            <button onClick={() => load()} className="btn-secondary flex items-center gap-2">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> 
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          }
        />

        <div className="glass-card overflow-hidden">
          {loading ? (
            <div className="py-20"><PageLoader /></div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="table-base">
                  <thead>
                    <tr>
                      <th>Payment ID</th>
                      <th>Webhook URL</th>
                      <th>Status</th>
                      <th>Attempt</th>
                      <th>HTTP Status</th>
                      <th>Error</th>
                      <th>Next Retry</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.length === 0 ? (
                      <tr><td colSpan={8}><EmptyState icon={Webhook} title="No webhook logs found" /></td></tr>
                    ) : logs.map(log => (
                      <tr key={log._id}>
                        <td>
                          <span className="font-mono text-xs text-emerald-400 font-semibold">
                            {log.payment_id}
                          </span>
                        </td>
                        <td>
                          <span className="text-xs text-slate-400 max-w-[200px] truncate block" title={log.webhook_url}>
                            {log.webhook_url}
                          </span>
                        </td>
                        <td><StatusBadge status={log.status} /></td>
                        <td>
                          <span className="font-mono text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-white">
                            TRY #{log.attempt_number}
                          </span>
                        </td>
                        <td>
                          {log.response_status ? (
                            <span className={`font-mono text-xs font-bold ${log.response_status < 300 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {log.response_status}
                            </span>
                          ) : <span className="text-slate-600">—</span>}
                        </td>
                        <td>
                          <span className="text-xs text-red-400 max-w-[140px] truncate block" title={log.error_message}>
                            {log.error_message || '—'}
                          </span>
                        </td>
                        <td className="text-xs text-amber-400 font-mono">
                          {log.next_retry_at 
                            ? new Date(log.next_retry_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
                            : <span className="text-slate-600">None</span>
                          }
                        </td>
                        <td className="text-xs text-slate-500 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
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