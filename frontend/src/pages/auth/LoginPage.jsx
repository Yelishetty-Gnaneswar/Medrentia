import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HeartPulse, Lock, Mail, ArrowRight, AlertCircle, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { t } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const redirectPath = new URLSearchParams(location.search).get('redirect') || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      if (redirectPath) {
        navigate(redirectPath);
      } else if (res.user.role === 'provider') {
        navigate('/provider/dashboard');
      } else if (res.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleQuickLogin = (demoEmail, demoRole) => {
    setEmail(demoEmail);
    setPassword('MedRentia@123');
  };

  return (
    <div className="bg-slate-50 min-h-screen py-16 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2.5">
            <img
              src="/logo.png"
              alt="MedRentia Logo"
              className="w-10 h-10 rounded-xl object-contain shadow-md shrink-0"
            />
            <span className="text-2xl font-black text-navy-950">
              MED<span className="text-medgreen-600">RENTIA</span>
            </span>
          </Link>
          <h2 className="text-2xl font-black text-navy-950">{t('auth.loginTitle')}</h2>
          <p className="text-xs text-slate-500">{t('auth.loginSubtitle')}</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl space-y-6">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">{t('auth.email')}</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. customer@medrentia.test"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medblue-500 focus:outline-none text-slate-900"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-slate-700">{t('auth.password')}</label>
                <Link to="/forgot-password" className="text-medblue-600 hover:underline text-[11px] font-semibold">
                  {t('auth.forgotPassword')}
                </Link>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medblue-500 focus:outline-none text-slate-900"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-medblue-600 to-medgreen-600 hover:from-medblue-700 hover:to-medgreen-700 text-white rounded-2xl font-bold text-xs shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <span>{t('auth.loggingIn')}</span>
              ) : (
                <>
                  <span>{t('auth.loginBtn')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Development Quick-Fill Demo Buttons */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">
              One-Click Demo Accounts (Development)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('customer@medrentia.test', 'customer')}
                className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-[10px] font-bold text-slate-700 transition-colors"
              >
                Customer Demo
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('provider@medrentia.test', 'provider')}
                className="py-1.5 px-2 bg-medblue-50 hover:bg-medblue-100 rounded-lg text-[10px] font-bold text-medblue-700 transition-colors"
              >
                Provider Demo
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@medrentia.test', 'admin')}
                className="py-1.5 px-2 bg-purple-50 hover:bg-purple-100 rounded-lg text-[10px] font-bold text-purple-700 transition-colors"
              >
                Admin Demo
              </button>
            </div>
          </div>
        </div>

        {/* Footer link */}
        <p className="text-center text-xs text-slate-500">
          {t('auth.dontHaveAccount')}{' '}
          <Link to="/register" className="font-bold text-medblue-600 hover:underline">
            {t('auth.registerBtn')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
