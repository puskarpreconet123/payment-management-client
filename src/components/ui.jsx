import { useState, useRef, useEffect } from 'react';
import { Loader2, X, ChevronLeft, ChevronRight } from 'lucide-react';

// ── Logo ──────────────────────────────────────
export function Logo({ size = 'md' }) {
  const sz = size === 'sm' ? 'text-lg' : 'text-2xl';
  return (
    <div className={`font-bold ${sz} tracking-tight flex items-center gap-2`}>
      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-sm shadow-emerald-500/20">
        <span className="text-white text-xs font-black">₹</span>
      </div>
      <span className="text-white">Pay<span className="text-emerald-600">Nexa</span></span>
    </div>
  );
}

// ── Status Badge ───────────────────────────────
const STATUS_MAP = {
  SUCCESS:   { bg: 'bg-emerald-50',  text: 'text-emerald-700',  border: 'border border-emerald-200',  dot: 'bg-emerald-500' },
  CREATED:   { bg: 'bg-blue-50',     text: 'text-blue-700',     border: 'border border-blue-200',     dot: 'bg-blue-500' },
  PENDING:   { bg: 'bg-amber-50',    text: 'text-amber-700',    border: 'border border-amber-200',    dot: 'bg-amber-500' },
  FAILED:    { bg: 'bg-red-50',      text: 'text-red-700',      border: 'border border-red-200',      dot: 'bg-red-500' },
  EXPIRED:   { bg: 'bg-gray-100',    text: 'text-gray-700',     border: 'border border-gray-200',     dot: 'bg-gray-500' },
  active:    { bg: 'bg-emerald-50',  text: 'text-emerald-700',  border: 'border border-emerald-200',  dot: 'bg-emerald-500' },
  inactive:  { bg: 'bg-gray-100',    text: 'text-gray-700',     border: 'border border-gray-200',     dot: 'bg-gray-500' },
  suspended: { bg: 'bg-red-50',      text: 'text-red-700',      border: 'border border-red-200',      dot: 'bg-red-500' },
  success:   { bg: 'bg-emerald-50',  text: 'text-emerald-700',  border: 'border border-emerald-200',  dot: 'bg-emerald-500' },
  failed:    { bg: 'bg-red-50',      text: 'text-red-700',      border: 'border border-red-200',      dot: 'bg-red-500' },
  pending:   { bg: 'bg-amber-50',    text: 'text-amber-700',    border: 'border border-amber-200',    dot: 'bg-amber-500' },
  exhausted: { bg: 'bg-red-50',      text: 'text-red-700',      border: 'border border-red-200',      dot: 'bg-red-500' },
};

export function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text} ${s.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

// ── Stats Card ─────────────────────────────────
export function StatsCard({ title, value, icon: Icon, trend, color = 'emerald', subtitle }) {
  const colors = {
    emerald: { icon: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    blue:    { icon: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-100' },
    amber:   { icon: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-100' },
    red:     { icon: 'text-red-600',     bg: 'bg-red-50',     border: 'border-red-100' },
    violet:  { icon: 'text-violet-600',  bg: 'bg-violet-50',  border: 'border-violet-100' },
  };
  const c = colors[color] || colors.emerald;
  
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2 rounded-lg ${c.bg} border ${c.border}`}>
          <Icon size={20} className={c.icon} />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-mono font-bold ${trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="font-mono text-3xl font-bold text-gray-900 mb-1 tracking-tight">{value}</div>
      <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{title}</div>
      {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
    </div>
  );
}

// ── Spinner ────────────────────────────────────
export function Spinner({ size = 18, className = '' }) {
  return <Loader2 size={size} className={`animate-spin text-emerald-500 ${className}`} />;
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <Spinner size={32} />
        <span className="text-gray-400 text-sm font-medium tracking-wide">Processing...</span>
      </div>
    </div>
  );
}

// ── Modal ──────────────────────────────────────
export function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`${maxWidth} w-full bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 animate-in fade-in zoom-in duration-200`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Pagination ─────────────────────────────────
export function Pagination({ page, total, limit, onChange, onLimitChange }) {
  const totalPages = Math.ceil(total / (limit || 10));
  const [jumpPage, setJumpPage] = useState(page);
  const [tempLimit, setTempLimit] = useState(limit);
  const timerRef = useRef(null);

  useEffect(() => { setJumpPage(page); }, [page]);
  useEffect(() => { setTempLimit(limit); }, [limit]);

  if (total <= 0) return null;

  const commitJump = () => {
    const p = Math.max(1, Math.min(parseInt(jumpPage), totalPages));
    if (!isNaN(p) && p !== page) onChange(p);
  };

  const commitLimit = () => {
    const l = Math.max(1, parseInt(tempLimit));
    if (!isNaN(l) && l !== limit) onLimitChange(l);
  };

  const handleLimitChange = (val) => {
    setTempLimit(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(commitLimit, 1500);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-100 bg-white">
      <div className="flex items-center gap-6">
        <span className="text-[11px] text-gray-400 font-mono uppercase tracking-widest font-bold">
          Showing {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total}
        </span>
        
        <div className="flex items-center gap-2 border-l border-gray-100 pl-6">
          <label className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Limit</label>
          <input
            type="number"
            value={tempLimit}
            onChange={(e) => handleLimitChange(e.target.value)}
            onBlur={commitLimit}
            onKeyDown={(e) => e.key === 'Enter' && commitLimit()}
            className="w-12 h-8 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono text-center text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 pr-4 border-r border-gray-100">
            <label className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Jump</label>
            <input
              type="number"
              value={jumpPage}
              onChange={(e) => setJumpPage(e.target.value)}
              onBlur={commitJump}
              onKeyDown={(e) => e.key === 'Enter' && commitJump()}
              className="w-10 h-8 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono text-center text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="flex gap-1.5">
            <button
              onClick={() => onChange(page - 1)}
              disabled={page <= 1}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-20 transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            
            <div className="flex items-center gap-1.5">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                if (p <= 0 || p > totalPages) return null;
                return (
                  <button
                    key={p}
                    onClick={() => onChange(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-mono font-bold transition-all border ${
                      p === page 
                        ? 'bg-emerald-500 border-emerald-500 text-slate-100 shadow-sm shadow-emerald-500/20' 
                        : 'bg-white border-gray-200 text-gray-500 hover:border-emerald-300 hover:text-emerald-600'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => onChange(page + 1)}
              disabled={page >= totalPages}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-20 transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Empty State ────────────────────────────────
export function EmptyState({ icon: Icon, title, desc }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4 border border-gray-100">
        {Icon && <Icon size={28} className="text-gray-300" />}
      </div>
      <div className="text-gray-900 font-bold tracking-tight mb-1">{title}</div>
      {desc && <div className="text-gray-500 text-sm max-w-xs">{desc}</div>}
    </div>
  );
}

// ── Section Header ─────────────────────────────
export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-gray-400 text-sm mt-0.5 font-medium">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ── Copy Button ────────────────────────────────
export function CopyButton({ text, label = '' }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <button onClick={copy} className="inline-flex items-center px-2.5 py-1.5 rounded-lg bg-gray-50 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-200 text-gray-500 hover:text-emerald-700 transition-all font-mono text-[10px] font-bold shadow-sm uppercase">
      {copied ? '✓ Copied' : (label || 'Copy')}
    </button>
  );
}