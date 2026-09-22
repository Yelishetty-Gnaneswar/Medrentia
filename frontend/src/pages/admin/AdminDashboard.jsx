import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Building,
  Layers,
  ShoppingBag,
  TrendingUp,
  UserX,
  UserCheck,
  DollarSign,
} from 'lucide-react';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';

const AdminDashboard = () => {
  const { t } = useLanguage();
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [dashRes, usersRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/users'),
      ]);

      if (dashRes.data.success) setMetrics(dashRes.data.data);
      if (usersRes.data.success) setUsers(usersRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleUser = async (userId) => {
    try {
      const res = await api.put(`/admin/users/${userId}/toggle-status`);
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isActive: res.data.data.isActive } : u))
        );
      }
    } catch (err) {
      console.error(err);
      alert('Failed to toggle user status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medblue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="container mx-auto px-4 lg:px-6 space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-950 via-navy-900 to-medblue-950 text-white rounded-3xl p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
              {t('admin.consoleTitle')}
            </span>
            <h1 className="text-3xl font-black mt-1">{t('admin.welcomeBack')}</h1>
            <p className="text-xs text-slate-300 mt-1">
              {t('admin.subHeader')}
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-3">
            <LanguageSwitcher className="bg-white/10 border-white/20 text-white rounded-2xl" />
            <div className="px-4 py-2 bg-white/10 rounded-2xl border border-white/20 text-xs">
              <span className="text-slate-300 block">{t('admin.platformGMV')}</span>
              <span className="text-xl font-black text-emerald-400">
                ₹{(metrics?.totalRevenue || 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Platform Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registered Patients</span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-navy-950">{metrics?.totalUsers || 0}</p>
            <span className="text-[11px] text-slate-400">Verified customers</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Equipment Providers</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Building className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-navy-950">{metrics?.totalProviders || 0}</p>
            <span className="text-[11px] text-emerald-600 font-semibold">Active supplier hubs</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Equipment</span>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-navy-950">{metrics?.totalEquipment || 0}</p>
            <span className="text-[11px] text-slate-400">Listed across India</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Rental Bookings</span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-navy-950">{metrics?.totalRentals || 0}</p>
            <span className="text-[11px] text-emerald-600 font-semibold">{metrics?.activeRentals || 0} active now</span>
          </div>
        </div>

        {/* User Management Governance Table */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-xl font-black text-navy-950">Platform Users & Providers</h3>
            <p className="text-xs text-slate-500">Manage account authorizations, role allocations, and security statuses</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-800 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5 rounded-l-xl">User / Business</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Phone</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Account Status</th>
                  <th className="p-3.5 rounded-r-xl text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">{u.name} {u.companyName ? `(${u.companyName})` : ''}</td>
                    <td className="p-3.5 font-medium">{u.email}</td>
                    <td className="p-3.5">{u.phone}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded-md font-bold text-[10px] capitalize">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          u.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleToggleUser(u._id)}
                        className={`px-3 py-1 rounded-lg font-bold text-[10px] transition-colors ${
                          u.isActive
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {u.isActive ? 'Suspend User' : 'Activate User'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
