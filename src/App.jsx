import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { DoctorDirectory } from './pages/DoctorList';
import { PatientPortal } from './pages/UserHome';
import { DoctorPortal } from './pages/DoctorPortal';
import { AdminPortal } from './pages/AdminAppointment';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'patient') return <Navigate to="/patient-portal" replace />;
    if (user.role === 'doctor') return <Navigate to="/doctor-portal" replace />;
    if (user.role === 'admin') return <Navigate to="/admin-portal" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans antialiased text-gray-900" id="medibook_root_shell">
          <Navbar />

          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/doctors" element={<DoctorDirectory />} />

              <Route
                path="/patient-portal"
                element={
                  <ProtectedRoute allowedRoles={['patient']}>
                    <PatientPortal />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/doctor-portal"
                element={
                  <ProtectedRoute allowedRoles={['doctor']}>
                    <DoctorPortal />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin-portal"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminPortal />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <footer className="bg-white border-t border-gray-100 py-6 text-center text-xs text-gray-400 mt-auto print:hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p>&copy; {new Date().getFullYear()} MediBook Doctor Appointment System. All rights reserved.</p>
              <div className="flex space-x-4">
                <span className="font-mono bg-gray-50 px-1.5 py-0.5 rounded text-gray-500">Secure Vault Storage Active</span>
              </div>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
