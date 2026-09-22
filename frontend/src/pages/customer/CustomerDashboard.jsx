import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ShoppingBag,
  Truck,
  RotateCcw,
  Download,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Sparkles,
  MapPin,
  User,
  Save,
  Phone,
  Mail,
  Star,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import EmptyState from '../../components/common/EmptyState';
import { handleImageError, getExactMedicalImage } from '../../utils/imageFallback';

const CustomerDashboard = () => {
  const { user, updateProfile } = useAuth();
  const { t } = useLanguage();
  const [rentals, setRentals] = useState([]);
  const [orders, setOrders] = useState([]);
  const [availableEquipment, setAvailableEquipment] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile Form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || 'Rahul Sharma',
    phone: user?.phone || '+91 98450 12345',
    street: user?.address?.street || 'Flat 402, Green Glen Layout, Bellandur',
    city: user?.address?.city || 'Bengaluru',
    state: user?.address?.state || 'Karnataka',
    pincode: user?.address?.pincode || '560103',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  // Modal states for Extension and Return
  const [selectedRental, setSelectedRental] = useState(null);
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [extensionDays, setExtensionDays] = useState(7);
  const [extensionFee, setExtensionFee] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        street: user.address?.street || '',
        city: user.address?.city || 'Bengaluru',
        state: user.address?.state || 'Karnataka',
        pincode: user.address?.pincode || '560001',
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchCustomerData = async () => {
      setLoading(true);
      try {
        const [rentalsRes, ordersRes, equipRes] = await Promise.all([
          api.get('/rentals'),
          api.get('/orders'),
          api.get('/equipment?limit=6'),
        ]);

        if (rentalsRes.data?.success && Array.isArray(rentalsRes.data.data)) {
          setRentals(rentalsRes.data.data);
        }
        if (ordersRes.data?.success && Array.isArray(ordersRes.data.data)) {
          setOrders(ordersRes.data.data);
        }
        if (equipRes.data?.success && Array.isArray(equipRes.data.data)) {
          setAvailableEquipment(equipRes.data.data);
        }
      } catch (err) {
        console.error('Customer dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, []);

  const safeRentals = Array.isArray(rentals) ? rentals : [];
  const safeOrders = Array.isArray(orders) ? orders : [];
  const activeRentals = safeRentals.filter((r) => r && (r.status === 'Active' || r.status === 'Extended'));
  const totalSpent = safeOrders.reduce((acc, o) => acc + (o?.paymentStatus === 'paid' ? (o.totalAmount || 0) : 0), 0);
  const totalDepositHeld = activeRentals.reduce((acc, r) => acc + (r?.depositAmount || 0), 0);

  const handleDownloadInvoice = async (orderId, dbOrderId) => {
    try {
      const response = await api.get(`/orders/${dbOrderId}/receipt`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `MedRentia-Invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert('Unable to download PDF receipt. Please check server connection.');
    }
  };

  const handleOpenExtendModal = (rental) => {
    setSelectedRental(rental);
    const dailyRate = Math.round((rental.rentalFee || 1000) / 7);
    setExtensionFee(dailyRate * 7);
    setIsExtendModalOpen(true);
  };

  const handleConfirmExtension = async () => {
    if (!selectedRental) return;
    setActionLoading(true);
    try {
      const res = await api.put(`/rentals/${selectedRental._id}/extend`, {
        extensionDays: Number(extensionDays),
        extensionPeriod: 'weekly',
        additionalFee: extensionFee,
      });
      if (res.data.success) {
        setRentals((prev) =>
          prev.map((r) => (r._id === selectedRental._id ? res.data.data : r))
        );
        setIsExtendModalOpen(false);
        alert('Rental successfully extended!');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to extend rental.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestReturn = async (rentalId) => {
    if (!window.confirm('Request doorstep pickup and return for this medical equipment?')) return;
    try {
      const res = await api.put(`/rentals/${rentalId}/return`);
      if (res.data.success) {
        setRentals((prev) =>
          prev.map((r) => (r._id === rentalId ? { ...r, status: 'Return Requested' } : r))
        );
        alert('Equipment return requested! Logistics partner will contact you for pickup.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to submit return request.');
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg('');
    try {
      const res = await updateProfile({
        name: profileForm.name,
        phone: profileForm.phone,
        address: {
          street: profileForm.street,
          city: profileForm.city,
          state: profileForm.state,
          pincode: profileForm.pincode,
        },
      });
      if (res.success) {
        setProfileMsg('Delivery address & profile updated successfully!');
      } else {
        setProfileMsg(res.message || 'Failed to update profile.');
      }
    } catch (err) {
      setProfileMsg('Update failed.');
    } finally {
      setProfileSaving(false);
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
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-medblue-900 via-medblue-800 to-navy-900 text-white rounded-3xl p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-xs font-bold text-medblue-200 uppercase tracking-wider">
              {t('customer.patientHub')}
            </span>
            <h1 className="text-3xl font-black mt-1">{t('customer.welcomeBack')} {user?.name}</h1>
            <p className="text-xs text-medblue-100 mt-1">
              {t('customer.subHeader')}
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-3">
            <LanguageSwitcher className="bg-white/10 border-white/20 text-white rounded-2xl" />
            <Link
              to="/equipment"
              className="px-6 py-3 bg-gradient-to-r from-medblue-500 to-medgreen-500 hover:from-medblue-600 hover:to-medgreen-600 text-white rounded-full font-bold text-xs shadow-md transition-all flex items-center space-x-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{t('customer.rentNew')}</span>
            </Link>
          </div>
        </div>

        {/* Stats Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('customer.activeRentals')}</span>
              <div className="w-10 h-10 rounded-xl bg-medblue-50 text-medblue-600 flex items-center justify-center font-bold">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-navy-950">{activeRentals.length}</p>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t('customer.inActiveCare')}</span>
            </span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('customer.totalRentals')}</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-navy-950">{rentals.length}</p>
            <span className="text-[11px] text-slate-500 font-semibold">{t('customer.lifetimeOrders')}</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('customer.totalSpent')}</span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-navy-950">₹{totalSpent.toLocaleString('en-IN')}</p>
            <span className="text-[11px] text-slate-500 font-semibold">{t('customer.processedVia')}</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('customer.heldDeposit')}</span>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-navy-950">₹{totalDepositHeld.toLocaleString('en-IN')}</p>
            <span className="text-[11px] text-emerald-600 font-semibold">{t('customer.refundableNote')}</span>
          </div>
        </div>

        {/* ACTIVE RENTALS SECTION */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-black text-navy-950">{t('customer.activeSectionTitle')}</h2>
              <p className="text-xs text-slate-500">
                {t('customer.activeSectionDesc')}
              </p>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-full text-xs">
              {activeRentals.length} {t('customer.deployedCount')}
            </span>
          </div>

          {activeRentals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeRentals.map((rental) => (
                <div
                  key={rental._id}
                  className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-4 hover:border-medblue-300 transition-all"
                >
                  <div className="flex items-start space-x-4">
                    <img
                      src={rental.equipmentImage}
                      alt={rental.equipmentName}
                      className="w-20 h-20 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 bg-medblue-100 text-medblue-800 rounded-md text-[10px] font-bold">
                        {rental.status}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{rental.equipmentName}</h4>
                      <p className="text-xs text-slate-500">{t('customer.orderHash')}{rental.orderId}</p>
                      <p className="text-[11px] text-slate-600 font-medium">
                        {t('customer.expiresOn')} <strong>{new Date(rental.endDate).toLocaleDateString('en-IN')}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-2 text-xs">
                    <Link
                      to={`/delivery/${rental.orderId}`}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:border-medblue-500 rounded-xl font-bold text-slate-700 shadow-sm flex items-center space-x-1"
                    >
                      <Truck className="w-3.5 h-3.5 text-medblue-600" />
                      <span>{t('customer.trackDelivery')}</span>
                    </Link>

                    <button
                      onClick={() => handleOpenExtendModal(rental)}
                      className="px-3 py-1.5 bg-medblue-50 hover:bg-medblue-100 text-medblue-700 rounded-xl font-bold transition-colors flex items-center space-x-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{t('customer.extendRental')}</span>
                    </button>

                    {rental.status !== 'Return Requested' ? (
                      <button
                        onClick={() => handleRequestReturn(rental._id)}
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl font-bold transition-colors"
                      >
                        {t('customer.requestReturn')}
                      </button>
                    ) : (
                      <span className="px-3 py-1.5 bg-amber-100 text-amber-800 rounded-xl font-bold text-[11px]">
                        {t('customer.pickupScheduled')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              {t('customer.noActiveRentals')}
            </div>
          )}
        </div>

        {/* RECENT ORDERS TABLE */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <h3 className="text-xl font-black text-navy-950">{t('customer.recentOrdersTitle')}</h3>
            <span className="text-xs text-slate-400 font-semibold">{orders.length} {t('customer.totalOrdersCount')}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-800 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5 rounded-l-xl">{t('customer.orderId')}</th>
                  <th className="p-3.5">{t('customer.equipmentCol')}</th>
                  <th className="p-3.5">{t('customer.dateCol')}</th>
                  <th className="p-3.5">{t('customer.amountCol')}</th>
                  <th className="p-3.5">{t('customer.statusCol')}</th>
                  <th className="p-3.5 rounded-r-xl text-right">{t('customer.invoiceCol')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-bold text-medblue-700">#{order.orderId}</td>
                    <td className="p-3.5 font-medium text-slate-900">
                      {order.items?.map((i) => i.name).join(', ') || 'Medical Equipment'}
                    </td>
                    <td className="p-3.5">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="p-3.5 font-black text-slate-900">₹{order.totalAmount?.toLocaleString('en-IN')}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md font-bold text-[10px]">
                        {order.orderStatus || 'Confirmed'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleDownloadInvoice(order.orderId, order._id)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-[11px] inline-flex items-center space-x-1"
                      >
                        <Download className="w-3 h-3 text-medblue-600" />
                        <span>{t('customer.downloadPdf')}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AVAILABLE EQUIPMENT SECTION FOR DIRECT RENTAL */}
        {availableEquipment.length > 0 && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-100 gap-2">
              <div>
                <h3 className="text-xl font-black text-navy-950">Available Medical Equipment for Direct Rental</h3>
                <p className="text-xs text-slate-500">
                  Certified sanitized hospital-grade devices ready for immediate 3-hour doorstep delivery.
                </p>
              </div>
              <Link
                to="/equipment"
                className="text-xs font-bold text-medblue-600 hover:text-medblue-700 flex items-center space-x-1 shrink-0"
              >
                <span>Browse Full Marketplace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableEquipment.map((item) => (
                <div
                  key={item._id}
                  className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200/80 hover:border-medblue-400 hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative h-44 bg-slate-100 overflow-hidden">
                      <img
                        src={item.images?.[0] || getExactMedicalImage(item.name, item.categoryName)}
                        alt={item.name}
                        onError={(e) => handleImageError(e, item.name, item.categoryName)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-0.5 bg-white/95 backdrop-blur-md rounded-full text-[10px] font-bold text-medblue-800 shadow-sm">
                        {item.categoryName}
                      </span>
                      <span className="absolute top-3 right-3 px-2 py-0.5 bg-emerald-500 text-white rounded-full text-[10px] font-bold flex items-center space-x-1 shadow-sm">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{item.rating || 4.9}</span>
                      </span>
                    </div>

                    <div className="p-4 space-y-1.5">
                      <h4 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-medblue-600 transition-colors">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {item.shortDescription}
                      </p>
                      <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500">
                        <span>Deposit: <strong>₹{item.securityDeposit}</strong></span>
                        <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                          <Sparkles className="w-3 h-3" />
                          <span>Sanitized</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between mb-3">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Rental Price</span>
                        <p className="text-base font-black text-navy-950">
                          ₹{item.dailyPrice?.toLocaleString('en-IN')}<span className="text-[10px] font-normal text-slate-500">/day</span>
                        </p>
                      </div>
                      <span className="text-[10px] text-medblue-600 font-bold bg-medblue-50 px-2 py-1 rounded-lg">
                        ₹{item.weeklyPrice?.toLocaleString('en-IN')}/wk
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to={`/equipment/${item._id}`}
                        className="py-2 text-center bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold transition-colors"
                      >
                        Details
                      </Link>
                      <Link
                        to={`/equipment/${item._id}`}
                        className="py-2 text-center bg-medblue-600 hover:bg-medblue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center justify-center space-x-1"
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
        )}

        {/* PROFILE & DELIVERY ADDRESS MANAGEMENT */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <User className="w-5 h-5 text-medblue-600" />
            <h3 className="text-lg font-bold text-navy-950">{t('customer.profileSectionTitle')}</h3>
          </div>

          {profileMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{profileMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">{t('customer.fullName')}</label>
              <input
                type="text"
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">{t('customer.contactPhone')}</label>
              <input
                type="tel"
                required
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900"
              />
            </div>

            <div className="md:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">{t('customer.deliveryStreet')}</label>
              <input
                type="text"
                required
                value={profileForm.street}
                onChange={(e) => setProfileForm({ ...profileForm, street: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">{t('customer.city')}</label>
              <input
                type="text"
                required
                value={profileForm.city}
                onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">{t('customer.pincode')}</label>
              <input
                type="text"
                required
                value={profileForm.pincode}
                onChange={(e) => setProfileForm({ ...profileForm, pincode: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900"
              />
            </div>

            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                disabled={profileSaving}
                className="px-6 py-2.5 bg-medblue-600 hover:bg-medblue-700 text-white rounded-xl font-bold shadow-md transition-all flex items-center space-x-1.5 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{profileSaving ? t('customer.saving') : t('customer.saveProfileChanges')}</span>
              </button>
            </div>
          </form>
        </div>

        {/* DEDICATED 24/7 PATIENT SUPPORT CARD */}
        <div className="bg-gradient-to-r from-medblue-900 to-navy-950 text-white rounded-3xl p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-medgreen-400 uppercase tracking-wider">
              {t('customer.supportCardSubtitle')}
            </span>
            <h3 className="text-2xl font-black">{t('customer.supportCardTitle')}</h3>
            <p className="text-xs text-medblue-200 max-w-xl leading-relaxed">
              {t('customer.supportCardDesc')}
            </p>
            <p className="text-xs text-slate-300 font-semibold pt-1">
              {t('customer.supportLead')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="tel:9652601628"
              className="px-5 py-3 bg-medgreen-600 hover:bg-medgreen-700 text-white rounded-2xl font-bold text-xs shadow-md transition-all flex items-center space-x-2"
            >
              <Phone className="w-4 h-4" />
              <span>{t('customer.callBtn')}</span>
            </a>
            <a
              href="mailto:yelishettygnaneswar@gmail.com"
              className="px-5 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl font-bold text-xs transition-all flex items-center space-x-2"
            >
              <Mail className="w-4 h-4" />
              <span>{t('customer.emailBtn')}</span>
            </a>
          </div>
        </div>

        {/* EXTEND RENTAL MODAL */}
        {isExtendModalOpen && selectedRental && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-100">
              <h3 className="text-lg font-bold text-navy-950">{t('customer.extendModalTitle')}</h3>
              <p className="text-xs text-slate-500">
                {t('customer.extendModalDesc')} <strong>{selectedRental.equipmentName}</strong>.
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{t('customer.additionalDuration')}</label>
                  <select
                    value={extensionDays}
                    onChange={(e) => {
                      const days = Number(e.target.value);
                      setExtensionDays(days);
                      const dailyRate = Math.round((selectedRental.rentalFee || 1000) / 7);
                      setExtensionFee(dailyRate * days);
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  >
                    <option value={7}>{t('customer.plus1Week')}</option>
                    <option value={14}>{t('customer.plus2Weeks')}</option>
                    <option value={30}>{t('customer.plus1Month')}</option>
                  </select>
                </div>

                <div className="p-3 bg-medblue-50 border border-medblue-100 rounded-xl flex justify-between items-center text-xs font-bold text-medblue-950">
                  <span>{t('customer.additionalRentalFee')}</span>
                  <span className="text-lg text-medblue-600">₹{extensionFee.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => setIsExtendModalOpen(false)}
                  className="py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleConfirmExtension}
                  disabled={actionLoading}
                  className="py-2.5 bg-medblue-600 text-white rounded-xl font-bold text-xs shadow-md disabled:opacity-50"
                >
                  {actionLoading ? t('customer.extending') : t('customer.confirmExtension')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
