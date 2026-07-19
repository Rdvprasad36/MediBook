import React, { useState, useEffect } from 'react';
import { useAuth, api } from '../context/AuthContext';
import { Shield, Users, Stethoscope, Calendar, IndianRupee, CheckCircle, AlertCircle, Trash2, Lock, LockOpen, RefreshCw, Clock } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export const AdminPortal = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('stats');

  const [stats, setStats] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [loading, setLoading] = useState(true);

  const getAppointmentsPerDayData = () => {
    const counts = {};
    appointments.forEach((apt) => {
      const dateStr = apt.date;
      counts[dateStr] = (counts[dateStr] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([date, count]) => ({ date, appointments: count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getUserGrowthData = () => {
    const dates = {};
    
    usersList.forEach((u) => {
      const dateStr = u.createdAt ? u.createdAt.split('T')[0] : new Date().toISOString().split('T')[0];
      if (!dates[dateStr]) {
        dates[dateStr] = { patients: 0, doctors: 0, total: 0 };
      }
      if (u.role === 'patient') {
        dates[dateStr].patients += 1;
      } else if (u.role === 'doctor') {
        dates[dateStr].doctors += 1;
      }
      dates[dateStr].total += 1;
    });

    const sortedDates = Object.keys(dates).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    let cumPatients = 0;
    let cumDoctors = 0;
    let cumTotal = 0;

    return sortedDates.map((date) => {
      cumPatients += dates[date].patients;
      cumDoctors += dates[date].doctors;
      cumTotal += dates[date].total;
      return {
        date,
        Patients: cumPatients,
        Doctors: cumDoctors,
        TotalUsers: cumTotal,
      };
    });
  };
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadAllData();
    }
  }, [user]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [statsRes, docsRes, usersRes, aptsRes] = await Promise.all([
        api.get('/admin/stats').catch(() => ({ data: null })),
        api.get('/admin/doctors').catch(() => ({ data: [] })),
        api.get('/admin/users').catch(() => ({ data: [] })),
        api.get('/admin/appointments').catch(() => ({ data: [] })),
      ]);

      setStats(statsRes.data);
      setDoctors(docsRes.data);
      setUsersList(usersRes.data);
      setAppointments(aptsRes.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch administrator data.');
      setLoading(false);
    }
  };

  const handleApproveDoctor = async (userId) => {
    setError(null);
    setSuccess(null);
    try {
      const res = await api.put(`/admin/doctors/${userId}/approve`);
      setSuccess(res.data.message || 'Doctor application approved.');
      
      setDoctors((prev) =>
        prev.map((d) => (d.userId === userId ? { ...d, isApproved: true } : d))
      );
      
      loadAllData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to approve doctor profile.');
    }
  };

  const handleToggleUserStatus = async (userId) => {
    setError(null);
    setSuccess(null);
    try {
      const res = await api.put(`/admin/users/${userId}/toggle-status`);
      setSuccess(res.data.message || 'User status modified.');

      setUsersList((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' }
            : u
        )
      );

      loadAllData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to toggle user status.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border border-amber-100';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border border-rose-100';
      case 'completed':
        return 'bg-blue-50 text-blue-700 border border-blue-100';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 text-left" id="admin_portal_page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Shield className="h-8 w-8 text-blue-600 shrink-0" />
              <span>Administration Command Panel</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">Supervise system transactions, vet provider credentials, and suspend accounts.</p>
          </div>
          <button
            onClick={loadAllData}
            className="p-2 bg-white hover:bg-blue-50 hover:text-blue-700 border border-slate-200 hover:border-blue-200 rounded-xl transition-all flex items-center space-x-1 cursor-pointer font-bold text-xs"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh Workspace</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div className="text-sm text-red-700">
              <p className="font-semibold">Security Alert</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold">Action Successful</p>
              <p className="mt-1">{success}</p>
            </div>
          </div>
        )}

        <div className="flex border-b border-slate-200 mb-8 overflow-x-auto gap-4">
          <button
            onClick={() => setActiveTab('stats')}
            className={`pb-4 px-1 text-sm font-bold border-b-2 cursor-pointer transition-all ${
              activeTab === 'stats' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Performance Metrics
          </button>
          <button
            onClick={() => setActiveTab('approvals')}
            className={`pb-4 px-1 text-sm font-bold border-b-2 cursor-pointer transition-all flex items-center gap-1.5 ${
              activeTab === 'approvals' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <span>Doctor Approvals</span>
            {doctors.filter((d) => !d.isApproved).length > 0 && (
              <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {doctors.filter((d) => !d.isApproved).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-4 px-1 text-sm font-bold border-b-2 cursor-pointer transition-all ${
              activeTab === 'users' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            User Directory ({usersList.length})
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`pb-4 px-1 text-sm font-bold border-b-2 cursor-pointer transition-all ${
              activeTab === 'appointments' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Global Appointments ({appointments.length})
          </button>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-8">
            
            {activeTab === 'stats' && stats && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  
                  <div className="bg-white p-6 border border-slate-100 rounded-3xl shadow-xs flex items-center space-x-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                      <IndianRupee className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Projected Revenue</p>
                      <p className="text-2xl font-black text-slate-900 mt-1">₹{stats.totalRevenue}</p>
                    </div>
                  </div>

                  <div className="bg-white p-6 border border-slate-100 rounded-3xl shadow-xs flex items-center space-x-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                      <Stethoscope className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Clinical Providers</p>
                      <p className="text-2xl font-black text-slate-900 mt-1">
                        {stats.doctorCount} <span className="text-xs text-slate-400 font-normal">({stats.approvedDoctorCount} active)</span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-6 border border-slate-100 rounded-3xl shadow-xs flex items-center space-x-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Registered Patients</p>
                      <p className="text-2xl font-black text-slate-900 mt-1">{stats.patientCount}</p>
                    </div>
                  </div>

                  <div className="bg-white p-6 border border-slate-100 rounded-3xl shadow-xs flex items-center space-x-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Appointments</p>
                      <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalAppointments}</p>
                    </div>
                  </div>

                </div>

                <div className="bg-white p-6 border border-slate-100 rounded-3xl shadow-xs text-left max-w-2xl">
                  <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">Appointments Breakdown</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div className="p-3 bg-amber-50/40 rounded-xl">
                      <p className="text-lg font-bold text-amber-700">{stats.pendingAppointments}</p>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Pending</p>
                    </div>
                    <div className="p-3 bg-emerald-50/40 rounded-xl">
                      <p className="text-lg font-bold text-emerald-700">{stats.confirmedAppointments}</p>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Confirmed</p>
                    </div>
                    <div className="p-3 bg-blue-50/40 rounded-xl">
                      <p className="text-lg font-bold text-blue-700">{stats.completedAppointments}</p>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Completed</p>
                    </div>
                    <div className="p-3 bg-rose-50/40 rounded-xl">
                      <p className="text-lg font-bold text-rose-700">{stats.cancelledAppointments}</p>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Cancelled</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
                  <div className="bg-white p-6 border border-slate-100 rounded-3xl shadow-xs flex flex-col">
                    <div className="mb-4">
                      <h4 className="font-extrabold text-slate-900 text-base">Appointments Timeline</h4>
                      <p className="text-xs text-slate-400 mt-1">Total appointments booked chronologically per day</p>
                    </div>
                    <div className="h-72 w-full mt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getAppointmentsPerDayData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="date" tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                          <YAxis tickLine={false} allowDecimals={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #f1f5f9', fontSize: '11px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} 
                            labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                          />
                          <Bar dataKey="appointments" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white p-6 border border-slate-100 rounded-3xl shadow-xs flex flex-col">
                    <div className="mb-4">
                      <h4 className="font-extrabold text-slate-900 text-base">Platform User Growth</h4>
                      <p className="text-xs text-slate-400 mt-1">Cumulative registration growth statistics over time</p>
                    </div>
                    <div className="h-72 w-full mt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={getUserGrowthData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="date" tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                          <YAxis tickLine={false} allowDecimals={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #f1f5f9', fontSize: '11px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} 
                            labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                          />
                          <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                          <Area type="monotone" dataKey="TotalUsers" name="Total Users" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                          <Area type="monotone" dataKey="Patients" name="Patients" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorPatients)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'approvals' && (
              <div className="bg-white border border-slate-100 shadow-xs rounded-3xl p-6">
                <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6">Pending Doctor Registrations</h3>
                
                {doctors.filter((d) => !d.isApproved).length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <CheckCircle className="h-8 w-8 text-blue-500 mx-auto" />
                    <p className="text-sm font-semibold">No pending doctor approvals.</p>
                    <p className="text-xs">All registered medical providers have completed vetting.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {doctors.filter((d) => !d.isApproved).map((doc) => (
                      <div
                        key={doc.userId}
                        className="p-5 border border-slate-100 rounded-2xl hover:border-amber-200 hover:bg-amber-50/5 transition-all text-left flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center space-x-3">
                            <span className="font-bold text-slate-900 text-base">{doc.name}</span>
                            <span className="text-xs px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-full font-bold uppercase">
                              {doc.specialization}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                            <p className="text-slate-500"><span className="font-bold text-slate-700">Experience:</span> {doc.experience} yrs</p>
                            <p className="text-slate-500"><span className="font-bold text-slate-700">Fee:</span> ₹{doc.consultationFee}</p>
                            <p className="text-slate-500 truncate"><span className="font-bold text-slate-700">Credentials:</span> {doc.qualifications}</p>
                            <p className="text-slate-500"><span className="font-bold text-slate-700">Phone:</span> {doc.phone}</p>
                          </div>
                          <p className="text-xs text-slate-600 italic">"Bio: {doc.bio || 'Not provided'}"</p>
                          <p className="text-xs text-slate-500 font-medium"><span className="font-bold">Clinic Address:</span> {doc.clinicAddress}</p>
                        </div>

                        <button
                          onClick={() => handleApproveDoctor(doc.userId)}
                          className="w-full md:w-auto py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Approve Profile
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'users' && (
              <div className="bg-white border border-slate-100 shadow-xs rounded-3xl p-6 overflow-hidden">
                <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6">Registered Users Listing</h3>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100 text-sm">
                    <thead>
                      <tr className="text-xs text-slate-400 font-bold uppercase tracking-wider text-left">
                        <th className="pb-3">Name</th>
                        <th className="pb-3">Email Address</th>
                        <th className="pb-3">Role</th>
                        <th className="pb-3">Phone</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {usersList.map((usr) => (
                        <tr key={usr.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 font-bold text-slate-900">{usr.name}</td>
                          <td className="py-3.5 text-slate-500">{usr.email}</td>
                          <td className="py-3.5 capitalize font-semibold">
                            <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                              usr.role === 'admin'
                                ? 'bg-red-50 text-red-700 border border-red-100'
                                : 'bg-blue-50 text-blue-700 border border-blue-100'
                            }`}>
                              {usr.role}
                            </span>
                          </td>
                          <td className="py-3.5 text-slate-500">{usr.phone}</td>
                          <td className="py-3.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              usr.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                : 'bg-red-50 text-red-700 border border-red-100'
                            }`}>
                              {usr.status}
                            </span>
                          </td>
                          <td className="py-3.5 text-right">
                            {usr.id !== user?.id && (
                              <button
                                onClick={() => handleToggleUserStatus(usr.id)}
                                className={`p-1.5 border rounded-lg hover:shadow-xs transition-all cursor-pointer inline-flex items-center gap-1 text-xs font-bold ${
                                  usr.status === 'active'
                                    ? 'border-red-200 text-red-600 hover:bg-red-50'
                                    : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                                }`}
                                title={usr.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                              >
                                {usr.status === 'active' ? (
                                  <>
                                    <Lock className="h-3.5 w-3.5" />
                                    <span>Suspend</span>
                                  </>
                                ) : (
                                  <>
                                    <LockOpen className="h-3.5 w-3.5" />
                                    <span>Activate</span>
                                  </>
                                )}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'appointments' && (
              <div className="bg-white border border-slate-100 shadow-xs rounded-3xl p-6">
                <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6">Global Appointments Logs</h3>
                
                <div className="space-y-4">
                  {appointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="p-4 border border-slate-100 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-200 transition-all text-left"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                          <span className="font-bold text-slate-900 text-sm">Patient: {apt.patientName}</span>
                          <span className="text-xs text-slate-400">➡️</span>
                          <span className="font-bold text-blue-700 text-sm">Doctor: {apt.doctorName}</span>
                          <span className="text-xs px-2 py-0.5 border border-blue-100 text-blue-700 bg-blue-50 rounded-full font-semibold uppercase">{apt.doctorSpecialization}</span>
                          <span className={`text-[10px] px-2 py-0.5 border rounded-full font-extrabold uppercase ${getStatusBadge(apt.status)}`}>
                            {apt.status}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {apt.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {apt.timeSlot}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">"Symptom: {apt.reason}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
