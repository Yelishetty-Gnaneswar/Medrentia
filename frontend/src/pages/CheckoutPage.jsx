import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  MapPin,
  Phone,
  Lock,
  ArrowRight,
  AlertCircle,
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import RazorpayModal from '../components/common/RazorpayModal';
import { handleImageError, getExactMedicalImage } from '../utils/imageFallback';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, cartSubtotal, cartDeposit, cartDeliveryFee, cartTax, cartGrandTotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  // Address & Checkout Form State
  const [formData, setFormData] = useState({
    street: user?.address?.street || 'Flat 402, Green Glen Layout, Bellandur',
    landmark: user?.address?.landmark || 'Opposite Central Mall',
    city: user?.address?.city || 'Bengaluru',
    state: user?.address?.state || 'Karnataka',
    pincode: user?.address?.pincode || '560103',
    contactPhone: user?.phone || '+91 98450 12345',
    alternativePhone: '+91 99880 11223',
    notes: 'Please sanitize equipment packaging at door and provide demonstration for elderly patient.',
    agreeTerms: true,
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Razorpay Checkout Modal State
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [orderPaymentData, setOrderPaymentData] = useState(null);

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Your rental cart is empty</h2>
        <p className="text-xs text-slate-500 mt-2">Please add medical equipment to proceed with checkout.</p>
        <Link
          to="/equipment"
          className="mt-6 inline-flex items-center space-x-2 px-6 py-2.5 bg-medblue-600 text-white rounded-full text-xs font-bold"
        >
          <span>Browse Equipment</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
      return;
    }

    if (!formData.agreeTerms) {
      setErrorMsg('Please accept the rental agreement & hygiene terms.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const payload = {
        items: cartItems.map((item) => ({
          equipment: item.equipment?._id || item.equipment,
          equipmentName: item.equipmentName,
          rentalDuration: item.rentalDuration,
          durationUnits: item.durationUnits || 1,
          rentalPrice: item.rentalPrice,
          securityDeposit: item.securityDeposit,
          quantity: item.quantity || 1,
          rentalStartDate: item.rentalStartDate,
          rentalEndDate: item.rentalEndDate,
        })),
        deliveryAddress: {
          street: formData.street,
          landmark: formData.landmark,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          contactPhone: formData.contactPhone,
          alternativePhone: formData.alternativePhone,
        },
        notes: formData.notes,
      };

      const res = await api.post('/payments/create-order', payload);
      if (res.data.success) {
        setOrderPaymentData(res.data.data);
        setIsRazorpayOpen(true);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to initialize payment checkout.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentPayload) => {
    try {
      const verifyRes = await api.post('/payments/verify', paymentPayload);
      if (verifyRes.data.success) {
        setIsRazorpayOpen(false);
        clearCart();
        navigate(`/payment-success?orderId=${verifyRes.data.data.order.orderId}&dbOrderId=${verifyRes.data.data.order._id}`);
      }
    } catch (err) {
      console.error('Payment verification failed:', err);
      throw new Error(err.response?.data?.message || 'Payment verification failed');
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="container mx-auto px-4 lg:px-6 space-y-8 max-w-6xl">
        <div>
          <h1 className="text-3xl font-black text-navy-950">Rental Delivery & Payment</h1>
          <p className="text-xs text-slate-500 mt-1">
            Provide patient delivery address and verify your rental schedule.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleProceedToPayment} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Delivery Address & Patient Info */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
                <MapPin className="w-5 h-5 text-medblue-600" />
                <h3 className="text-base font-bold text-slate-900">Doorstep Delivery Address</h3>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">House / Flat / Street Address *</label>
                  <input
                    type="text"
                    name="street"
                    required
                    value={formData.street}
                    onChange={handleChange}
                    placeholder="e.g. Flat 402, Green Glen Layout, Outer Ring Road"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medblue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Landmark</label>
                    <input
                      type="text"
                      name="landmark"
                      value={formData.landmark}
                      onChange={handleChange}
                      placeholder="e.g. Near Apollo Pharmacy"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medblue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Pincode *</label>
                    <input
                      type="text"
                      name="pincode"
                      required
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="e.g. 560103"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medblue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">City *</label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medblue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">State *</label>
                    <input
                      type="text"
                      name="state"
                      required
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medblue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Primary Contact Phone *</label>
                    <input
                      type="tel"
                      name="contactPhone"
                      required
                      value={formData.contactPhone}
                      onChange={handleChange}
                      placeholder="+91 98450 12345"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medblue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Emergency / Caregiver Phone</label>
                    <input
                      type="tel"
                      name="alternativePhone"
                      value={formData.alternativePhone}
                      onChange={handleChange}
                      placeholder="+91 99880 11223"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medblue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="font-semibold text-slate-700 block mb-1">
                    Special Delivery & Patient Handling Notes
                  </label>
                  <textarea
                    name="notes"
                    rows="2"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="e.g. Patient is on 2nd floor, lift available, demo required for folding wheelchair..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medblue-500 focus:outline-none"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Order Summary & Payment Button */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md space-y-4">
              <h3 className="text-base font-bold text-navy-950 pb-3 border-b border-slate-100">
                Order Review ({cartItems.length} items)
              </h3>

              {/* Items Mini List */}
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 pr-1">
                {cartItems.map((item) => (
                  <div key={item._id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2.5">
                      <img
                        src={item.equipmentImage || getExactMedicalImage(item.equipmentName, item.categoryName)}
                        alt={item.equipmentName}
                        onError={(e) => handleImageError(e, item.equipmentName, item.categoryName)}
                        className="w-10 h-10 rounded-lg object-cover border"
                      />
                      <div>
                        <p className="font-bold text-slate-900 line-clamp-1">{item.equipmentName}</p>
                        <span className="text-[10px] text-slate-500 capitalize">
                          {item.rentalDuration} (Qty: {item.quantity})
                        </span>
                      </div>
                    </div>
                    <span className="font-black text-slate-900">
                      ₹{(item.rentalPrice || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Rental Subtotal</span>
                  <span className="font-semibold text-slate-900">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>100% Refundable Security Deposit</span>
                  <span className="font-semibold text-slate-900">₹{cartDeposit.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Express Sanitized Delivery</span>
                  <span className="font-semibold text-slate-900">₹{cartDeliveryFee.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST / Tax (18%)</span>
                  <span className="font-semibold text-slate-900">₹{cartTax.toLocaleString('en-IN')}</span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-sm font-black text-navy-950">
                  <span>Grand Total</span>
                  <span className="text-2xl text-medblue-600">₹{cartGrandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-2">
                <label className="flex items-start space-x-2 cursor-pointer text-[11px] text-slate-600">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    className="mt-0.5 rounded text-medblue-600 focus:ring-medblue-500"
                  />
                  <span>
                    I agree to the <strong>MedRentia Medical Equipment Rental Policy</strong> and understand that the security deposit is refundable upon safe return inspection.
                  </span>
                </label>
              </div>

              {/* Submit / Pay Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-medblue-600 to-medgreen-600 hover:from-medblue-700 hover:to-medgreen-700 text-white rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Initializing Razorpay Checkout...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Proceed to Payment (₹{cartGrandTotal.toLocaleString('en-IN')})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Razorpay Modal */}
        <RazorpayModal
          isOpen={isRazorpayOpen}
          onClose={() => setIsRazorpayOpen(false)}
          orderData={orderPaymentData}
          onSuccess={handlePaymentSuccess}
        />
      </div>
    </div>
  );
};

export default CheckoutPage;
