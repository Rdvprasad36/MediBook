import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(undefined);

// Create fully configured axios instance
export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize Auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('medibook_token');
    const storedUser = localStorage.getItem('medibook_user');
    const storedDocProfile = localStorage.getItem('medibook_doc_profile');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      if (storedDocProfile) {
        setDoctorProfile(JSON.parse(storedDocProfile));
      }
      
      // Set default header
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    setLoading(false);
  }, []);

  // Axios interceptor to add token and handle token expiration/unauthorized errors
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (err) => Promise.reject(err)
    );

    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (err) => {
        if (err.response && err.response.status === 401) {
          // Token expired or invalid, auto logout
          logout();
        }
        return Promise.reject(err);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: receivedToken, user: receivedUser, doctorProfile: receivedDocProfile } = res.data;

      setToken(receivedToken);
      setUser(receivedUser);
      setDoctorProfile(receivedDocProfile);

      localStorage.setItem('medibook_token', receivedToken);
      localStorage.setItem('medibook_user', JSON.stringify(receivedUser));
      if (receivedDocProfile) {
        localStorage.setItem('medibook_doc_profile', JSON.stringify(receivedDocProfile));
      } else {
        localStorage.removeItem('medibook_doc_profile');
      }

      api.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;
      setLoading(false);
      return res.data;
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const registerUser = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/register', formData);
      const { token: receivedToken, user: receivedUser, doctorProfile: receivedDocProfile } = res.data;

      // Log them in automatically upon registration
      setToken(receivedToken);
      setUser(receivedUser);
      setDoctorProfile(receivedDocProfile);

      localStorage.setItem('medibook_token', receivedToken);
      localStorage.setItem('medibook_user', JSON.stringify(receivedUser));
      if (receivedDocProfile) {
        localStorage.setItem('medibook_doc_profile', JSON.stringify(receivedDocProfile));
      } else {
        localStorage.removeItem('medibook_doc_profile');
      }

      api.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;
      setLoading(false);
      return res.data;
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.message || 'Registration failed. Please check your inputs.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setDoctorProfile(null);
    localStorage.removeItem('medibook_token');
    localStorage.removeItem('medibook_user');
    localStorage.removeItem('medibook_doc_profile');
    delete api.defaults.headers.common['Authorization'];
  };

  const updateUserProfile = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.put('/auth/profile', formData);
      const { user: updatedUser, doctorProfile: updatedDocProfile } = res.data;

      setUser(updatedUser);
      setDoctorProfile(updatedDocProfile);

      localStorage.setItem('medibook_user', JSON.stringify(updatedUser));
      if (updatedDocProfile) {
        localStorage.setItem('medibook_doc_profile', JSON.stringify(updatedDocProfile));
      } else {
        localStorage.removeItem('medibook_doc_profile');
      }

      setLoading(false);
      return res.data;
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.message || 'Failed to update profile.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        doctorProfile,
        loading,
        error,
        login,
        registerUser,
        logout,
        updateUserProfile,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
