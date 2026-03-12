import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import MerchantSidebar from '../components/MerchantSidebar';

export function AdminLayout() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.type !== 'admin' && user.role !== 'admin' && user.role !== 'superadmin')
    return <Navigate to="/merchant" replace />;

  return (
    <div className="flex min-h-screen bg-navy-950">
      <AdminSidebar />
      <main className="flex-1 overflow-hidden flex flex-col min-h-screen">
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export function MerchantLayout() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/merchant/login" replace />;

  return (
    <div className="flex min-h-screen bg-navy-950">
      <MerchantSidebar />
      <main className="flex-1 overflow-hidden flex flex-col min-h-screen">
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
