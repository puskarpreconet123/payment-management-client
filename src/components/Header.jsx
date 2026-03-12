import { Bell, Search } from 'lucide-react';

export default function Header({ title, subtitle }) {
  return (
    <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-navy-950/80 backdrop-blur-sm sticky top-0 z-20">
      <div>
        <h2 className="text-sm font-semibold text-white leading-tight">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 leading-tight">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search…"
            className="input-field !py-1.5 !pl-8 !pr-3 w-44 text-sm"
          />
        </div>
        <button className="relative p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </button>
      </div>
    </header>
  );
}
