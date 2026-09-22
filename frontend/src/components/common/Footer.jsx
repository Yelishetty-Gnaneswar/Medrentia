import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, ShieldCheck, Phone, Mail, MapPin, Clock, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-navy-950 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: Brand & Tagline */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-2.5">
              <img
                src="/logo.png"
                alt="MedRentia Logo"
                className="w-10 h-10 rounded-xl object-contain shadow-lg shrink-0"
              />
              <span className="text-2xl font-black text-white tracking-tight">
                MED<span className="text-medgreen-400">RENTIA</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              <strong>{t('footer.tagline')}</strong> {t('footer.desc')}
            </p>

            <div className="flex items-center space-x-3 pt-2">
              <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-emerald-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{t('footer.hygieneCert')}</span>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              {t('footer.explore')}
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/equipment" className="hover:text-medblue-400 transition-colors">
                  {t('footer.allDevices')}
                </Link>
              </li>
              <li>
                <Link to="/equipment?category=mobility-equipment" className="hover:text-medblue-400 transition-colors">
                  {t('footer.mobility')}
                </Link>
              </li>
              <li>
                <Link to="/equipment?category=respiratory-equipment" className="hover:text-medblue-400 transition-colors">
                  {t('footer.respiratory')}
                </Link>
              </li>
              <li>
                <Link to="/equipment?category=home-healthcare-equipment" className="hover:text-medblue-400 transition-colors">
                  {t('footer.hospitalBeds')}
                </Link>
              </li>
              <li>
                <Link to="/equipment?category=monitoring-devices" className="hover:text-medblue-400 transition-colors">
                  {t('footer.monitors')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: For Providers & Support */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              {t('footer.partnerTrust')}
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/register?role=provider" className="hover:text-medblue-400 transition-colors">
                  {t('footer.becomeProvider')}
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-medblue-400 transition-colors">
                  {t('footer.hygiene')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-medblue-400 transition-colors">
                  {t('footer.mission')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-medblue-400 transition-colors">
                  {t('footer.support24')}
                </Link>
              </li>
              <li>
                <Link to="/delivery-policy" className="hover:text-medblue-400 transition-colors">
                  {t('footer.refundPolicy')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Hotline */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              {t('footer.directContact')}
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="text-xs text-slate-300 font-semibold">
                {t('footer.supportLead')} <strong className="text-white">Gnaneswar Yelishetty</strong>
              </li>
              <li className="flex items-start space-x-2.5">
                <Phone className="w-4 h-4 text-medblue-400 mt-0.5 shrink-0" />
                <a href="tel:9652601628" className="hover:text-medblue-400 transition-colors">
                  +91 9652601628
                </a>
              </li>
              <li className="flex items-start space-x-2.5">
                <Mail className="w-4 h-4 text-medblue-400 mt-0.5 shrink-0" />
                <a href="mailto:yelishettygnaneswar@gmail.com" className="hover:text-medblue-400 transition-colors">
                  yelishettygnaneswar@gmail.com
                </a>
              </li>
              <li className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-medblue-400 mt-0.5 shrink-0" />
                <span>Hyderabad, Telangana, India</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <Clock className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>{t('footer.emergencyDispatch')}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 space-y-4 md:space-y-0">
          <p>© {new Date().getFullYear()} {t('footer.rights')}</p>
          <div className="flex items-center space-x-6">
            <span className="text-slate-400">{t('footer.currency')}</span>
            <Link to="/terms" className="hover:text-slate-400">{t('footer.terms')}</Link>
            <Link to="/privacy" className="hover:text-slate-400">{t('footer.privacy')}</Link>
            <Link to="/compliance" className="hover:text-slate-400">{t('footer.compliance')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
