import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  User,
  Search,
  Menu,
  X,
  Bell,
  ChevronDown,
  LogOut,
  ShieldCheck,
  Activity,
  HeartPulse,
  Truck,
  Layers,
  Settings,
  PlusCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useNotification } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = () => {
  const { user, isAuthenticated, logout, isProvider, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const catRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
      if (catRef.current && !catRef.current.contains(e.target)) {
        setIsCatDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
    setIsNotifOpen(false);
    setIsCatDropdownOpen(false);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/equipment?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const categories = [
    { name: t('categoriesList.mobility-equipment', 'Mobility Equipment'), slug: 'mobility-equipment' },
    { name: t('categoriesList.home-healthcare-equipment', 'Home Healthcare Equipment'), slug: 'home-healthcare-equipment' },
    { name: t('categoriesList.respiratory-equipment', 'Respiratory Equipment'), slug: 'respiratory-equipment' },
    { name: t('categoriesList.monitoring-devices', 'Monitoring Devices'), slug: 'monitoring-devices' },
    { name: t('categoriesList.diagnostic-equipment', 'Diagnostic Equipment'), slug: 'diagnostic-equipment' },
    { name: t('categoriesList.therapy-rehabilitation', 'Therapy & Rehabilitation'), slug: 'therapy-rehabilitation' },
    { name: t('categoriesList.icu-equipment', 'ICU Equipment'), slug: 'icu-equipment' },
    { name: t('categoriesList.surgical-equipment', 'Surgical Equipment'), slug: 'surgical-equipment' },
    { name: t('categoriesList.specialized-equipment', 'Specialized Equipment'), slug: 'specialized-equipment' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      {/* Top Notification Announcement Bar */}
      <div className="bg-gradient-to-r from-medblue-900 via-medblue-700 to-medgreen-700 text-white text-xs py-1.5 px-4 font-medium flex justify-between items-center overflow-hidden">
        <div className="container mx-auto flex justify-between items-center overflow-hidden">
          <div className="flex items-center space-x-2 truncate">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
            <span className="truncate">{t('navbar.sanitizationNotice')}</span>
          </div>
          <div className="hidden lg:flex items-center space-x-6 text-slate-200 shrink-0 ml-4">
            <span>{t('navbar.hotline')} <a href="tel:9652601628" className="hover:underline font-bold text-white">+91 9652601628</a></span>
            <span>Rupee Pricing (₹ INR)</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <img
              src="/logo.png"
              alt="MedRentia Official Logo"
              className="h-10 w-10 rounded-xl object-contain shadow-sm group-hover:scale-105 transition-transform shrink-0"
            />
            <div>
              <div className="flex items-center">
                <span className="text-2xl font-black tracking-tight text-medblue-950">MED</span>
                <span className="text-2xl font-black tracking-tight text-medgreen-600">RENTIA</span>
              </div>
              <span className="block text-[10px] font-semibold text-slate-500 -mt-1 tracking-wider uppercase">
                Medical Equipment Rentals
              </span>
            </div>
          </Link>

          {/* Search Bar (Desktop) */}
          <form onSubmit={handleSearch} className="hidden xl:flex items-center flex-1 max-w-xs mx-4">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('navbar.searchPlaceholder')}
                className="w-full pl-10 pr-20 py-2 text-xs bg-slate-100 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-medblue-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <button
                type="submit"
                className="absolute right-1.5 top-1 bottom-1 px-3 bg-medblue-600 hover:bg-medblue-700 text-white rounded-full text-[11px] font-semibold shadow-sm transition-colors"
              >
                {t('navbar.searchBtn')}
              </button>
            </div>
          </form>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-3 xl:space-x-5 text-xs xl:text-sm font-semibold text-slate-700">
            <Link to="/" className="hover:text-medblue-600 transition-colors">
              {t('navbar.home')}
            </Link>
            <Link to="/equipment" className="hover:text-medblue-600 transition-colors">
              {t('navbar.equipment')}
            </Link>

            {/* Categories Dropdown */}
            <div className="relative" ref={catRef}>
              <button
                onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
                className="flex items-center space-x-1 hover:text-medblue-600 transition-colors"
              >
                <span>{t('navbar.categories')}</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {isCatDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      to={`/equipment?category=${cat.slug}`}
                      className="block px-4 py-2 text-xs font-medium text-slate-700 hover:bg-medblue-50 hover:text-medblue-600 transition-colors"
                      onClick={() => setIsCatDropdownOpen(false)}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link to="/how-it-works" className="hover:text-medblue-600 transition-colors">
              {t('navbar.howItWorks')}
            </Link>
            <Link to="/about" className="hover:text-medblue-600 transition-colors">
              {t('navbar.about')}
            </Link>
            <Link to="/contact" className="hover:text-medblue-600 transition-colors">
              {t('navbar.contact')}
            </Link>
          </nav>

          {/* Action Icons & User Controls */}
          <div className="flex items-center space-x-2 md:space-x-3">
            {/* Multilingual Language Switcher (Desktop & Mobile) */}
            <LanguageSwitcher />

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2.5 text-slate-600 hover:text-medblue-600 hover:bg-slate-100 rounded-full transition-colors"
              title={t('navbar.cart')}
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-medorange-500 text-white rounded-full text-[11px] font-bold flex items-center justify-center shadow-md animate-bounce">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Notifications Dropdown (If Logged In) */}
            {isAuthenticated && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="relative p-2.5 text-slate-600 hover:text-medblue-600 hover:bg-slate-100 rounded-full transition-colors"
                  title={t('navbar.notifications')}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white"></span>
                  )}
                </button>

                {isNotifOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50">
                    <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                      <span className="text-sm font-bold text-slate-800">{t('navbar.notifications')}</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-medblue-600 hover:underline font-medium"
                        >
                          {t('navbar.markAllAsRead')}
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                      {notifications.length > 0 ? (
                        notifications.slice(0, 5).map((notif) => (
                          <div
                            key={notif._id}
                            onClick={() => markAsRead(notif._id)}
                            className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition-colors ${
                              !notif.isRead ? 'bg-medblue-50/50' : ''
                            }`}
                          >
                            <p className="font-semibold text-slate-900">{notif.title}</p>
                            <p className="text-slate-600 mt-0.5">{notif.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {new Date(notif.createdAt).toLocaleDateString('en-IN')}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="p-4 text-center text-xs text-slate-400">{t('navbar.noNotifications')}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Authenticated User Menu or Login/Register */}
            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-slate-100 transition-colors focus:outline-none"
                >
                  <img
                    src={user?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                    alt={user?.name}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-medblue-500"
                  />
                  <ChevronDown className="w-4 h-4 text-slate-500 hidden sm:block" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                      <p className="text-xs text-slate-500 capitalize">{user?.role} Account</p>
                    </div>

                    {isProvider ? (
                      <>
                        <Link
                          to="/provider/dashboard"
                          className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-medblue-50 hover:text-medblue-600"
                        >
                          <Layers className="w-4 h-4 text-medblue-600" />
                          <span>{t('navbar.providerHub')}</span>
                        </Link>
                        <Link
                          to="/provider/equipment"
                          className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-medblue-50 hover:text-medblue-600"
                        >
                          <Activity className="w-4 h-4 text-medgreen-600" />
                          <span>{t('navbar.myEquipment')}</span>
                        </Link>
                        <Link
                          to="/provider/equipment/add"
                          className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-medblue-50 hover:text-medblue-600"
                        >
                          <PlusCircle className="w-4 h-4 text-medorange-500" />
                          <span>{t('navbar.addNewDevice')}</span>
                        </Link>
                      </>
                    ) : isAdmin ? (
                      <Link
                        to="/admin/dashboard"
                        className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-medblue-50 hover:text-medblue-600"
                      >
                        <ShieldCheck className="w-4 h-4 text-medpurple-600" />
                        <span>{t('navbar.adminConsole')}</span>
                      </Link>
                    ) : (
                      <>
                        <Link
                          to="/customer/dashboard"
                          className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-medblue-50 hover:text-medblue-600"
                        >
                          <Layers className="w-4 h-4 text-medblue-600" />
                          <span>{t('navbar.myDashboard')}</span>
                        </Link>
                        <Link
                          to="/customer/rentals"
                          className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-medblue-50 hover:text-medblue-600"
                        >
                          <Activity className="w-4 h-4 text-medgreen-600" />
                          <span>{t('navbar.activeRentals')}</span>
                        </Link>
                        <Link
                          to="/customer/history"
                          className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-medblue-50 hover:text-medblue-600"
                        >
                          <Truck className="w-4 h-4 text-medorange-500" />
                          <span>{t('navbar.rentalHistory')}</span>
                        </Link>
                      </>
                    )}

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          navigate('/');
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t('navbar.signOut')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-medblue-600 transition-colors"
                >
                  {t('navbar.login')}
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline-flex items-center px-4 py-2 bg-gradient-to-r from-medblue-600 to-medgreen-600 hover:from-medblue-700 hover:to-medgreen-700 text-white text-xs sm:text-sm font-semibold rounded-full shadow-md hover:shadow-lg transition-all"
                >
                  {t('navbar.signUp')}
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-slate-800" />}
            </button>
          </div>
        </div>

        {/* Search Bar for Sub-XL screens */}
        <div className="xl:hidden pb-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('navbar.searchPlaceholder')}
              className="w-full pl-10 pr-20 py-2 text-xs bg-slate-100 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-medblue-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 px-3 bg-medblue-600 text-white rounded-full text-xs font-semibold"
            >
              {t('navbar.searchBtn')}
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 px-6 py-4 space-y-3">
          <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">{t('common.language')}:</span>
            <LanguageSwitcher variant="inline" />
          </div>

          <Link to="/" className="block text-sm font-semibold text-slate-700 py-1.5">
            {t('navbar.home')}
          </Link>
          <Link to="/equipment" className="block text-sm font-semibold text-slate-700 py-1.5">
            {t('navbar.browseEquipment')}
          </Link>
          <Link to="/how-it-works" className="block text-sm font-semibold text-slate-700 py-1.5">
            {t('navbar.howItWorks')}
          </Link>
          <Link to="/about" className="block text-sm font-semibold text-slate-700 py-1.5">
            {t('navbar.aboutMedRentia')}
          </Link>
          <Link to="/contact" className="block text-sm font-semibold text-slate-700 py-1.5">
            {t('navbar.contactSupport')}
          </Link>

          {!isAuthenticated && (
            <div className="pt-4 border-t border-slate-100 flex flex-col space-y-2">
              <Link
                to="/login"
                className="w-full text-center py-2.5 text-sm font-semibold border border-medblue-600 text-medblue-600 rounded-xl"
              >
                {t('navbar.signIn')}
              </Link>
              <Link
                to="/register"
                className="w-full text-center py-2.5 text-sm font-semibold bg-medblue-600 text-white rounded-xl shadow-md"
              >
                {t('navbar.createAccount')}
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
