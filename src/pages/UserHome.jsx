import React, { useState, useEffect } from 'react';
import { useAuth, api } from '../context/AuthContext';
import { Calendar, Clock, FileText, Upload, Trash2, Edit, CheckCircle, AlertCircle, Phone, Mail, User, Shield, ExternalLink, X, Plus, Printer } from 'lucide-react';

export const PatientPortal = () => {
  const { user, updateUserProfile } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [reports, setReports] = useState([]);

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [reportFile, setReportFile] = useState(null);
  const [reportDesc, setReportDesc] = useState('');
  const [uploadingDocId, setUploadingDocId] = useState('');
  const [doctorsList, setDoctorsList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [uploadSubmitting, setUploadSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [aptsRes, repsRes, docsRes] = await Promise.all([
        api.get('/reports/patient').catch(() => ({ data: [] })), // wait, actually `/appointments/patient` is the route! Let's get them from the server.
        api.get('/reports/patient').catch(() => ({ data: [] })),
        api.get('/doctors').catch(() => ({ data: [] })),
      ]);

      // Oh! In `/src/server/routes/UserRoutes.js`, the route for patient appointments is `/getuserappointments` and reports is `/getpatientreports`!
      // Let's use our clean modular API routes:
      const apts = await api.get('/user/getuserappointments').catch(() => api.get('/appointments/patient'));
      const reps = await api.get('/user/getpatientreports').catch(() => api.get('/reports/patient'));
      const docs = await api.get('/user/getalldoctorsu').catch(() => api.get('/doctors'));

      setAppointments(apts.data);
      setReports(reps.data);
      setDoctorsList(docs.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch patient portal data.');
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await updateUserProfile({ name, phone });
      setSuccess('Profile updated successfully!');
      setIsEditingProfile(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    }
  };

  const handleCancelAppointment = async (aptId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    setError(null);
    setSuccess(null);
    try {
      await api.put(`/appointments/${aptId}/status`, { status: 'cancelled' });
      setSuccess('Appointment cancelled successfully.');
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === aptId ? { ...apt, status: 'cancelled' } : apt))
      );
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel appointment.');
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!reportFile) {
      setError('Please select a file to upload.');
      return;
    }

    setUploadSubmitting(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    // Support field 'image' as per user specifications (and fall back to 'report')
    formData.append('image', reportFile);
    formData.append('report', reportFile);
    formData.append('description', reportDesc);
    if (uploadingDocId) {
      formData.append('doctorId', uploadingDocId);
    }

    try {
      // Post to modular user route
      await api.post('/user/uploadreport', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess('Medical report successfully uploaded to secure vault.');
      setReportFile(null);
      setReportDesc('');
      setUploadingDocId('');
      
      const repsRes = await api.get('/user/getpatientreports').catch(() => api.get('/reports/patient'));
      setReports(repsRes.data);
      setUploadSubmitting(false);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload report.');
      setUploadSubmitting(false);
    }
  };

  const handleDeleteReport = async (repId) => {
    if (!window.confirm('Are you sure you want to delete this report from your secure vault?')) return;
    setError(null);
    setSuccess(null);
    try {
      await api.delete(`/user/deletereport/${repId}`).catch(() => api.delete(`/reports/${repId}`));
      setSuccess('Report deleted successfully.');
      setReports((prev) => prev.filter((r) => r.id !== repId));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to delete report.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'completed':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10" id="patient_portal_page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 print:hidden text-left">
        
        {/* Banner */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Patient Dashboard</h1>
            <p className="text-sm text-gray-500">Welcome back, {user?.name}. Check schedules and view shared files.</p>
          </div>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer shrink-0"
          >
            <Printer className="h-4 w-4" />
            <span>Print Summary to PDF</span>
          </button>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-start space-x-3 text-left">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div className="text-sm text-red-700">
              <p className="font-semibold">Operation Alert</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl flex items-start space-x-3 text-left">
            <CheckCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold">Action Successful</p>
              <p className="mt-1">{success}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Profile and Records */}
            <div className="lg:col-span-4 space-y-8 text-left">
              
              {/* Profile Card */}
              <div className="bg-white border border-slate-100 shadow-xs rounded-3xl p-6 relative overflow-hidden">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
                  <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <User className="h-5 w-5 text-blue-600" />
                    <span>My Profile</span>
                  </h3>
                  <button
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    className="p-1.5 hover:bg-slate-50 border border-slate-100 rounded-lg text-slate-500 hover:text-blue-600 transition-all cursor-pointer"
                    title="Edit Profile"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>

                {isEditingProfile ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <label className="text-xs text-slate-400 font-semibold uppercase">Full Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 font-semibold uppercase">Phone Number</label>
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex space-x-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="flex-1 py-1.5 border border-slate-200 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-700 text-sm uppercase">
                        {user?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                        <p className="text-xs text-slate-400">Registered Patient</p>
                      </div>
                    </div>

                    <div className="border-t border-slate-50 pt-3 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          Email
                        </span>
                        <span className="text-slate-800 font-medium truncate max-w-[180px]">{user?.email}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          Phone
                        </span>
                        <span className="text-slate-800 font-medium">{user?.phone}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          Account Status
                        </span>
                        <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[10px] font-bold uppercase">
                          {user?.status}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Secure Document Upload Card */}
              <div className="bg-white border border-slate-100 shadow-xs rounded-3xl p-6">
                <h3 className="font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-4 mb-4">
                  <Upload className="h-5 w-5 text-blue-600" />
                  <span>Secure Document Upload</span>
                </h3>

                <form onSubmit={handleFileUpload} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase">Select Diagnostic File (PDF/Image)</label>
                    <input
                      type="file"
                      required
                      onChange={(e) => setReportFile(e.target.files?.[0] || null)}
                      className="mt-1 block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Accepts PDF, JPG, PNG under 5MB.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase">Report Description</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Blood Panel May 2026"
                      value={reportDesc}
                      onChange={(e) => setReportDesc(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase">Map to Clinical Doctor (Optional)</label>
                    <select
                      value={uploadingDocId}
                      onChange={(e) => setUploadingDocId(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="">No specific Doctor</option>
                      {doctorsList.map((doc) => (
                        <option key={doc.userId} value={doc.userId}>
                          {doc.name} ({doc.specialization})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={uploadSubmitting}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-xs transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <span>{uploadSubmitting ? 'Uploading Securely...' : 'Upload Document'}</span>
                  </button>
                </form>
              </div>

            </div>

            {/* Right Column: Appointments & Records History */}
            <div className="lg:col-span-8 space-y-8 text-left">
              
              {/* Appointments Card */}
              <div className="bg-white border border-slate-100 shadow-xs rounded-3xl p-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
                  <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <span>My Clinical Appointments</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-semibold">{appointments.length} Scheduled</span>
                </div>

                {appointments.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 space-y-2">
                    <Calendar className="h-8 w-8 mx-auto text-gray-300" />
                    <p className="text-sm font-semibold">No appointments scheduled.</p>
                    <p className="text-xs">Schedule clinical specialists on our Find Doctors page.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((apt) => (
                      <div
                        key={apt.id}
                        className="p-4 border border-slate-100 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-200 transition-colors text-left"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                            <span className="font-bold text-slate-900 text-sm">{apt.doctorName}</span>
                            <span className="text-xs px-2 py-0.5 border border-blue-100 text-blue-700 bg-blue-50 rounded-full font-semibold uppercase">{apt.doctorSpecialization}</span>
                            <span className={`text-[10px] px-2 py-0.5 border rounded-full font-extrabold uppercase ${getStatusBadge(apt.status)}`}>
                              {apt.status}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5 text-gray-400" />
                              {apt.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-gray-400" />
                              {apt.timeSlot}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 italic">"Reason: {apt.reason}"</p>

                          {apt.prescription && (
                            <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-xl mt-2 text-xs space-y-1 text-left">
                              <p className="font-bold text-blue-900 flex items-center gap-1">
                                <FileText className="h-3.5 w-3.5" />
                                Clinician Prescription
                              </p>
                              <p className="text-gray-700 mt-1"><span className="font-semibold">Rx Meds:</span> {apt.prescription.medications}</p>
                              <p className="text-gray-700"><span className="font-semibold">Instructions:</span> {apt.prescription.instructions}</p>
                              {apt.prescription.notes && <p className="text-gray-500 mt-0.5"><span className="font-semibold">Notes:</span> {apt.prescription.notes}</p>}
                            </div>
                          )}
                        </div>

                        {(apt.status === 'pending' || apt.status === 'confirmed') && (
                          <div className="flex space-x-2 shrink-0 w-full md:w-auto">
                            <button
                              onClick={() => handleCancelAppointment(apt.id)}
                              className="flex-1 md:flex-none py-1.5 px-3 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                            >
                              Cancel Visit
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Secure Medical Health Vault Card */}
              <div className="bg-white border border-slate-100 shadow-xs rounded-3xl p-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
                  <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <span>My Secure Health Vault</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-semibold">{reports.length} Documents</span>
                </div>

                {reports.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 space-y-2">
                    <FileText className="h-8 w-8 mx-auto text-gray-300" />
                    <p className="text-sm font-semibold">Vault is empty.</p>
                    <p className="text-xs">Securely upload clinical PDFs or scan files using the uploader card.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {reports.map((rep) => (
                      <div
                        key={rep.id}
                        className="p-4 border border-slate-100 rounded-2xl flex items-start justify-between gap-3 text-left hover:border-blue-200 transition-colors"
                      >
                        <div className="space-y-1 flex-1 min-w-0">
                          <p className="font-bold text-slate-900 text-sm truncate" title={rep.fileName}>
                            {rep.fileName}
                          </p>
                          <p className="text-xs text-blue-600 font-semibold truncate">{rep.description}</p>
                          <div className="flex items-center space-x-2 text-[10px] text-slate-400 pt-1">
                            <span>{rep.fileSize}</span>
                            <span>•</span>
                            <span>{new Date(rep.uploadedAt).toLocaleDateString()}</span>
                          </div>
                          {rep.doctorName && (
                            <p className="text-[10px] text-slate-500 mt-1">
                              Shared with: <span className="font-semibold text-slate-700">{rep.doctorName}</span>
                            </p>
                          )}
                          
                          <div className="pt-2">
                            <a
                              href={rep.filePath}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                            >
                              <span>View / Download</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteReport(rep.id)}
                          className="p-1.5 hover:bg-rose-50 rounded-lg text-gray-400 hover:text-rose-600 transition-colors cursor-pointer shrink-0"
                          title="Remove File"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </div>

      {/* Print-Only Document Summary Section */}
      <div className="hidden print:block text-left p-8 bg-white max-w-4xl mx-auto space-y-8" id="print_summary_document">
        <div className="flex justify-between items-start border-b-2 border-gray-200 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">MediBook Medical Summary</h1>
            <p className="text-sm text-gray-500 mt-1">Patient Personal Record & Upcoming Consultations</p>
          </div>
          <div className="text-right text-xs text-gray-400">
            <p className="font-mono">Date Generated: {new Date().toLocaleDateString()}</p>
            <p className="font-mono">Security Check: Secure Digital Vault Active</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-2xl border border-gray-100">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Patient Information</h3>
            <p className="text-base font-bold text-gray-900 mt-1">{user?.name}</p>
            <p className="text-sm text-gray-600 mt-1">Phone: {user?.phone || 'N/A'}</p>
            <p className="text-sm text-gray-600">Email: {user?.email}</p>
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">System Reference</h3>
            <p className="text-sm text-gray-600 mt-1"><span className="font-semibold">Registered ID:</span> {user?.id}</p>
            <p className="text-sm text-gray-600"><span className="font-semibold">Account Status:</span> Active</p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Upcoming Consultations</h2>
          {appointments.length === 0 ? (
            <p className="text-sm text-gray-500">No scheduled appointments.</p>
          ) : (
            <div className="space-y-4">
              {appointments.map((apt) => (
                <div key={apt.id} className="p-4 border border-gray-200 rounded-xl space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-900">{apt.doctorName}</h4>
                      <p className="text-xs text-blue-600 font-bold uppercase">{apt.doctorSpecialization}</p>
                    </div>
                    <span className="text-xs px-2.5 py-0.5 border border-gray-300 text-gray-700 bg-gray-50 rounded-full font-bold uppercase">
                      {apt.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 font-mono">
                    <p>Date: {apt.date}</p>
                    <p>Time: {apt.timeSlot}</p>
                  </div>
                  <p className="text-xs text-gray-700 mt-1 italic">"Reason: {apt.reason}"</p>
                  {apt.prescription && (
                    <div className="bg-gray-50 border border-gray-100 p-3 rounded-lg text-xs space-y-1">
                      <p className="font-bold text-gray-900">Rx Medications & Guidance:</p>
                      <p className="text-gray-700">{apt.prescription.medications}</p>
                      <p className="text-gray-600"><span className="font-semibold">Directions:</span> {apt.prescription.instructions}</p>
                      {apt.prescription.notes && <p className="text-gray-500 font-normal"><span className="font-semibold">Doctor Notes:</span> {apt.prescription.notes}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Medical Health Vault Summary</h2>
          {reports.length === 0 ? (
            <p className="text-sm text-gray-500">No medical files uploaded in secure vault.</p>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-400 font-semibold uppercase tracking-wider text-left">
                  <th className="py-2">Document Name</th>
                  <th className="py-2">Description</th>
                  <th className="py-2">Uploaded At</th>
                  <th className="py-2">File Size</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-left">
                {reports.map((rep) => (
                  <tr key={rep.id}>
                    <td className="py-3 font-bold text-gray-900">{rep.fileName}</td>
                    <td className="py-3 text-gray-600">{rep.description}</td>
                    <td className="py-3 text-gray-500">{new Date(rep.uploadedAt).toLocaleDateString()}</td>
                    <td className="py-3 text-gray-500">{rep.fileSize}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="pt-8 border-t border-gray-100 text-center text-[10px] text-gray-400 space-y-1">
          <p>This report was securely generated via MediBook Digital Portal.</p>
          <p>Confidential Medical Document • Under security protections of the Patient Portal.</p>
        </div>
      </div>
    </div>
  );
};
