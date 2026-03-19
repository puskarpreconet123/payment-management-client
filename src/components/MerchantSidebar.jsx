import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, PlusCircle, ArrowLeftRight,
  KeyRound, Webhook, LogOut, ChevronRight, BookOpen,
  X
} from 'lucide-react';
import { Logo } from './ui';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/merchant', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/merchant/create-payment', icon: PlusCircle, label: 'Create Payment' },
  { to: '/merchant/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/merchant/api-settings', icon: KeyRound, label: 'API Settings' },
  // { to: '/merchant/webhook-settings', icon: Webhook, label: 'Webhook Settings' },
  { to: '/merchant/docs', icon: BookOpen, label: 'Documentation' },
];

export default function MerchantSidebar({ onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/merchant/login'); };

  return (
    <aside className="w-56 h-full flex flex-col bg-[#0a0a0b] border-r border-white/5 relative">
      <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-emerald-800/30 to-transparent pointer-events-none" />

      <div className="p-5 border-b border-white/5 flex items-center justify-between">
        <Logo />
        <button 
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      </div>
      <div className="px-5 py-2">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse-slow" />
          <span className="text-xs text-slate-500">Merchant Portal</span>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <div className="text-xs font-semibold text-slate-600 uppercase tracking-widest px-3 py-2 mt-1">Menu</div>
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/merchant'}
            onClick={onClose}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={15} />
            <span className="flex-1">{label}</span>
            <ChevronRight size={12} className="opacity-30" />
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-white/5">
        <div className="glass-card p-3 mb-3">
          <div className="text-xs font-medium text-white truncate">{user?.name}</div>
          <div className="text-xs text-slate-500 truncate">{user?.email}</div>
        </div>
        <button onClick={handleLogout} className="sidebar-link w-full text-red-400/70 hover:text-red-400 hover:bg-red-900/20">
          <LogOut size={15} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
