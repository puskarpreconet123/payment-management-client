import { Loader2, X, ChevronLeft, ChevronRight } from 'lucide-react';

// ── Logo ──────────────────────────────────────
export function Logo({ size = 'md' }) {
  const sz = size === 'sm' ? 'text-lg' : 'text-2xl';
  return (
    <div className={`font-bold ${sz} tracking-tight flex items-center gap-2`}>
      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-900/40">
        <span className="text-white text-xs font-black">₹</span>
      </div>
      <span className="text-white">Pay<span className="text-emerald-400">Nexa</span></span>
    </div>
  );
}

// ── Status Badge ───────────────────────────────
const STATUS_MAP = {
  SUCCESS:   { bg: 'bg-emerald-900/40',  text: 'text-emerald-400',  border: 'border border-emerald-800/50',  dot: 'bg-emerald-400' },
  CREATED:   { bg: 'bg-blue-900/40',     text: 'text-blue-300',     border: 'border border-blue-800/50',     dot: 'bg-blue-400' },
  PENDING:   { bg: 'bg-amber-900/40',    text: 'text-amber-400',    border: 'border border-amber-800/50',    dot: 'bg-amber-400' },
  FAILED:    { bg: 'bg-red-900/40',      text: 'text-red-400',      border: 'border border-red-800/50',      dot: 'bg-red-400' },
  EXPIRED:   { bg: 'bg-slate-700/40',    text: 'text-slate-400',    border: 'border border-slate-600/50',    dot: 'bg-slate-400' },
  active:    { bg: 'bg-emerald-900/40',  text: 'text-emerald-400',  border: 'border border-emerald-800/50',  dot: 'bg-emerald-400' },
  inactive:  { bg: 'bg-slate-700/40',    text: 'text-slate-400',    border: 'border border-slate-600/50',    dot: 'bg-slate-400' },
  suspended: { bg: 'bg-red-900/40',      text: 'text-red-400',      border: 'border border-red-800/50',      dot: 'bg-red-400' },
  success:   { bg: 'bg-emerald-900/40',  text: 'text-emerald-400',  border: 'border border-emerald-800/50',  dot: 'bg-emerald-400' },
  failed:    { bg: 'bg-red-900/40',      text: 'text-red-400',      border: 'border border-red-800/50',      dot: 'bg-red-400' },
  pending:   { bg: 'bg-amber-900/40',    text: 'text-amber-400',    border: 'border border-amber-800/50',    dot: 'bg-amber-400' },
  exhausted: { bg: 'bg-red-900/40',      text: 'text-red-400',      border: 'border border-red-800/50',      dot: 'bg-red-400' },
};

export function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.PENDING;
  return (
    <span className={`status-badge ${s.bg} ${s.text} ${s.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

// ── Stats Card ─────────────────────────────────
export function StatsCard({ title, value, icon: Icon, trend, color = 'emerald', subtitle }) {
  const colors = {
    emerald: { icon: 'text-emerald-400', bg: 'bg-emerald-900/20', border: 'border-emerald-800/30' },
    blue:    { icon: 'text-blue-400',    bg: 'bg-blue-900/20',    border: 'border-blue-800/30' },
    amber:   { icon: 'text-amber-400',   bg: 'bg-amber-900/20',   border: 'border-amber-800/30' },
    red:     { icon: 'text-red-400',     bg: 'bg-red-900/20',     border: 'border-red-800/30' },
    violet:  { icon: 'text-violet-400',  bg: 'bg-violet-900/20',  border: 'border-violet-800/30' },
  };
  const c = colors[color];
  return (
    <div className={`stat-card relative overflow-hidden`}>
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-2.5 rounded-10 ${c.bg} border ${c.border}`}>
            <Icon size={18} className={c.icon} />
          </div>
          {trend !== undefined && (
            <span className={`text-xs font-mono font-medium ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
          )}
        </div>
        <div className="font-mono text-3xl font-semibold text-white mb-1 tracking-tight">{value}</div>
        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</div>
        {subtitle && <div className="text-xs text-slate-500 mt-1">{subtitle}</div>}
      </div>
    </div>
  );
}

// ── Spinner ────────────────────────────────────
export function Spinner({ size = 18, className = '' }) {
  return <Loader2 size={size} className={`animate-spin text-emerald-400 ${className}`} />;
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <Spinner size={32} />
        <span className="text-slate-500 text-sm">Loading…</span>
      </div>
    </div>
  );
}

// ── Modal ──────────────────────────────────────
export function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal-box ${maxWidth}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Pagination ─────────────────────────────────
export function Pagination({ page, total, limit, onChange }) {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
      <span className="text-xs text-slate-500 font-mono">
        {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
      </span>
      <div className="flex gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={15} />
        </button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
          return (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={`w-7 h-7 rounded-lg text-xs font-mono transition-colors ${
                p === page ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {p}
            </button>
          );
        })}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

// ── Empty State ────────────────────────────────
export function EmptyState({ icon: Icon, title, desc }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && <Icon size={36} className="text-slate-600 mb-3" />}
      <div className="text-slate-400 font-medium mb-1">{title}</div>
      {desc && <div className="text-slate-600 text-sm">{desc}</div>}
    </div>
  );
}

// ── Section Header ─────────────────────────────
export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-xl font-semibold text-white">{title}</h1>
        {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
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
    <button onClick={copy} className="text-xs px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-emerald-400 transition-colors font-mono">
      {copied ? '✓ copied' : (label || 'copy')}
    </button>
  );
}

// need useState for CopyButton
import { useState } from 'react';
