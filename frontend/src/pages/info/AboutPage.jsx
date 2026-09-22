import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, ShieldCheck, Award, Users, CheckCircle2, ArrowRight } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-12 space-y-16">
      <div className="container mx-auto px-4 lg:px-6 space-y-12 max-w-5xl">
        {/* Hero */}
        <div className="text-center space-y-4">
          <img
            src="/logo.png"
            alt="MedRentia Logo"
            className="w-14 h-14 rounded-2xl object-contain shadow-lg mx-auto"
          />
          <span className="text-xs font-bold text-medblue-600 uppercase tracking-wider">About MedRentia</span>
          <h1 className="text-4xl font-black text-navy-950">
            Making Quality Healthcare Equipment Accessible Everywhere
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            MedRentia was founded with a single mission: to ensure patients and families in India can access sanitized, certified medical equipment on demand without prohibitive upfront purchase expenses.
          </p>
        </div>

        {/* Story & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <h2 className="text-2xl font-black text-navy-950">Why Medical Equipment Rental?</h2>
            <p>
              Most post-operative surgeries, geriatric convalescence, and temporary respiratory episodes require specialized medical devices for 2 to 12 weeks. Buying ICU beds, CPAP machines, or wheelchairs costs tens of thousands of rupees and results in idle storage after recovery.
            </p>
            <p>
              MedRentia connects hospital-grade certified equipment providers with patients, providing doorstep delivery, sanitized sterile sealing, biomedical demos, and full deposit escrow protection.
            </p>
            <div className="space-y-2 pt-2">
              <div className="flex items-center space-x-2 font-bold text-slate-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Transparent Rupee (₹) Pricing with Zero Hidden Fees</span>
              </div>
              <div className="flex items-center space-x-2 font-bold text-slate-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>100% Refundable Security Deposits in 24-48 Hours</span>
              </div>
              <div className="flex items-center space-x-2 font-bold text-slate-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>ISO 13485 Biomedical Decontamination Guarantee</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-slate-100">
            <img
              src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80"
              alt="MedRentia Care"
              className="w-full h-80 object-cover"
            />
          </div>
        </div>

        {/* Action */}
        <div className="bg-gradient-to-r from-medblue-900 to-navy-950 text-white rounded-3xl p-8 text-center space-y-4">
          <h3 className="text-2xl font-black">Need Trusted Medical Equipment Today?</h3>
          <p className="text-xs text-medblue-200 max-w-md mx-auto">
            Explore our verified catalog and book wheelchairs, hospital beds, and oxygen concentrators delivered within 3 hours.
          </p>
          <div className="pt-2">
            <Link
              to="/equipment"
              className="inline-flex items-center space-x-2 px-8 py-3 bg-medgreen-600 hover:bg-medgreen-700 text-white rounded-full font-bold text-xs shadow-md transition-all"
            >
              <span>Browse Equipment Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
