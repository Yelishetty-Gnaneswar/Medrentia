import React from 'react';
import { Link } from 'react-router-dom';
import {
  HeartPulse,
  Search,
  ShieldCheck,
  Truck,
  Sparkles,
  Clock,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  BadgePercent,
} from 'lucide-react';

const HowItWorksPage = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-12 space-y-16">
      <div className="container mx-auto px-4 lg:px-6 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-medblue-600 uppercase tracking-wider">
            Patient Care & Hygiene Standards
          </span>
          <h1 className="text-4xl font-black text-navy-950">How MedRentia Works</h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            From easy discovery and transparent ₹ pricing to hospital-grade disinfection and guaranteed deposit returns, here is how we deliver medical care to your home.
          </p>
        </div>

        {/* 4 Step Process Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: 'Step 1',
              title: 'Discover & Choose',
              desc: 'Select from 9 medical categories including Wheelchairs, Hospital Beds, Oxygen Concentrators, and Patient Monitors.',
              icon: Search,
              color: 'from-blue-500 to-cyan-500',
            },
            {
              step: 'Step 2',
              title: 'Pick Rental Plan (₹)',
              desc: 'Choose daily, weekly, monthly, 6-month, or yearly durations with 100% refundable security deposits.',
              icon: BadgePercent,
              color: 'from-emerald-500 to-teal-500',
            },
            {
              step: 'Step 3',
              title: 'Sanitized Doorstep Setup',
              desc: 'Our logistics team delivers sterilized equipment, sets it up in your room, and provides complete demonstration.',
              icon: Truck,
              color: 'from-amber-500 to-orange-500',
            },
            {
              step: 'Step 4',
              title: 'Hassle-free Return',
              desc: 'Extend rental online anytime or schedule pickup with instant deposit refund within 24-48 business hours.',
              icon: RotateCcw,
              color: 'from-purple-500 to-indigo-500',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${item.color} text-white flex items-center justify-center font-bold shadow-md`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{item.step}</span>
                  <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Hospital Grade Disinfection Deep Dive */}
        <div className="bg-white rounded-3xl p-8 lg:p-12 border border-slate-200/80 shadow-md space-y-6">
          <div className="flex items-center space-x-2 text-emerald-600 font-bold text-sm">
            <Sparkles className="w-5 h-5" />
            <span>Biomedical Safety & Quality Assurance</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-navy-950">
            Our 3-Stage Hospital Grade Sterilization Protocol
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 text-xs text-slate-600">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">1. High-Level Disinfection (HLD)</h4>
              <p className="leading-relaxed">
                Chemical scrubbing using hospital-approved glutaraldehyde and enzymatic solutions eliminates 99.99% of bacteria and viruses on all structural surfaces.
              </p>
            </div>
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">2. UV-C Ultraviolet Radiation</h4>
              <p className="leading-relaxed">
                Sensitive electrical equipment (CPAP, Ventilators, Monitors) is treated in UV-C decontamination chambers to sterilize internal chambers without moisture damage.
              </p>
            </div>
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">3. Calibration & Sealed Barrier Packaging</h4>
              <p className="leading-relaxed">
                Biomedical technicians calibrate sensors against certified digital meters before sealing items in sterile tamper-evident medical film with a certificate number.
              </p>
            </div>
          </div>

          <div className="pt-4 text-center">
            <Link
              to="/equipment"
              className="inline-flex items-center space-x-2 px-8 py-3.5 bg-medblue-600 hover:bg-medblue-700 text-white rounded-full font-bold text-xs shadow-md transition-all"
            >
              <span>Explore Verified Equipment Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPage;
