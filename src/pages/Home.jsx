import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Activity, Search, Shield, Award, Users, Calendar, ArrowRight, ArrowUpRight } from 'lucide-react';
import { api } from '../context/AuthContext';

export const Home = () => {
  const navigate = useNavigate();
  const [specializations, setSpecializations] = useState([]);

  useEffect(() => {
    api.get('/doctors/specializations')
      .then((res) => setSpecializations(res.data))
      .catch((err) => console.error('Error fetching specializations:', err));
  }, []);

  const defaultSpecs = [
    { name: 'Cardiology', icon: Heart, desc: 'Heart diagnostics, preventative cardiology, failure management.', color: 'bg-rose-50 text-rose-600 border-rose-100' },
    { name: 'Dermatology', icon: Activity, desc: 'Acne, skin cancer screenings, adult & pediatric dermatology.', color: 'bg-amber-50 text-amber-600 border-amber-100' },
    { name: 'Pediatrics', icon: Users, desc: 'Comprehensive healthcare, vaccinations, development checks.', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { name: 'Neurology', icon: Award, desc: 'Migraine therapies, neuromuscular and neurological diagnostics.', color: 'bg-sky-50 text-sky-600 border-sky-100' }
  ];

  const handleSpecClick = (spec) => {
    navigate(`/doctors?specialization=${spec}`);
  };

  return (
    <div className="bg-gray-50 min-h-screen" id="home_page_wrapper">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-white via-blue-50/10 to-blue-100/15 py-16 md:py-24 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Col */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full text-xs font-semibold text-blue-700">
                <Heart className="h-3 w-3 fill-blue-600 animate-pulse" />
                <span>Your Trusted Medical Resource</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Healthcare Booking <br />
                <span className="text-blue-600">Simplified. Empowered.</span>
              </h1>
              
              <p className="text-lg text-slate-600 max-w-xl">
                Find verified clinical professionals, manage appointments dynamically, and keep your critical medical reports securely in a consolidated digital vault.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link
                  to="/doctors"
                  className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
                  id="btn_hero_find_doc"
                >
                  <Search className="h-5 w-5" />
                  <span>Browse Doctors</span>
                </Link>
                
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl border border-slate-200 shadow-xs transition-all"
                >
                  <span>Create Account</span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </Link>
              </div>
            </div>

            {/* Right Col: Interactive Visual Box */}
            <div className="lg:col-span-5 relative">
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-60"></div>
                
                <div className="space-y-6 relative">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <span className="font-bold text-slate-900">Featured Providers</span>
                    <span className="text-xs text-blue-600 font-semibold">Active Now</span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-3 bg-blue-50/25 border border-blue-50/50 rounded-2xl">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-700">SS</div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-bold text-slate-900">Dr. Sunita Sharma</p>
                        <p className="text-xs text-slate-500">Cardiology • 12 Years Exp</p>
                      </div>
                      <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                    </div>

                    <div className="flex items-center space-x-4 p-3 border border-slate-100 rounded-2xl">
                      <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-700">RM</div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-bold text-slate-900">Dr. Rajeev Mehta</p>
                        <p className="text-xs text-slate-500">Dermatology • 8 Years Exp</p>
                      </div>
                      <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-600 rounded-2xl text-white text-center shadow-xs">
                    <p className="text-xs uppercase tracking-wider font-semibold opacity-85">Consultation Fee</p>
                    <p className="text-2xl font-black mt-1">Starting from ₹500</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Board */}
      <section className="bg-white py-12 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-4xl font-extrabold text-blue-600">100%</p>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-2">Verified Doctors</p>
            </div>
            <div className="text-center border-l border-slate-100">
              <p className="text-4xl font-extrabold text-blue-600">5k+</p>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-2">Booked Sessions</p>
            </div>
            <div className="text-center border-l border-slate-100">
              <p className="text-4xl font-extrabold text-blue-600">15+</p>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-2">Medical Specialties</p>
            </div>
            <div className="text-center border-l border-slate-100">
              <p className="text-4xl font-extrabold text-blue-600">24/7</p>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-2">Digital Vault Access</p>
            </div>
          </div>
        </div>
      </section>

      {/* Specializations Sections */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-3 max-w-xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Explore Specialties</h2>
            <p className="text-slate-600">Find doctors suited to your exact clinical needs. Click on any category to view available clinical schedules.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {defaultSpecs.map((spec) => {
              const Icon = spec.icon;
              return (
                <button
                  key={spec.name}
                  onClick={() => handleSpecClick(spec.name)}
                  className="bg-white border border-slate-100 hover:border-blue-200 hover:shadow-lg rounded-2xl p-6 text-left transition-all duration-300 group cursor-pointer relative"
                >
                  <div className={`p-3 rounded-xl border w-fit ${spec.color} mb-4 transition-transform group-hover:scale-105`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 flex items-center justify-between">
                    <span>{spec.name}</span>
                    <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" />
                  </h3>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">{spec.desc}</p>
                </button>
              );
            })}
          </div>

          {specializations.length > 4 && (
            <div className="mt-8 flex justify-center flex-wrap gap-2">
              {specializations.filter(s => !['Cardiology', 'Dermatology', 'Pediatrics', 'Neurology'].includes(s)).map((spec) => (
                <button
                  key={spec}
                  onClick={() => handleSpecClick(spec)}
                  className="px-4 py-2 bg-white hover:bg-blue-50 hover:text-blue-700 border border-slate-200 hover:border-blue-200 rounded-full text-sm font-medium transition-all cursor-pointer"
                >
                  {spec}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Platform Features Section */}
      <section className="bg-white py-16 border-t border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-left">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                Designed for Patients, Doctors, & Administrators.
              </h2>
              <p className="text-slate-600 leading-relaxed">
                MediBook bridges the gap between healthcare seekers and clinicians through custom, dedicated portals. Rest easy knowing health communications are organized, secure, and intuitive.
              </p>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg mt-0.5">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Patient Digital Vault</h4>
                    <p className="text-sm text-slate-500">Securely upload and house diagnostic PDF records, scan details, and prescription history.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg mt-0.5">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Dynamic Schedule Managers</h4>
                    <p className="text-sm text-slate-500">Doctors customize operational consultation blocks weekly and handle reschedule demands in real-time.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg mt-0.5">
                    <Award className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Admin Quality Control</h4>
                    <p className="text-sm text-slate-500">Every registering medical provider undergoes credential vetting and manual board approval.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex flex-col justify-center items-center relative min-h-[300px]">
              <div className="h-16 w-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-4 shadow-sm">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">HIPAA compliant architecture</h3>
              <p className="text-sm text-slate-500 max-w-sm text-center leading-relaxed">
                Role-based middleware, JWT cryptographies, and localized disk encryption ensure that private data is restricted strictly to authorized clinicians and yourself.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
