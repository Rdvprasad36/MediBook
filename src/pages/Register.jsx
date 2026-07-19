import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Stethoscope, Mail, Lock, Phone, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';

export const Register = () => {
  const { registerUser, user, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('patient');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Doctor-specific fields
  const [specialization, setSpecialization] = useState('Cardiology');
  const [experience, setExperience] = useState('');
  const [bio, setBio] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');

  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    clearError();
    setLocalError(null);
  }, [role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    // Validations
    if (!name || !email || !password || !phone) {
      setLocalError('Please fill in all standard fields.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }

    const payload = {
      name,
      email,
      password,
      phone,
      role,
    };

    if (role === 'doctor') {
      if (!specialization || !experience || !consultationFee || !qualifications || !clinicAddress) {
        setLocalError('Please fill in all professional doctor profile fields.');
        return;
      }
      payload.specialization = specialization;
      payload.experience = experience;
      payload.bio = bio;
      payload.consultationFee = consultationFee;
      payload.qualifications = qualifications;
      payload.clinicAddress = clinicAddress;
    }

    setLoading(true);
    try {
      const data = await registerUser(payload);
      setLoading(false);
      
      if (role === 'doctor') {
        setSuccessMessage('Your Doctor registration was received! Your application is pending manual administrator review.');
      } else {
        navigate('/patient-portal');
      }
    } catch (err) {
      setLoading(false);
    }
  };

  if (successMessage) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full mx-auto bg-white p-8 border border-slate-100 shadow-xl rounded-3xl text-center space-y-6">
          <div className="flex justify-center text-blue-600">
            <div className="p-4 bg-blue-50 rounded-full">
              <CheckCircle className="h-16 w-16 text-blue-600 animate-bounce" />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Application Submitted</h2>
          <p className="text-slate-600 leading-relaxed">
            {successMessage}
          </p>
          <p className="text-sm text-slate-500">
            You can still explore approved doctors or log in with our mock patients/admins to test full functionalities.
          </p>
          <div className="pt-4">
            <Link
              to="/login"
              className="w-full inline-flex justify-center items-center py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8" id="register_page_wrapper">
      <div className="sm:mx-auto w-full max-w-xl">
        <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight animate-fade-in">
          Create Your MediBook Account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto w-full max-w-xl">
        <div className="bg-white py-8 px-4 border border-slate-100 shadow-xl rounded-3xl sm:px-10">
          
          {/* Role Tabs */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
            <button
              type="button"
              onClick={() => setRole('patient')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                role === 'patient'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <User className="h-4 w-4" />
              <span>I am a Patient</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('doctor')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                role === 'doctor'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Stethoscope className="h-4 w-4" />
              <span>I am a Doctor</span>
            </button>
          </div>

          {(localError || error) && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-start space-x-3 text-left">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div className="text-sm text-red-700">
                <p className="font-semibold">Unable to Register</p>
                <p className="mt-1">{localError || error}</p>
              </div>
            </div>
          )}

          <form className="space-y-6 text-left" onSubmit={handleSubmit}>
            
            {/* Standard Account Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700">Full Name</label>
                <div className="mt-1 relative rounded-md shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">Email Address</label>
                <div className="mt-1 relative rounded-md shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">Password</label>
                <div className="mt-1 relative rounded-md shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                    placeholder="Min 6 characters"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">Phone Number</label>
                <div className="mt-1 relative rounded-md shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                    placeholder="+91 98123 55555"
                  />
                </div>
              </div>
            </div>

            {/* Doctor-Specific Professional Details */}
            {role === 'doctor' && (
              <div className="border-t border-slate-100 pt-6 space-y-6">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                  <Stethoscope className="h-5 w-5 text-blue-600" />
                  <span>Clinical Credentials</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">Specialization</label>
                    <select
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      className="mt-1 block w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm cursor-pointer"
                    >
                      <option value="Cardiology">Cardiology</option>
                      <option value="Dermatology">Dermatology</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="General Practice">General Practice</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700">Experience (Years)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="mt-1 block w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="e.g. 10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700">Consultation Fee (₹)</label>
                    <input
                      type="number"
                      required
                      min="100"
                      value={consultationFee}
                      onChange={(e) => setConsultationFee(e.target.value)}
                      className="mt-1 block w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="e.g. 800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700">Qualifications</label>
                    <input
                      type="text"
                      required
                      value={qualifications}
                      onChange={(e) => setQualifications(e.target.value)}
                      className="mt-1 block w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="e.g. MD, FACC (Harvard)"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700">Clinic Address</label>
                  <input
                    type="text"
                    required
                    value={clinicAddress}
                    onChange={(e) => setClinicAddress(e.target.value)}
                    className="mt-1 block w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="e.g. Suite 400, 123 Health Ave, New Delhi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700">Doctor Bio</label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="mt-1 block w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Write a brief professional description..."
                  />
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all cursor-pointer"
                id="btn_submit_register"
              >
                {loading ? 'Creating Account...' : 'Complete Registration'}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
