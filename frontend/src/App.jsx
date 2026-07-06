import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react';
import useAuthStore from './store/authStore';
import { toastEvents } from './api/axiosClient';
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import SensorData from './pages/SensorData';
import Classification from './pages/Classification';
import UserManagement from './pages/UserManagement';

/**
 * Redirects unauthenticated users to /login.
 */
function ProtectedRoute({ children }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

/**
 * Redirects already-authenticated users away from auth pages.
 */
function GuestRoute({ children }) {
  const token = useAuthStore((s) => s.token);
  if (token) return <Navigate to="/dashboard" replace />;
  return children;
}

/**
 * Role-based route protection.
 * Checks if the current user's role is in the list of allowed roles.
 * If not, redirects to /dashboard with an access denied state.
 */
function RoleRoute({ children, allowedRoles }) {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  if (!token) return <Navigate to="/login" replace />;

  const userRole = user?.role || 'user';
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

/**
 * Global toast component — subscribes to axiosClient's toastEvents.
 * Renders a fixed-position toast at the top-right corner.
 */
function GlobalToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { ...toast, id }]);

    // Auto-dismiss after 6 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    return toastEvents.subscribe(addToast);
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-white border border-red-200 rounded-2xl shadow-xl px-4 py-3 flex items-start gap-3 animate-in slide-in-from-right"
          role="alert"
        >
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900">{toast.title}</p>
            <p className="text-xs text-slate-600 mt-0.5">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <GlobalToast />
      <Routes>
        {/* Landing page — public */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth pages — only for guests */}
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

        {/* Protected pages — require token, all roles */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/klasifikasi" element={<ProtectedRoute><Classification /></ProtectedRoute>} />

        {/* Role-protected pages — operator & admin only */}
        <Route
          path="/sensor-data"
          element={
            <RoleRoute allowedRoles={['operator', 'admin']}>
              <SensorData />
            </RoleRoute>
          }
        />

        {/* Role-protected pages — admin only */}
        <Route
          path="/pengguna"
          element={
            <RoleRoute allowedRoles={['admin']}>
              <UserManagement />
            </RoleRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
