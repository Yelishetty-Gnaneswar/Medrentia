import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HeartPulse,
  Search,
  ShieldCheck,
  Truck,
  Sparkles,
  Clock,
  CheckCircle2,
  ArrowRight,
  Star,
  Users,
  Award,
  Layers,
  PhoneCall,
  Activity,
  ChevronDown,
  Building,
  ShoppingBag,
} from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { handleImageError, getExactMedicalImage } from '../utils/imageFallback';

const LandingPage = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [featuredEquipment, setFeaturedEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [catRes, equipRes] = await Promise.all([
          api.get('/categories'),
          api.get('/equipment/featured'),
        ]);

        if (catRes.data.success) setCategories(catRes.data.data);
        if (equipRes.data.success) setFeaturedEquipment(equipRes.data.data);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/equipment?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const whyChooseItems = [
    {
      icon: Award,
      title: 'Affordable Rentals',
      desc: 'Flexible daily, weekly, monthly & yearly rental tiers in ₹ INR saving up to 70% compared to purchasing.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: ShieldCheck,
      title: 'Verified Equipment',
      desc: 'Every medical device is certified by biomedical engineers for accuracy and electrical safety.',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      icon: Sparkles,
      title: 'Sanitized & Sterilized',
      desc: 'Hospital-grade autoclaving and UV-C sterilization performed before every dispatch with sealing certificate.',
      color: 'from-purple-500 to-indigo-500',
    },
    {
      icon: Award,
      title: 'Transparent Pricing',
      desc: 'No hidden charges. Clear breakdown of rental fees, 100% refundable security deposits, and GST.',
      color: 'from-orange-500 to-amber-500',
    },
    {
      icon: Truck,
      title: 'Doorstep Delivery',
      desc: 'Same-day express delivery across major cities with full on-site setup and user demonstration.',
      color: 'from-sky-500 to-blue-600',
    },
    {
      icon: ShieldCheck,
      title: 'Secure Payments',
      desc: 'Integrated Razorpay test gateway supporting UPI, Cards, NetBanking with protected escrow security.',
      color: 'from-emerald-600 to-green-600',
    },
    {
      icon: Clock,
      title: 'Flexible Rental Periods',
      desc: 'Easily extend rental duration or request hassle-free return pickup directly from your dashboard.',
      color: 'from-violet-600 to-purple-600',
    },
    {
      icon: PhoneCall,
      title: '24/7 Patient Support',
      desc: 'Round-the-clock biomedical technician helpline for emergency machine support and troubleshooting.',
      color: 'from-rose-500 to-pink-500',
    },
  ];

  const faqs = [
    {
      q: 'How does medical equipment rental work on MedRentia?',
      a: 'Simply browse our verified marketplace, choose your equipment and rental period (daily, weekly, monthly, or yearly), complete secure online checkout, and our express logistics team will deliver sanitized equipment directly to your doorstep with full setup assistance.',
    },
    {
      q: 'How is the equipment sanitized between patients?',
      a: 'We follow rigorous hospital-grade decontamination protocols including chemical sterilization, UV-C ultraviolet disinfection, and sensor calibration. Every item arrives vacuum-sealed with a verifiable sanitization certificate number.',
    },
    {
      q: 'When and how is my security deposit refunded?',
      a: 'Security deposits are 100% refundable. Once the rental duration concludes and our logistics team inspects the equipment, your deposit is automatically refunded back to your original payment method within 24-48 business hours.',
    },
    {
      q: 'Can I extend my rental period if recovery takes longer?',
      a: 'Yes, absolutely! You can extend your active rental at any time from your Customer Dashboard with a single click at discounted continuation rates.',
    },
    {
      q: 'What payment methods are supported?',
      a: 'We support all major Indian payment methods via Razorpay including UPI (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit Cards (Visa, Mastercard, RuPay), and Net Banking across all major Indian banks.',
    },
  ];

  return (
    <div className="space-y-20 pb-16 overflow-x-hidden w-full">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-medblue-50/80 via-white to-slate-50 pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-100">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-medblue-100/70 border border-medblue-200 rounded-full text-xs font-bold text-medblue-800 shadow-sm">
                <HeartPulse className="w-4 h-4 text-medblue-600 animate-pulse" />
                <span>{t('landing.heroBadge')}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-navy-950 tracking-tight leading-[1.15]">
                {t('landing.heroTitle1')} <br />
                <span className="bg-gradient-to-r from-medblue-600 via-medblue-700 to-medgreen-600 bg-clip-text text-transparent">
                  {t('landing.heroTitle2')}
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl font-normal leading-relaxed">
                {t('landing.heroDesc')}
              </p>

              {/* Prominent Search Bar */}
              <form onSubmit={handleSearch} className="relative max-w-xl shadow-xl rounded-full bg-white p-1.5 border border-slate-200 focus-within:border-medblue-500 focus-within:ring-4 focus-within:ring-medblue-100 transition-all">
                <div className="flex items-center">
                  <Search className="w-5 h-5 text-slate-400 ml-4 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('navbar.searchPlaceholder')}
                    className="w-full px-4 py-3 text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-medblue-600 to-medgreen-600 hover:from-medblue-700 hover:to-medgreen-700 text-white font-bold text-sm rounded-full shadow-md transition-all shrink-0"
                  >
                    {t('common.search')}
                  </button>
                </div>
              </form>

              {/* CTAs */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/equipment"
                  className="px-7 py-3.5 bg-medblue-600 hover:bg-medblue-700 text-white rounded-full font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
                >
                  <span>{t('landing.rentEquipmentBtn')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/register?role=provider"
                  className="px-7 py-3.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-full font-bold text-sm shadow-sm transition-all"
                >
                  {t('landing.providerBtn')}
                </Link>
              </div>

              {/* Quick Trust Highlights */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80 text-left">
                <div>
                  <p className="text-2xl font-black text-medblue-900">₹150<span className="text-xs font-semibold text-slate-500">{t('common.perDay')}</span></p>
                  <p className="text-xs text-slate-500 font-medium">{t('landing.step1Title')}</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-medgreen-600">100%</p>
                  <p className="text-xs text-slate-500 font-medium">{t('landing.verifiedGear')}</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-navy-900">3-Hour</p>
                  <p className="text-xs text-slate-500 font-medium">{t('landing.step3Title')}</p>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1000&q=80"
                    alt="Medical Equipment Care"
                    className="w-full h-[440px] object-cover"
                  />
                </div>

                {/* Floating Badge 1 */}
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Hospital-Grade Quality</p>
                    <p className="text-[11px] text-slate-500">Certified by biomedical teams</p>
                  </div>
                </div>

                {/* Floating Badge 2 */}
                <div className="absolute -top-4 -right-4 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-medblue-100 text-medblue-600 flex items-center justify-center font-bold">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Doorstep Delivery</p>
                    <p className="text-[11px] text-slate-500">Live order tracking</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUSTED BY / TRUST BADGES */}
      <section className="container mx-auto px-4 lg:px-6">
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <ShieldCheck className="w-8 h-8 text-medblue-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">Verified Providers</h4>
            <p className="text-xs text-slate-500">All vendors background checked</p>
          </div>
          <div className="space-y-1">
            <Sparkles className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">UV-C Sterilization</h4>
            <p className="text-xs text-slate-500">Multi-stage hygienic seal</p>
          </div>
          <div className="space-y-1">
            <Truck className="w-8 h-8 text-medorange-500 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">Free Setup & Demo</h4>
            <p className="text-xs text-slate-500">Trained biomedical assistants</p>
          </div>
          <div className="space-y-1">
            <Award className="w-8 h-8 text-medpurple-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">100% Deposit Refund</h4>
            <p className="text-xs text-slate-500">Fast 24-48h refund turnaround</p>
          </div>
        </div>
      </section>

      {/* 3. EQUIPMENT CATEGORIES (9 Categories) */}
      <section className="container mx-auto px-4 lg:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10">
          <div>
            <span className="text-xs font-bold text-medblue-600 uppercase tracking-wider">Browse by Specialty</span>
            <h2 className="text-3xl font-black text-navy-950 mt-1">Medical Equipment Categories</h2>
          </div>
          <Link
            to="/equipment"
            className="mt-4 md:mt-0 text-sm font-bold text-medblue-600 hover:text-medblue-700 flex items-center space-x-1"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat._id || cat.slug}
              to={`/equipment?category=${cat.slug}`}
              className="group bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-medblue-400 hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-medblue-50 to-medgreen-50 text-medblue-600 group-hover:scale-110 group-hover:bg-medblue-600 group-hover:text-white transition-all flex items-center justify-center font-bold shadow-sm">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-medblue-600 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-medblue-600">
                <span>{cat.itemCount || 'Available'} listings</span>
                <span className="group-hover:translate-x-1 transition-transform flex items-center space-x-1">
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. POPULAR EQUIPMENT SHOWCASE */}
      <section className="bg-slate-100/60 py-16 border-y border-slate-200/80">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10">
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Top Rented Devices</span>
              <h2 className="text-3xl font-black text-navy-950 mt-1">Popular Medical Equipment</h2>
            </div>
            <Link
              to="/equipment"
              className="mt-4 md:mt-0 px-5 py-2.5 bg-white border border-slate-200 hover:border-medblue-500 rounded-full text-xs font-bold text-slate-700 shadow-sm transition-all"
            >
              Explore Full Marketplace (₹)
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredEquipment.slice(0, 4).map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-48 bg-slate-50 overflow-hidden">
                    <img
                      src={item.images?.[0] || getExactMedicalImage(item.name, item.categoryName)}
                      alt={item.name}
                      onError={(e) => handleImageError(e, item.name, item.categoryName)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[11px] font-bold text-medblue-700 shadow-sm">
                      {item.categoryName}
                    </span>
                    <span className="absolute top-3 right-3 px-2.5 py-1 bg-emerald-500 text-white rounded-full text-[11px] font-bold flex items-center space-x-1 shadow-sm">
                      <Star className="w-3 h-3 fill-current" />
                      <span>{item.rating}</span>
                    </span>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-medblue-600 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {item.shortDescription}
                    </p>

                    <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                      <span>Condition: <strong>{item.condition}</strong></span>
                      <span className="text-emerald-600 font-semibold">✓ Sanitized</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between mb-3">
                    <div>
                      <span className="text-xs text-slate-400 block">Rental Price</span>
                      <p className="text-lg font-black text-navy-950">
                        ₹{item.dailyPrice?.toLocaleString('en-IN')}<span className="text-xs font-normal text-slate-500">/day</span>
                      </p>
                      <span className="text-[11px] text-medblue-600 font-semibold">
                        ₹{item.weeklyPrice?.toLocaleString('en-IN')}/week
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to={`/equipment/${item._id}`}
                      className="py-2.5 text-center bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
                    >
                      View Details
                    </Link>
                    <Link
                      to={`/equipment/${item._id}`}
                      className="py-2.5 text-center bg-medblue-600 hover:bg-medblue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center justify-center space-x-1"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Rent Now</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. WHY MEDRENTIA (8 Features) */}
      <section className="container mx-auto px-4 lg:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-medblue-600 uppercase tracking-wider">The MedRentia Standard</span>
          <h2 className="text-3xl font-black text-navy-950 mt-1">Why Choose MedRentia for Medical Rentals?</h2>
          <p className="text-sm text-slate-600 mt-2">
            Hospital-grade precision and sanitized medical equipment designed for safe, dignified home convalescence.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {whyChooseItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow space-y-3"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${item.color} text-white flex items-center justify-center font-bold shadow-md`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. HOW IT WORKS */}
      <section className="bg-navy-950 text-white py-16">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-medgreen-400 uppercase tracking-wider">Simple 4-Step Journey</span>
            <h2 className="text-3xl font-black text-white mt-1">How MedRentia Works</h2>
            <p className="text-sm text-slate-400 mt-2">
              From search to doorstep delivery and return pickup in just a few clicks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {[
              {
                step: '01',
                title: 'Select Equipment',
                desc: 'Browse our catalog of verified wheelchairs, beds, oxygen concentrators, and ICU gear.',
              },
              {
                step: '02',
                title: 'Choose Duration & Book',
                desc: 'Pick daily, weekly, monthly or annual rental duration with clear ₹ pricing and refundable deposit.',
              },
              {
                step: '03',
                title: 'Sanitized Delivery',
                desc: 'Our logistics team delivers sterilized equipment to your room and performs complete operational demonstration.',
              },
              {
                step: '04',
                title: 'Easy Return / Extension',
                desc: 'Extend online when needed or request pickup when recovery is complete to receive instant deposit refund.',
              },
            ].map((step, idx) => (
              <div key={idx} className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 relative space-y-3">
                <span className="text-4xl font-black text-medblue-500/30">{step.step}</span>
                <h3 className="text-lg font-bold text-white">{step.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. SAFETY & HYGIENE PROTOCOL */}
      <section className="container mx-auto px-4 lg:px-6">
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 rounded-3xl p-8 lg:p-12 border border-emerald-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-200/60 rounded-full text-xs font-bold text-emerald-900">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span>Zero Compromise Patient Safety</span>
              </div>
              <h2 className="text-3xl font-black text-navy-950">
                Medical Sterilization & Calibration Guarantee
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed">
                Every piece of medical equipment returned to MedRentia passes through a strict 3-tier hospital decontamination cycle before being re-listed.
              </p>

              <div className="space-y-2 pt-2">
                {[
                  'Hospital-Grade High Level Disinfection (HLD) & Autoclave Treatment',
                  'UV-C Ultraviolet chamber decontamination for electronic sensors',
                  'Biomedical calibration check ensuring exact clinical precision',
                  'Sealed in sterile anti-microbial barrier packaging prior to dispatch',
                ].map((text, i) => (
                  <div key={i} className="flex items-center space-x-2 text-xs font-semibold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xl border border-emerald-100 space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Sample Sterilization Certificate</h3>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Certificate No:</span>
                  <span className="font-mono font-bold text-medblue-700">MED-SAN-89420</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Standard:</span>
                  <span className="font-semibold text-slate-800">ISO 13485 Biomedical Grade</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-bold text-emerald-600">✓ Certified Sterile & Calibrated</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 italic">
                Affixed to every equipment carton with serial verification code.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ ACCORDION */}
      <section className="container mx-auto px-4 lg:px-6 max-w-3xl">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-medblue-600 uppercase tracking-wider">Common Questions</span>
          <h2 className="text-3xl font-black text-navy-950 mt-1">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-colors"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full px-6 py-4 text-left font-bold text-sm text-slate-800 flex justify-between items-center"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    activeFaq === idx ? 'rotate-180 text-medblue-600' : ''
                  }`}
                />
              </button>
              {activeFaq === idx && (
                <div className="px-6 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 9. PROVIDER & CUSTOMER CTAs */}
      <section className="container mx-auto px-4 lg:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Card */}
          <div className="bg-gradient-to-br from-medblue-600 to-medblue-800 text-white rounded-3xl p-8 lg:p-10 flex flex-col justify-between shadow-xl">
            <div className="space-y-3">
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold text-white uppercase tracking-wider">
                For Patients & Families
              </span>
              <h3 className="text-2xl font-black">Need Equipment Urgently?</h3>
              <p className="text-xs text-medblue-100 leading-relaxed">
                Rent hospital beds, oxygen concentrators, and wheelchairs delivered sanitized within 3 hours.
              </p>
            </div>
            <div className="pt-6">
              <Link
                to="/equipment"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-white text-medblue-800 rounded-full font-bold text-xs shadow-md hover:bg-slate-50 transition-colors"
              >
                <span>Explore Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Provider Card */}
          <div className="bg-gradient-to-br from-navy-900 to-navy-950 text-white rounded-3xl p-8 lg:p-10 flex flex-col justify-between shadow-xl border border-slate-800">
            <div className="space-y-3">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider">
                For Equipment Providers
              </span>
              <h3 className="text-2xl font-black">Monetize Your Medical Inventory</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                List your medical devices on MedRentia, receive verified bookings, automated ₹ payments, and logistics management.
              </p>
            </div>
            <div className="pt-6">
              <Link
                to="/register?role=provider"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-medgreen-600 text-white rounded-full font-bold text-xs shadow-md hover:bg-medgreen-700 transition-colors"
              >
                <span>Join as Provider</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
