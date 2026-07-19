import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext';
import { Search, Sliders, Calendar, Clock, IndianRupee, Award, Star, Activity, CheckCircle, AlertCircle, MapPin, X } from 'lucide-react';

export const DoctorDirectory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  
  const [selectedSpec, setSelectedSpec] = useState(searchParams.get('specialization') || 'All');
  const [searchQuery, setSearchQuery] = useState('');
  const [maxFee, setMaxFee] = useState(2000);
  const [availableDay, setAvailableDay] = useState('All');

  const [bookingDoc, setBookingDoc] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingSlot, setBookingSlot] = useState('');
  const [bookingReason, setBookingReason] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, [searchQuery]);

  useEffect(() => {
    api.get('/doctors/specializations')
      .then((res) => setSpecializations(res.data))
      .catch((err) => console.error('Error specializations:', err));
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const searchQueryString = searchQuery ? `search=${searchQuery}` : '';
      const res = await api.get(`/doctors?${searchQueryString}`);
      setDoctors(res.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch doctor directory.');
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSpec = selectedSpec === 'All' || doc.specialization.toLowerCase() === selectedSpec.toLowerCase();
    const matchesFee = doc.consultationFee <= maxFee;
    const matchesDay = availableDay === 'All' || (doc.availability && doc.availability[availableDay] && doc.availability[availableDay].length > 0);
    return matchesSpec && matchesFee && matchesDay;
  });

  const handleOpenBooking = (doc) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'patient') {
      setError('Only patients can schedule doctor appointments.');
      setTimeout(() => setError(null), 5000);
      return;
    }
    setBookingDoc(doc);
    setBookingDate('');
    setBookingSlot('');
    setBookingReason('');
    setSuccess(null);
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!bookingDoc || !bookingDate || !bookingSlot || !bookingReason) {
      setError('Please fill in all booking fields.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await api.post('/appointments', {
        doctorId: bookingDoc.userId,
        date: bookingDate,
        timeSlot: bookingSlot,
        reason: bookingReason,
      });
      setSuccess(res.data.message || 'Appointment requested successfully!');
      setSubmitting(false);
      setTimeout(() => {
        setBookingDoc(null);
        setSuccess(null);
        navigate('/patient-portal');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Double-booking error or invalid slot.');
      setSubmitting(false);
    }
  };

  const getAvailableSlotsForChosenDate = () => {
    if (!bookingDoc || !bookingDate) return [];
    
    const dateObj = new Date(bookingDate);
    if (isNaN(dateObj.getTime())) return [];
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[dateObj.getDay()];
    
    return bookingDoc.availability[dayName] || [];
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12" id="doctor_directory_page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-left mb-10 space-y-2">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Find Medical Specialists</h1>
          <p className="text-gray-500 max-w-xl">Search approved clinical providers, verify professional reviews, and schedule appointments online.</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-start space-x-3 text-left">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div className="text-sm text-red-700">
              <p className="font-semibold">Directory Error</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs mb-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-4 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by doctor name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>

            <div className="md:col-span-3">
              <select
                value={selectedSpec}
                onChange={(e) => setSelectedSpec(e.target.value)}
                className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs cursor-pointer"
              >
                <option value="All">All Specializations</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Dermatology">Dermatology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Neurology">Neurology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="General Practice">General Practice</option>
                {specializations
                  .filter((s) => !['Cardiology', 'Dermatology', 'Pediatrics', 'Neurology', 'Orthopedics', 'General Practice'].includes(s))
                  .map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
              </select>
            </div>

            <div className="md:col-span-3">
              <select
                value={availableDay}
                onChange={(e) => setAvailableDay(e.target.value)}
                className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs cursor-pointer"
              >
                <option value="All">Any Weekday Availability</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <button
                onClick={() => {
                  setSelectedSpec('All');
                  setSearchQuery('');
                  setMaxFee(2000);
                  setAvailableDay('All');
                }}
                className="w-full py-2.5 px-3 text-xs font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-xl transition-all cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          </div>

          <div className="border-t border-slate-50 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1 max-w-xl">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <IndianRupee className="h-3.5 w-3.5 text-blue-600" />
                    <span>Max Consultation Fee: <span className="text-blue-600 font-extrabold">₹{maxFee}</span></span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-bold">₹200 - ₹2000</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="2000"
                  step="50"
                  value={maxFee}
                  onChange={(e) => setMaxFee(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
              <div className="text-slate-400 text-xs font-semibold self-end">
                Showing <span className="text-slate-700 font-bold">{filteredDoctors.length}</span> of <span className="text-slate-700 font-bold">{doctors.length}</span> verified specialists
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="bg-white rounded-3xl py-16 px-6 text-center border border-gray-100 shadow-xs max-w-lg mx-auto">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900">No doctors match your criteria</h3>
            <p className="text-sm text-gray-500 mt-2">Try adjusting your filters, including maximum fee and weekly schedule settings, or checking back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDoctors.map((doc) => (
              <div
                key={doc.userId}
                className="bg-white rounded-3xl border border-slate-100 hover:border-blue-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden text-left"
              >
                <div className="p-6 pb-4 border-b border-slate-50 flex items-start space-x-4">
                  <div className="h-12 w-12 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center font-bold text-blue-700 uppercase shrink-0">
                    {doc.name.replace('Dr. ', '').substring(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-extrabold text-slate-900 truncate">{doc.name}</h3>
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mt-0.5">{doc.specialization}</p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Award className="h-3 w-3 text-slate-400" />
                      <span>{doc.qualifications}</span>
                    </p>
                  </div>
                </div>

                <div className="p-6 py-4 flex-1 space-y-4">
                  <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">{doc.bio || 'No professional bio provided yet.'}</p>
                  
                  <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-4 text-xs">
                    <div>
                      <p className="text-slate-400 font-semibold uppercase tracking-wider">Experience</p>
                      <p className="text-slate-900 font-bold mt-1">{doc.experience} Years</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold uppercase tracking-wider">Consultation Fee</p>
                      <p className="text-slate-900 font-bold mt-1 text-blue-600">₹{doc.consultationFee}</p>
                    </div>
                  </div>

                  <div className="text-xs space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-slate-400 font-semibold flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>Clinic Location</span>
                    </p>
                    <p className="text-slate-700 font-medium truncate mt-0.5">{doc.clinicAddress}</p>
                  </div>

                  {doc.reviewsCount > 0 ? (
                    <div className="flex items-center space-x-1 text-sm text-amber-500">
                      <Star className="h-4 w-4 fill-amber-400 stroke-amber-400" />
                      <span className="font-bold">{doc.rating.toFixed(1)}</span>
                      <span className="text-slate-400 text-xs">({doc.reviewsCount} reviews)</span>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">No patient reviews yet</p>
                  )}
                </div>

                <div className="p-6 pt-0 mt-auto">
                  <button
                    onClick={() => handleOpenBooking(doc)}
                    className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-center space-x-1"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Book Appointment</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {bookingDoc && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
              
              <div className="p-6 bg-blue-600 text-white flex justify-between items-center text-left">
                <div>
                  <h2 className="text-xl font-bold">Schedule Consultation</h2>
                  <p className="text-xs opacity-85 mt-1">Booking with {bookingDoc.name}</p>
                </div>
                <button
                  onClick={() => setBookingDoc(null)}
                  className="p-1 text-white hover:bg-white/15 rounded-lg transition-all cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleBookAppointment} className="p-6 flex-1 overflow-y-auto space-y-6 text-left">
                {success ? (
                  <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl text-center space-y-3">
                    <CheckCircle className="h-12 w-12 text-blue-600 mx-auto" />
                    <p className="text-sm font-bold text-blue-900">{success}</p>
                    <p className="text-xs text-slate-500">Redirecting to your patient dashboard...</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Select Appointment Date
                      </label>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={bookingDate}
                        onChange={(e) => {
                          setBookingDate(e.target.value);
                          setBookingSlot('');
                        }}
                        className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>

                    {bookingDate && (
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Available Time Slots
                        </label>
                        {getAvailableSlotsForChosenDate().length === 0 ? (
                          <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-xs flex items-center space-x-2">
                            <AlertCircle className="h-4 w-4" />
                            <span>Doctor does not have active schedules on this weekday.</span>
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-2">
                            {getAvailableSlotsForChosenDate().map((slot) => (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => setBookingSlot(slot)}
                                className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                                  bookingSlot === slot
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                    : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-blue-50/20'
                                }`}
                              >
                                {slot}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Reason for Visit / Symptoms
                      </label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Please describe your clinical requirements or symptoms..."
                        value={bookingReason}
                        onChange={(e) => setBookingReason(e.target.value)}
                        className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex space-x-3">
                      <button
                        type="button"
                        onClick={() => setBookingDoc(null)}
                        className="flex-1 py-2.5 px-4 text-sm font-bold text-slate-500 hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting || !bookingSlot}
                        className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-1"
                      >
                        <span>{submitting ? 'Booking...' : 'Confirm Appointment'}</span>
                        {!submitting && <CheckCircle className="h-4 w-4" />}
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
