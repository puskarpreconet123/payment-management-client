import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import AdminLogin from './pages/AdminLogin';
import MerchantLogin from './pages/MerchantLogin';
import { AdminLayout, MerchantLayout } from './components/Layouts';

import AdminDashboard from './pages/AdminDashboard';
import Merchants from './pages/Merchants';
import MIDManagement from './pages/MIDManagement';
import Transactions from './pages/Transactions';
import WebhookLogs from './pages/WebhookLogs';

import MerchantDashboard from './pages/MerchantDashboard';
import CreatePayment from './pages/CreatePayment';
import MerchantTransactions from './pages/MerchantTransactions';
import APISettings from './pages/APISettings';
import WebhookSettings from './pages/WebhookSettings';

import CheckoutPage from './pages/CheckoutPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/merchant/login" element={<MerchantLogin />} />
          <Route path="/checkout/:paymentId" element={<CheckoutPage />} />

          {/* Admin */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="merchants" element={<Merchants />} />
            <Route path="mids" element={<MIDManagement />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="webhook-logs" element={<WebhookLogs />} />
          </Route>

          {/* Merchant */}
          <Route path="/merchant" element={<MerchantLayout />}>
            <Route index element={<MerchantDashboard />} />
            <Route path="create-payment" element={<CreatePayment />} />
            <Route path="transactions" element={<MerchantTransactions />} />
            <Route path="api-settings" element={<APISettings />} />
            <Route path="webhook-settings" element={<WebhookSettings />} />
          </Route>

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
