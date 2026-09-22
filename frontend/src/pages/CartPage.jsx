import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import EmptyState from '../components/common/EmptyState';
import { handleImageError, getExactMedicalImage } from '../utils/imageFallback';

const CartPage = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    cartSubtotal,
    cartDeposit,
    cartDeliveryFee,
    cartTax,
    cartGrandTotal,
    updateCartItem,
    removeFromCart,
    clearCart,
  } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your rental cart is empty"
          description="Browse our catalog of certified wheelchairs, hospital beds, oxygen concentrators, and medical devices."
          actionText="Browse Medical Equipment"
          actionLink="/equipment"
        />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="container mx-auto px-4 lg:px-6 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-navy-950">Medical Equipment Rental Cart</h1>
            <p className="text-xs text-slate-500 mt-1">
              Review rental durations and transparent pricing before checkout.
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center space-x-1"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Cart</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {cartItems.map((item) => {
              const eq = item.equipment || {};
              return (
                <div
                  key={item._id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between"
                >
                  {/* Left: Image & Info */}
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.equipmentImage || eq.images?.[0] || getExactMedicalImage(item.equipmentName || eq.name, item.categoryName || eq.categoryName)}
                      alt={item.equipmentName || eq.name}
                      onError={(e) => handleImageError(e, item.equipmentName || eq.name, item.categoryName || eq.categoryName)}
                      className="w-24 h-24 rounded-2xl object-cover border border-slate-100 shrink-0"
                    />
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 bg-medblue-50 text-medblue-700 rounded-md text-[10px] font-bold uppercase tracking-wider">
                        {item.categoryName || eq.categoryName}
                      </span>
                      <h3 className="text-base font-bold text-slate-900">
                        {item.equipmentName || eq.name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Provider: <strong>{item.providerName || eq.providerName || 'Verified Medical Hub'}</strong>
                      </p>
                      <div className="text-[11px] text-emerald-600 font-semibold flex items-center space-x-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Certified Sanitized & Sealed</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Duration Switcher */}
                  <div className="space-y-2 w-full sm:w-auto">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Rental Duration
                    </label>
                    <select
                      value={item.rentalDuration}
                      onChange={(e) => updateCartItem(item._id, e.target.value, item.durationUnits, item.quantity)}
                      className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-medblue-500"
                    >
                      <option value="daily">Daily Rental</option>
                      <option value="weekly">Weekly Rental (Recommended)</option>
                      <option value="monthly">Monthly Rental</option>
                      <option value="sixMonth">6 Months Rental</option>
                      <option value="yearly">Yearly Rental</option>
                    </select>

                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-slate-500 font-medium">Qty:</span>
                      <button
                        onClick={() => updateCartItem(item._id, item.rentalDuration, item.durationUnits, Math.max(1, item.quantity - 1))}
                        className="w-6 h-6 rounded-lg bg-slate-100 font-bold hover:bg-slate-200 text-slate-700"
                      >
                        -
                      </button>
                      <span className="font-bold text-slate-900">{item.quantity}</span>
                      <button
                        onClick={() => updateCartItem(item._id, item.rentalDuration, item.durationUnits, item.quantity + 1)}
                        className="w-6 h-6 rounded-lg bg-slate-100 font-bold hover:bg-slate-200 text-slate-700"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Right: Pricing & Remove */}
                  <div className="text-right sm:text-right w-full sm:w-auto flex sm:flex-col justify-between sm:justify-center items-end">
                    <div>
                      <span className="text-lg font-black text-navy-950 block">
                        ₹{(item.rentalPrice || 0).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        +₹{item.securityDeposit} deposit
                      </span>
                    </div>

                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors mt-2"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Summary Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md space-y-4">
              <h3 className="text-lg font-bold text-navy-950 pb-3 border-b border-slate-100">
                Rental Order Summary
              </h3>

              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Rental Subtotal</span>
                  <span className="font-semibold text-slate-900">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center space-x-1">
                    <span>Refundable Deposit</span>
                    <span className="text-[10px] text-emerald-600 font-bold">(100% Refundable)</span>
                  </span>
                  <span className="font-semibold text-slate-900">₹{cartDeposit.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sanitized Express Delivery</span>
                  <span className="font-semibold text-slate-900">₹{cartDeliveryFee.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST / Tax (18%)</span>
                  <span className="font-semibold text-slate-900">₹{cartTax.toLocaleString('en-IN')}</span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-sm font-black text-navy-950">
                  <span>Total Amount</span>
                  <span className="text-2xl text-medblue-600">₹{cartGrandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-xs text-emerald-800 space-y-1">
                <div className="flex items-center space-x-1.5 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>MedRentia Guarantee</span>
                </div>
                <p className="text-[11px] text-emerald-700">
                  Deposit is safely held in escrow and returned within 24-48h of return inspection.
                </p>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-3.5 bg-gradient-to-r from-medblue-600 to-medgreen-600 hover:from-medblue-700 hover:to-medgreen-700 text-white rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                to="/equipment"
                className="block text-center text-xs font-bold text-medblue-600 hover:underline pt-1"
              >
                ← Continue Browsing Equipment
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
