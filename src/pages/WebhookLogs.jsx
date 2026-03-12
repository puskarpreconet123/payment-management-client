import { useEffect, useState } from 'react';
import { Webhook, RefreshCw } from 'lucide-react';
import { getWebhookLogs } from '../services/api';
import { StatusBadge, Pagination, EmptyState, SectionHeader, PageLoader } from '../components/ui';
import Header from '../components/Header';

export default function WebhookLogs() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = async (p = 1) => {
    setLoading(true);
    const res = await getWebhookLogs({ page: p, limit: 20 });
    setLogs(res.data.data.logs);
    setTotal(res.data.data.total);
    setLoading(false);
  };

  useEffect(() => { load(page); }, [page]);

  return (
    <>
      <Header title="Webhook Logs" subtitle="Monitor merchant webhook deliveries" />
      <div className="p-6 page-enter">
        <SectionHeader
          title="Webhook Delivery Logs"
          subtitle={`${total} total attempts`}
          action={
            <button onClick={() => load(page)} className="btn-secondary flex items-center gap-2">
              <RefreshCw size={14} /> Refresh
            </button>
          }
        />

        <div className="glass-card overflow-hidden">
          {loading ? <PageLoader /> : (
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
                      <tr><td colSpan={8}><EmptyState icon={Webhook} title="No webhook logs" /></td></tr>
                    ) : logs.map(log => (
                      <tr key={log._id}>
                        <td><span className="font-mono text-xs text-emerald-400">{log.payment_id}</span></td>
                        <td>
                          <span className="text-xs text-slate-400 max-w-[160px] truncate block" title={log.webhook_url}>
                            {log.webhook_url}
                          </span>
                        </td>
                        <td><StatusBadge status={log.status} /></td>
                        <td>
                          <span className="font-mono text-xs bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                            #{log.attempt_number}
                          </span>
                        </td>
                        <td>
                          {log.response_status ? (
                            <span className={`font-mono text-xs ${log.response_status < 300 ? 'text-emerald-400' : 'text-red-400'}`}>
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
                          {log.next_retry_at ? new Date(log.next_retry_at).toLocaleTimeString('en-IN') : '—'}
                        </td>
                        <td className="text-xs text-slate-500">
                          {new Date(log.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
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
