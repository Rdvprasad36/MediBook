import React, { useState, useEffect } from 'react';
import { useAuth, api } from '../context/AuthContext';
import { Calendar, Clock, FileText, CheckCircle, AlertCircle, Phone, Stethoscope, Mail, ExternalLink, Plus, Edit, X, RefreshCw } from 'lucide-react';

export const DoctorPortal = () => {
  const { user, doctorProfile, updateUserProfile } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [sharedReports, setSharedReports] = useState([]);

  const [selectedApt, setSelectedApt] = useState(null);
  const [rxMeds, setRxMeds] = useState('');
  const [rxDirections, setRxDirections] = useState('');
  const [rxNotes, setRxNotes] = useState('');

  const [weeklySlots, setWeeklySlots] = useState(doctorProfile?.availability || {});
  const [isEditingSlots, setIsEditingSlots] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [prescriptionSubmitting, setPrescriptionSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [aptsRes, repsRes] = await Promise.all([
        api.get('/user/getdoctorappointments').catch(() => api.get('/appointments/doctor')),
        api.get('/user/getdoctorreports').catch(() => api.get('/reports/doctor')),
      ]);
      setAppointments(aptsRes.data);
      setSharedReports(repsRes.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch doctor portal statistics.');
      setLoading(false);
    }
  };

  const handleConfirmAppointment = async (aptId) => {
    setError(null);
    setSuccess(null);
    try {
      await api.put(`/appointments/${aptId}/status`, { status: 'confirmed' });
      setSuccess('Appointment confirmed successfully.');
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === aptId ? { ...apt, status: 'confirmed' } : apt))
      );
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to confirm appointment.');
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
      setError('Failed to cancel appointment.');
    }
  };

  const handleOpenPrescription = (apt) => {
    setSelectedApt(apt);
    setRxMeds('');
    setRxDirections('');
    setRxNotes('');
  };

  const handleAddPrescriptionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedApt || !rxMeds || !rxDirections) return;

    setPrescriptionSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await api.post(`/appointments/${selectedApt.id}/prescription`, {
        medications: rxMeds,
        instructions: rxDirections,
        notes: rxNotes,
      });

      setSuccess('Prescription issued successfully and consultation marked as completed.');
      setSelectedApt(null);
      setPrescriptionSubmitting(false);

      const aptsRes = await api.get('/user/getdoctorappointments').catch(() => api.get('/appointments/doctor'));
      setAppointments(aptsRes.data);

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to submit prescription.');
      setPrescriptionSubmitting(false);
    }
  };

  const handleSaveSlots = async () => {
    setError(null);
    setSuccess(null);
    try {
      await api.put('/doctors/availability', { availability: weeklySlots });
      setSuccess('Clinical weekly availability slots updated successfully.');
      setIsEditingSlots(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to save availability slots.');
    }
  };

  const toggleSlot = (day, slotTime) => {
    const daySlots = weeklySlots[day] || [];
    let updated;
    
    if (daySlots.includes(slotTime)) {
      updated = daySlots.filter((s) => s !== slotTime);
    } else {
      updated = [...daySlots, slotTime].sort();
    }

    setWeeklySlots({
      ...weeklySlots,
      [day]: updated,
    });
  };

  const availableHours = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

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

  if (doctorProfile && !doctorProfile.isApproved) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full mx-auto bg-white p-8 border border-gray-100 shadow-xl rounded-3xl text-center space-y-6">
          <div className="flex justify-center text-amber-500">
            <div className="p-4 bg-amber-50 rounded-full">
              <Stethoscope className="h-16 w-16 text-amber-600 animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight text-center">Vetting Application</h2>
          <p className="text-gray-600 leading-relaxed text-center">
            Your medical provider profile is currently undergoing manual credentials vetting and administrator authorization.
          </p>
          <div className="bg-amber-50/50 p-4 border border-amber-100 rounded-2xl text-left">
            <p className="text-xs text-amber-950 font-bold">Registration Details:</p>
            <p className="text-xs text-gray-600 mt-1"><span className="font-semibold">Specialization:</span> {doctorProfile.specialization}</p>
            <p className="text-xs text-gray-600"><span className="font-semibold">Qualifications:</span> {doctorProfile.qualifications}</p>
            <p className="text-xs text-gray-600"><span className="font-semibold">Clinic Address:</span> {doctorProfile.clinicAddress}</p>
          </div>
          <p className="text-xs text-gray-400 text-center">
            You can log out and log back in as an administrator (<span className="font-semibold">admin@medibook.com</span>) to instantly approve this doctor profile and test full schedules!
          </p>
          <div className="pt-4 flex justify-center">
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer text-xs"
            >
              Sign Out & Use Admin Panel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 text-left" id="doctor_portal_page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Doctor Clinical Portal</h1>
            <p className="text-sm text-slate-500">Manage patient visits, check diagnostics vault, and update consultation schedules.</p>
          </div>
          <button
            onClick={loadData}
            className="p-2 bg-white hover:bg-blue-50 hover:text-blue-700 border border-slate-200 hover:border-blue-200 rounded-xl transition-all flex items-center space-x-1 cursor-pointer font-bold text-xs"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Reload Portal</span>
          </button>
        </div>

        {/* Global Errors/Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-start space-x-3 text-left">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div className="text-sm text-red-700">
              <p className="font-semibold">Clinical Error</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl flex items-start space-x-3 text-left">
            <CheckCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold">Action Completed</p>
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
            
            {/* Left Column: Metrics & Weekly Slot Configuration */}
            <div className="lg:col-span-4 space-y-8 text-left">
              
              {/* Doctor Quick Stats */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 grid grid-cols-3 gap-2">
                <div className="text-center p-3 bg-blue-50/30 rounded-xl">
                  <p className="text-xl font-black text-blue-600">
                    {appointments.filter((a) => a.status === 'pending').length}
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Pending</p>
                </div>
                <div className="text-center p-3 bg-emerald-50/30 rounded-xl">
                  <p className="text-xl font-black text-emerald-600">
                    {appointments.filter((a) => a.status === 'confirmed').length}
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Confirmed</p>
                </div>
                <div className="text-center p-3 bg-blue-50/30 rounded-xl">
                  <p className="text-xl font-black text-blue-600">
                    {appointments.filter((a) => a.status === 'completed').length}
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Visits</p>
                </div>
              </div>

              {/* Availability Scheduler Card */}
              <div className="bg-white border border-slate-100 shadow-xs rounded-3xl p-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
                  <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span>Clinical Schedule</span>
                  </h3>
                  <button
                    onClick={() => {
                      setIsEditingSlots(!isEditingSlots);
                      setWeeklySlots(doctorProfile?.availability || {});
                    }}
                    className="p-1.5 hover:bg-slate-50 border border-slate-100 rounded-lg text-slate-500 hover:text-blue-600 transition-all cursor-pointer text-xs flex items-center gap-1"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>{isEditingSlots ? 'Cancel' : 'Edit'}</span>
                  </button>
                </div>

                {isEditingSlots ? (
                  <div className="space-y-4">
                    <p className="text-[11px] text-slate-500">Check day and time blocks patients can select during bookings.</p>
                    {daysOfWeek.map((day) => (
                      <div key={day} className="space-y-1.5 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                        <p className="text-xs font-bold text-slate-900">{day}</p>
                        <div className="flex flex-wrap gap-1">
                          {availableHours.map((hour) => {
                            const isChecked = (weeklySlots[day] || []).includes(hour);
                            return (
                              <button
                                key={hour}
                                onClick={() => toggleSlot(day, hour)}
                                className={`py-1 px-2 text-[10px] font-bold rounded border cursor-pointer transition-colors ${
                                  isChecked
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                {hour}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={handleSaveSlots}
                      className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      Save Weekly Schedule
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 text-xs">
                    {daysOfWeek.map((day) => {
                      const slots = doctorProfile?.availability?.[day] || [];
                      return (
                        <div key={day} className="flex justify-between items-start border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                          <span className="font-bold text-slate-800">{day}</span>
                          <span className="text-slate-500 text-right max-w-[180px] font-medium leading-relaxed">
                            {slots.length > 0 ? slots.join(', ') : 'Not consulting'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* Right Column: Appointments & Diagnostic Files Shared */}
            <div className="lg:col-span-8 space-y-8 text-left">
              
              {/* Patient Appointments Card */}
              <div className="bg-white border border-slate-100 shadow-xs rounded-3xl p-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
                  <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <span>My Patient Visits</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-semibold">{appointments.length} Consultations</span>
                </div>

                {appointments.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 space-y-2">
                    <Calendar className="h-8 w-8 mx-auto text-gray-300" />
                    <p className="text-sm font-semibold">No appointments scheduled.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((apt) => (
                      <div
                        key={apt.id}
                        className="p-4 border border-slate-100 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-200 transition-colors"
                      >
                        <div className="space-y-1.5 flex-1 text-left">
                          <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                            <span className="font-bold text-slate-900 text-sm">{apt.patientName}</span>
                            <span className="text-[10px] text-slate-400">Phone: {apt.patientPhone}</span>
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

                          {apt.prescription && (
                            <div className="bg-blue-50/50 border border-blue-100 p-2.5 rounded-xl text-xs space-y-1 mt-1.5">
                              <p className="font-bold text-blue-900 flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                Prescription Issued
                              </p>
                              <p className="text-slate-700"><span className="font-semibold">Meds:</span> {apt.prescription.medications}</p>
                              <p className="text-slate-700"><span className="font-semibold">Directions:</span> {apt.prescription.instructions}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 shrink-0 w-full md:w-auto">
                          {apt.status === 'pending' && (
                            <button
                              onClick={() => handleConfirmAppointment(apt.id)}
                              className="flex-1 md:flex-none py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                            >
                              Approve
                            </button>
                          )}
                          {(apt.status === 'pending' || apt.status === 'confirmed') && (
                            <>
                              <button
                                onClick={() => handleOpenPrescription(apt)}
                                className="flex-1 md:flex-none py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                              >
                                Issue Prescription
                              </button>
                              <button
                                onClick={() => handleCancelAppointment(apt.id)}
                                className="flex-1 md:flex-none py-1.5 px-3 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Shared Patient Files Vault */}
              <div className="bg-white border border-slate-100 shadow-xs rounded-3xl p-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
                  <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span>Shared Diagnostic Files</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-semibold">{sharedReports.length} Shared Documents</span>
                </div>

                {sharedReports.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 space-y-2">
                    <FileText className="h-8 w-8 mx-auto text-gray-300" />
                    <p className="text-sm font-semibold">No medical documents shared yet.</p>
                    <p className="text-xs text-gray-400">Reports uploaded by patients mapped to your clinic appear here.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                    {sharedReports.map((rep) => (
                      <div
                        key={rep.id}
                        className="p-4 border border-slate-100 rounded-2xl flex flex-col justify-between hover:border-blue-200 transition-colors"
                      >
                        <div className="space-y-1.5 min-w-0">
                          <p className="font-bold text-slate-900 text-sm truncate" title={rep.fileName}>
                            {rep.fileName}
                          </p>
                          <p className="text-xs text-blue-600 font-semibold truncate">"Description: {rep.description}"</p>
                          <p className="text-[10px] text-slate-500 font-medium">Patient: <span className="text-slate-800 font-semibold">{rep.patientName}</span></p>
                          <div className="flex items-center space-x-2 text-[10px] text-slate-400 pt-1">
                            <span>{rep.fileSize}</span>
                            <span>•</span>
                            <span>{new Date(rep.uploadedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="pt-3 flex border-t border-slate-50 mt-3">
                          <a
                             href={rep.filePath}
                             target="_blank"
                             rel="noreferrer"
                             className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                          >
                            <span>View / Download Shared Report</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* Prescription Form Modal */}
        {selectedApt && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] text-left">
              
              <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">Issue Clinical Prescription</h2>
                  <p className="text-xs opacity-85 mt-1">Patient: {selectedApt.patientName}</p>
                </div>
                <button
                  onClick={() => setSelectedApt(null)}
                  className="p-1 text-white hover:bg-white/15 rounded-lg transition-all cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddPrescriptionSubmit} className="p-6 space-y-6 flex-1 overflow-y-auto">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Rx Medications
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="e.g. Amoxicillin 500mg, Paracetamol 650mg"
                    value={rxMeds}
                    onChange={(e) => setRxMeds(e.target.value)}
                    className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Instructions & Dosage
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="e.g. 1 capsule three times daily after meals for 7 days."
                    value={rxDirections}
                    onChange={(e) => setRxDirections(e.target.value)}
                    className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Doctor Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Additional clinical suggestions, allergy warnings..."
                    value={rxNotes}
                    onChange={(e) => setRxNotes(e.target.value)}
                    className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setSelectedApt(null)}
                    className="flex-1 py-2.5 border border-slate-200 text-sm font-bold text-slate-500 rounded-xl hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={prescriptionSubmitting}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1"
                  >
                    <span>{prescriptionSubmitting ? 'Submitting...' : 'Issue Rx'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
