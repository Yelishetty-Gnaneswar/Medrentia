import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  PlusCircle,
  TrendingUp,
  Activity,
  ShoppingBag,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  DollarSign,
  PackageCheck,
  Percent,
  Truck,
  Sparkles,
  X,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';

const ProviderDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Delivery Progression Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deliveryData, setDeliveryData] = useState(null);
  const [selectedStage, setSelectedStage] = useState('');
  const [stageNotes, setStageNotes] = useState('');
  const [updatingStage, setUpdatingStage] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProviderSummary = async () => {
    setLoading(true);
    try {
      const res = await api.get('/provider/dashboard');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Provider dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviderSummary();
  }, []);

  const handleOpenDeliveryModal = async (order) => {
    setSelectedOrder(order);
    try {
      const res = await api.get(`/orders/${order._id}/delivery`);
      if (res.data.success) {
        setDeliveryData(res.data.data);
        setSelectedStage(res.data.data.currentStage || 'Order Confirmed');
        setIsModalOpen(true);
      }
    } catch (err) {
      console.error(err);
      alert('Could not fetch delivery details.');
    }
  };

  const handleUpdateDeliveryStage = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setUpdatingStage(true);
    try {
      const res = await api.put(`/orders/${selectedOrder._id}/delivery`, {
        stage: selectedStage,
        notes: stageNotes,
      });
      if (res.data.success) {
        alert('Delivery stage successfully advanced!');
        setIsModalOpen(false);
        fetchProviderSummary();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update delivery stage.');
    } finally {
      setUpdatingStage(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medblue-600"></div>
      </div>
    );
  }

  const deliveryStages = [
    'Order Confirmed',
    'Preparing Equipment',
    'Sanitization & Quality Check',
    'Packed',
    'Out for Delivery',
    'Delivered',
    'Returned',
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="container mx-auto px-4 lg:px-6 space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-medblue-900 via-navy-900 to-navy-950 text-white rounded-3xl p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-xs font-bold text-medgreen-400 uppercase tracking-wider">
              {t('provider.hubTitle')}
            </span>
            <h1 className="text-3xl font-black mt-1">
              {user?.companyName || user?.name}
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              {t('provider.subHeader')}
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-3">
            <LanguageSwitcher className="bg-white/10 border-white/20 text-white rounded-2xl" />
            <Link
              to="/provider/analytics"
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-full font-bold text-xs transition-colors flex items-center space-x-1.5"
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>{t('provider.analyticsTitle')}</span>
            </Link>
            <Link
              to="/provider/equipment/add"
              className="px-6 py-2.5 bg-gradient-to-r from-medgreen-600 to-medgreen-500 hover:from-medgreen-700 hover:to-medgreen-600 text-white rounded-full font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('provider.addNewEquipment')}</span>
            </Link>
          </div>
        </div>

        {/* Top 4 Business KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Revenue (₹)</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <span className="text-lg font-black">₹</span>
              </div>
            </div>
            <p className="text-3xl font-black text-navy-950">
              ₹{(stats?.totalRevenue || 0).toLocaleString('en-IN')}
            </p>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center space-x-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>100% verified settlements</span>
            </span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Rentals</span>
              <div className="w-10 h-10 rounded-xl bg-medblue-50 text-medblue-600 flex items-center justify-center font-bold">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-navy-950">{stats?.activeRentals || 0}</p>
            <span className="text-[11px] text-slate-500 font-semibold">Currently deployed to patients</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Inventory Utilization</span>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Percent className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-navy-950">{stats?.utilizationRate || 0}%</p>
            <span className="text-[11px] text-purple-600 font-semibold">Occupancy efficiency</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Listings</span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-navy-950">{stats?.totalEquipment || 0}</p>
            <span className="text-[11px] text-slate-500 font-semibold">Active in marketplace</span>
          </div>
        </div>

        {/* Inventory Status Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">
              Available for Rent
            </span>
            <p className="text-2xl font-black text-slate-900">{stats?.availableEquipment || 0} units</p>
            <p className="text-xs text-slate-500">Ready in sanitized storage for immediate dispatch.</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
            <span className="text-xs font-bold text-medblue-600 uppercase tracking-wider block">
              Currently Rented
            </span>
            <p className="text-2xl font-black text-slate-900">{stats?.rentedEquipment || 0} units</p>
            <p className="text-xs text-slate-500">Generating active recurring rental cashflow.</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">
              Maintenance & Inspection
            </span>
            <p className="text-2xl font-black text-slate-900">{stats?.maintenanceEquipment || 0} units</p>
            <p className="text-xs text-slate-500">Undergoing hospital decontamination & sensor calibration.</p>
          </div>
        </div>

        {/* Recent Customer Rental Orders */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-xl font-black text-navy-950">Recent Customer Rental Orders</h3>
              <p className="text-xs text-slate-500">Patient bookings, logistics tracking, and delivery stage updates</p>
            </div>
            <Link
              to="/provider/equipment"
              className="text-xs font-bold text-medblue-600 hover:underline flex items-center space-x-1"
            >
              <span>Manage Equipment Listings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-800 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Order ID</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Phone</th>
                  <th className="p-3.5">City</th>
                  <th className="p-3.5">Total (₹)</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats?.recentOrders?.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-bold text-medblue-700">#{order.orderId}</td>
                    <td className="p-3.5 font-bold text-slate-900">{order.customer?.name || 'Customer'}</td>
                    <td className="p-3.5">{order.deliveryAddress?.contactPhone || 'N/A'}</td>
                    <td className="p-3.5">{order.deliveryAddress?.city || 'Bengaluru'}</td>
                    <td className="p-3.5 font-black text-slate-900">₹{order.totalAmount?.toLocaleString('en-IN')}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md font-bold text-[10px]">
                        {order.orderStatus || 'Confirmed'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleOpenDeliveryModal(order)}
                        className="px-3 py-1 bg-medblue-50 text-medblue-700 hover:bg-medblue-100 rounded-lg font-bold text-[11px]"
                      >
                        Update Stage
                      </button>
                      <Link
                        to={`/delivery/${order.orderId}`}
                        className="px-3 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg font-bold text-[11px]"
                      >
                        View Timeline
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* DELIVERY PROGRESSION MODAL */}
        {isModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-100">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2 font-bold text-sm text-navy-950">
                  <Truck className="w-4 h-4 text-medblue-600" />
                  <span>Update Delivery Stage: #{selectedOrder.orderId}</span>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUpdateDeliveryStage} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Select Delivery Milestone *</label>
                  <select
                    value={selectedStage}
                    onChange={(e) => setSelectedStage(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-medblue-500"
                  >
                    {deliveryStages.map((stage) => (
                      <option key={stage} value={stage}>
                        {stage}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status Notes / Sterilization Log</label>
                  <textarea
                    rows="2"
                    value={stageNotes}
                    onChange={(e) => setStageNotes(e.target.value)}
                    placeholder="e.g. Autoclaved and sealed. Handed over to logistics courier."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medblue-500"
                  ></textarea>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-[11px]">
                  <span>Customer will receive an instant in-app notification upon updating this status.</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingStage}
                    className="py-2.5 bg-medblue-600 text-white rounded-xl font-bold text-xs shadow-md disabled:opacity-50"
                  >
                    {updatingStage ? 'Updating...' : 'Save & Broadcast'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderDashboard;
