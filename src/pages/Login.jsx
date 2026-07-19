import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Stethoscope, AlertCircle, ArrowRight } from 'lucide-react';

export const Login = () => {
  const { login, user, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    clearError();
    setLocalError(null);
  }, []);

  useEffect(() => {
    if (user) {
      if (user.role === 'patient') navigate('/patient-portal');
      else if (user.role === 'doctor') navigate('/doctor-portal');
      else if (user.role === 'admin') navigate('/admin-portal');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!email || !password) {
      setLocalError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const data = await login(email, password);
      const loggedUser = data.user;
      
      if (loggedUser.role === 'patient') navigate('/patient-portal');
      else if (loggedUser.role === 'doctor') navigate('/doctor-portal');
      else if (loggedUser.role === 'admin') navigate('/admin-portal');
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8" id="login_page_wrapper">
      <div className="sm:mx-auto w-full max-w-md">
        <div className="flex justify-center text-blue-600 mb-2">
          <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 shadow-xs">
            <Stethoscope className="h-10 w-10" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight animate-fade-in">
          Welcome to MediBook
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Or{' '}
          <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto w-full max-w-md">
        <div className="bg-white py-8 px-4 border border-gray-100 shadow-xl rounded-3xl sm:px-10">
          {(localError || error) && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-start space-x-3 text-left">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div className="text-sm text-red-700">
                <p className="font-semibold">Unable to Log In</p>
                <p className="mt-1">{localError || error}</p>
              </div>
            </div>
          )}

          <form className="space-y-6 text-left" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                Email Address
              </label>
              <div className="mt-1 relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all cursor-pointer"
                id="btn_submit_login"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-gray-100 pt-6 text-center">
            <p className="text-xs text-gray-400 leading-relaxed">
              Admin: <span className="font-mono text-gray-600 font-semibold bg-gray-50 px-1 py-0.5 rounded">admin@medibook.com</span> (pw: <span className="font-mono text-gray-600 font-semibold bg-gray-50 px-1 py-0.5 rounded">admin123</span>) <br />
              Doctor: <span className="font-mono text-gray-600 font-semibold bg-gray-50 px-1 py-0.5 rounded">sharma@medibook.com</span> (pw: <span className="font-mono text-gray-600 font-semibold bg-gray-50 px-1 py-0.5 rounded">doctor123</span>) <br />
              Patient: <span className="font-mono text-gray-600 font-semibold bg-gray-50 px-1 py-0.5 rounded">patient@medibook.com</span> (pw: <span className="font-mono text-gray-600 font-semibold bg-gray-50 px-1 py-0.5 rounded">patient123</span>)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
