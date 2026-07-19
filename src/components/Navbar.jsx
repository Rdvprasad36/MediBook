import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Stethoscope, LogOut, User, Shield, Calendar, Activity } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path
      ? 'text-blue-600 border-b-2 border-blue-600 font-semibold'
      : 'text-slate-600 hover:text-blue-600 transition-colors';
  };

  return (
    <nav className="bg-white border-b border-slate-200/80 sticky top-0 z-50 shadow-xs print:hidden" id="medibook_navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 text-blue-600 font-extrabold text-2xl tracking-tight">
              <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
                <Stethoscope className="h-6 w-6" />
              </div>
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">MediBook</span>
            </Link>
          </div>

          <div className="hidden md:flex space-x-8 items-center">
            <Link to="/doctors" className={`py-5 px-1 ${isActive('/doctors')}`}>
              Find Doctors
            </Link>

            {user && user.role === 'patient' && (
              <Link to="/patient-portal" className={`py-5 px-1 ${isActive('/patient-portal')}`}>
                Patient Dashboard
              </Link>
            )}

            {user && user.role === 'doctor' && (
              <Link to="/doctor-portal" className={`py-5 px-1 ${isActive('/doctor-portal')}`}>
                Doctor Portal
              </Link>
            )}

            {user && user.role === 'admin' && (
              <Link to="/admin-portal" className={`py-5 px-1 ${isActive('/admin-portal')}`}>
                Admin Panel
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-sm font-medium text-gray-900">{user.name}</span>
                  <span className="text-xs text-gray-500 capitalize flex items-center justify-end gap-1">
                    {user.role === 'admin' ? (
                      <Shield className="h-3 w-3 text-red-500" />
                    ) : user.role === 'doctor' ? (
                      <Stethoscope className="h-3 w-3 text-blue-500" />
                    ) : (
                      <Activity className="h-3 w-3 text-blue-500" />
                    )}
                    {user.role}
                  </span>
                </div>

                <Link
                  to={
                    user.role === 'patient'
                      ? '/patient-portal'
                      : user.role === 'doctor'
                        ? '/doctor-portal'
                        : '/admin-portal'
                  }
                  className="p-1 bg-gray-50 border border-gray-200 rounded-full text-gray-700 hover:text-blue-600 hover:border-blue-200 transition-all"
                  title="Go to Dashboard"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 py-1.5 px-3 border border-gray-200 rounded-lg text-sm text-gray-600 hover:text-red-600 hover:border-red-100 hover:bg-red-50/30 transition-all cursor-pointer"
                  id="btn_logout"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="py-1.5 px-3.5 text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors"
                  id="link_login"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="py-1.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-xs hover:shadow-sm transition-all"
                  id="link_signup"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
