import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import MerchantSidebar from '../components/MerchantSidebar';

export function AdminLayout() {
  const { user, loading } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.type !== 'admin' && user.role !== 'admin' && user.role !== 'superadmin')
    return <Navigate to="/merchant" replace />;

  return (
    <div className="layout-container">
      {/* Sidebar with mobile state */}
      <div className={`
        fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <AdminSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="main-content">
        <Outlet context={{ setSidebarOpen }} />
      </main>
    </div>
  );
}

export function MerchantLayout() {
  const { user, loading } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  if (loading) return null;
  if (!user) return <Navigate to="/merchant/login" replace />;

  return (
    <div className="layout-container">
      {/* Sidebar with mobile state */}
      <div className={`
        fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <MerchantSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="main-content">
        <Outlet context={{ setSidebarOpen }} />
      </main>
    </div>
  );
}
