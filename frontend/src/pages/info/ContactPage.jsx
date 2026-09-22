import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2, HeartPulse } from 'lucide-react';

const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Rental Inquiry',
    message: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="container mx-auto px-4 lg:px-6 space-y-12 max-w-5xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-medblue-600 uppercase tracking-wider">
            24/7 Patient & Caregiver Support
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-navy-950">Contact MedRentia</h1>
          <p className="text-xs text-slate-500 max-w-lg mx-auto">
            Our biomedical support team is available round the clock for urgent medical rentals, technical troubleshooting, and dispatch inquiries.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Details Cards */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 text-xs">
              <div className="flex items-start space-x-3">
                <div className="w-9 h-9 rounded-xl bg-medblue-50 text-medblue-600 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Dedicated Support Lead</h4>
                  <p className="text-slate-800 font-bold text-xs mt-0.5">Gnaneswar Yelishetty</p>
                  <p className="text-medblue-700 font-bold text-sm mt-0.5">
                    <a href="tel:9652601628" className="hover:underline">
                      +91 9652601628
                    </a>
                  </p>
                  <p className="text-slate-400 text-[10px]">Instant triage for rentals & patient support</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 pt-3 border-t border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Direct Support Email</h4>
                  <p className="text-slate-700 font-semibold mt-0.5">
                    <a href="mailto:yelishettygnaneswar@gmail.com" className="hover:underline text-medblue-700 font-bold">
                      yelishettygnaneswar@gmail.com
                    </a>
                  </p>
                  <p className="text-slate-400 text-[10px]">Dedicated customer & rental assistance</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 pt-3 border-t border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Headquarters & Support Hub</h4>
                  <p className="text-slate-600 mt-0.5">
                    Hyderabad, Telangana, India
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-md">
              {submitted ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Message Received</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Our biomedical patient coordinator will call you back within 15-30 minutes.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <h3 className="text-base font-bold text-navy-950 pb-2 border-b border-slate-100">
                    Send Us a Message
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Rahul Sharma"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medblue-500"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Contact Phone *</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98450 12345"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medblue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="rahul@example.com"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medblue-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Message / Equipment Details *</label>
                    <textarea
                      rows="3"
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Specify equipment requirement, patient location, or duration needed..."
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medblue-500"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-medblue-600 hover:bg-medblue-700 text-white rounded-2xl font-bold text-xs shadow-md transition-colors flex items-center justify-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Message to MedRentia Care</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
