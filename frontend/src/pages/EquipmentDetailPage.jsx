import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Star,
  ShieldCheck,
  Truck,
  Sparkles,
  Clock,
  CheckCircle2,
  Calendar,
  Building,
  Phone,
  ArrowRight,
  ShoppingBag,
  Heart,
  Share2,
  AlertCircle,
} from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { handleImageError, getExactMedicalImage } from '../utils/imageFallback';

const EquipmentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();

  const [equipment, setEquipment] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  // Rental Duration Choice
  const [rentalDuration, setRentalDuration] = useState('weekly'); // daily, weekly, monthly, sixMonth, yearly
  const [durationUnits, setDurationUnits] = useState(1);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  // Review Form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMsg, setReviewMsg] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const [equipRes, reviewsRes] = await Promise.all([
          api.get(`/equipment/${id}`),
          api.get(`/reviews/${id}`),
        ]);

        if (equipRes.data.success) {
          setEquipment(equipRes.data.data);
        }
        if (reviewsRes.data.success) {
          setReviews(reviewsRes.data.data);
        }
      } catch (err) {
        console.error('Fetch equipment detail error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medblue-600"></div>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Equipment not found</h2>
        <Link to="/equipment" className="mt-4 inline-block text-medblue-600 font-semibold underline">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  // Price calculations in ₹
  const getUnitPrice = () => {
    switch (rentalDuration) {
      case 'daily':
        return equipment.dailyPrice;
      case 'weekly':
        return equipment.weeklyPrice;
      case 'monthly':
        return equipment.monthlyPrice;
      case 'sixMonth':
        return equipment.sixMonthPrice || Math.round(equipment.monthlyPrice * 5.2);
      case 'yearly':
        return equipment.yearlyPrice || Math.round(equipment.monthlyPrice * 9.5);
      default:
        return equipment.weeklyPrice;
    }
  };

  const unitPrice = getUnitPrice();
  const rentalFee = unitPrice * durationUnits;
  const securityDeposit = equipment.securityDeposit || 1000;
  const deliveryFee = equipment.deliveryFee || 150;
  const tax = Math.round(rentalFee * 0.18); // 18% GST
  const grandTotal = Math.round(rentalFee + securityDeposit + deliveryFee + tax);

  const handleAddToCart = () => {
    addToCart(equipment, rentalDuration, durationUnits, 1, startDate);
  };

  const handleRentNow = () => {
    addToCart(equipment, rentalDuration, durationUnits, 1, startDate);
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setReviewSubmitting(true);
    setReviewMsg('');
    try {
      const res = await api.post('/reviews', {
        equipmentId: equipment._id,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      });
      if (res.data.success) {
        setReviewMsg('Thank you! Your verified review has been submitted.');
        setReviews([res.data.data, ...reviews]);
        setReviewTitle('');
        setReviewComment('');
      }
    } catch (err) {
      setReviewMsg(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="container mx-auto px-4 lg:px-6 space-y-10">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
          <Link to="/" className="hover:text-medblue-600">Home</Link>
          <span>/</span>
          <Link to="/equipment" className="hover:text-medblue-600">Equipment</Link>
          <span>/</span>
          <Link to={`/equipment?category=${equipment.category?.slug}`} className="hover:text-medblue-600">
            {equipment.categoryName}
          </Link>
          <span>/</span>
          <span className="text-slate-900 truncate">{equipment.name}</span>
        </div>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* LEFT: Image Gallery */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-md overflow-hidden">
              <div className="relative h-96 w-full rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center">
                <img
                  src={equipment.images?.[selectedImage] || equipment.images?.[0] || getExactMedicalImage(equipment.name)}
                  alt={equipment.name}
                  onError={(e) => handleImageError(e, equipment.name)}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-4 left-4 px-3 py-1 bg-white/95 backdrop-blur-md rounded-full text-xs font-bold text-medblue-800 shadow-sm">
                  {equipment.condition}
                </span>
                <span className="absolute top-4 right-4 px-3 py-1 bg-emerald-500 text-white rounded-full text-xs font-bold flex items-center space-x-1 shadow-sm">
                  <ShieldCheck className="w-4 h-4" />
                  <span>100% Sanitized</span>
                </span>
              </div>
            </div>

            {/* Thumbnail selector */}
            {equipment.images?.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {equipment.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImage === idx ? 'border-medblue-600 ring-2 ring-medblue-200' : 'border-slate-200'
                    }`}
                  >
                    <img
                      src={img}
                      alt="thumb"
                      onError={(e) => handleImageError(e, equipment.name)}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Sterilization & Provider Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center space-x-3 text-emerald-700 bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
                <Sparkles className="w-6 h-6 shrink-0 text-emerald-600" />
                <div className="text-xs">
                  <p className="font-bold text-emerald-950">Hospital-Grade Sterilization Guarantee</p>
                  <p className="text-emerald-800">Last sanitized: {new Date(equipment.lastSanitized).toLocaleDateString('en-IN')}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-medblue-100 text-medblue-700 font-black flex items-center justify-center">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{equipment.providerName || 'MedRentia Verified Hub'}</p>
                    <p className="text-slate-500">{equipment.location?.city || 'Bengaluru'}, {equipment.location?.state || 'Karnataka'}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-medblue-50 text-medblue-700 font-bold rounded-lg border border-medblue-100">
                  Verified Provider
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: Details & Dynamic Rental Selector */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-md space-y-6">
              {/* Title & Rating */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="px-3 py-1 bg-medblue-50 text-medblue-700 rounded-full text-xs font-bold uppercase tracking-wider">
                    {equipment.categoryName}
                  </span>
                  <div className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-current text-emerald-500" />
                    <span>{equipment.rating}</span>
                    <span className="text-slate-400 font-normal">({equipment.reviewCount} verified reviews)</span>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-navy-950 tracking-tight">
                  {equipment.name}
                </h1>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  {equipment.shortDescription}
                </p>
              </div>

              {/* RENTAL DURATION SELECTOR (Dynamic) */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Select Rental Duration & Pricing Plan (₹ INR)
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {[
                    { id: 'daily', label: 'Daily', price: equipment.dailyPrice, unit: '/day' },
                    { id: 'weekly', label: 'Weekly', price: equipment.weeklyPrice, unit: '/week' },
                    { id: 'monthly', label: 'Monthly', price: equipment.monthlyPrice, unit: '/mo' },
                    { id: 'sixMonth', label: '6 Months', price: equipment.sixMonthPrice || Math.round(equipment.monthlyPrice * 5.2), unit: '/6mo' },
                    { id: 'yearly', label: 'Yearly', price: equipment.yearlyPrice || Math.round(equipment.monthlyPrice * 9.5), unit: '/yr' },
                  ].map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => setRentalDuration(plan.id)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        rentalDuration === plan.id
                          ? 'border-medblue-600 bg-medblue-50/80 ring-2 ring-medblue-200'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                      }`}
                    >
                      <span className="text-[11px] font-semibold text-slate-500 block">{plan.label}</span>
                      <p className="text-sm font-black text-slate-900 mt-0.5">
                        ₹{(plan.price || 0).toLocaleString('en-IN')}
                      </p>
                      <span className="text-[10px] text-medblue-600 font-medium">{plan.unit}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration Quantity & Start Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Number of {rentalDuration === 'daily' ? 'Days' : rentalDuration === 'weekly' ? 'Weeks' : 'Periods'}
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setDurationUnits(Math.max(1, durationUnits - 1))}
                      className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700"
                    >
                      -
                    </button>
                    <span className="text-base font-bold text-slate-900 w-8 text-center">{durationUnits}</span>
                    <button
                      onClick={() => setDurationUnits(durationUnits + 1)}
                      className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Rental Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-medblue-500"
                  />
                </div>
              </div>

              {/* TRANSPARENT PRICING BREAKDOWN */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Rental Fee ({durationUnits} × ₹{unitPrice.toLocaleString('en-IN')})</span>
                  <span className="font-semibold text-slate-900">₹{rentalFee.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="flex items-center space-x-1">
                    <span>Refundable Security Deposit</span>
                    <span className="text-[10px] text-emerald-600 font-bold">(100% Refundable)</span>
                  </span>
                  <span className="font-semibold text-slate-900">₹{securityDeposit.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Express Sanitized Doorstep Delivery</span>
                  <span className="font-semibold text-slate-900">₹{deliveryFee.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST / Tax (18%)</span>
                  <span className="font-semibold text-slate-900">₹{tax.toLocaleString('en-IN')}</span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-sm font-black text-navy-950">
                  <span>Grand Total Payable</span>
                  <span className="text-2xl text-medblue-600">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  className="py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-bold text-sm shadow-sm transition-all flex items-center justify-center space-x-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Rental Cart</span>
                </button>
                <button
                  onClick={handleRentNow}
                  className="py-3.5 bg-gradient-to-r from-medblue-600 to-medgreen-600 hover:from-medblue-700 hover:to-medgreen-700 text-white rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
                >
                  <span>Proceed to Rent</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Tabs: Overview, Specifications, Reviews */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-8">
          <div className="space-y-4">
            <h3 className="text-xl font-black text-navy-950">Product Description & Clinical Suitability</h3>
            <p className="text-sm text-slate-700 leading-relaxed font-normal">
              {equipment.description}
            </p>
          </div>

          {/* Key Features */}
          {equipment.features && equipment.features.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h4 className="text-base font-bold text-slate-900">Key Equipment Features</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {equipment.features.map((feat, i) => (
                  <div key={i} className="flex items-start space-x-2 text-xs font-semibold text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technical Specifications */}
          {equipment.specifications && Object.keys(equipment.specifications).length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h4 className="text-base font-bold text-slate-900">Technical Specifications</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {Object.entries(equipment.specifications).map(([key, val], i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between">
                    <span className="text-slate-500 font-medium">{key}:</span>
                    <span className="font-bold text-slate-800">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verified Customer Reviews */}
          <div className="space-y-6 pt-6 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-navy-950">
                Verified Patient & Caregiver Reviews ({reviews.length})
              </h3>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.length > 0 ? (
                reviews.map((rev) => (
                  <div key={rev._id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-slate-900 text-sm">{rev.customerName || 'Verified Renter'}</span>
                        <div className="flex items-center space-x-1 mt-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(rev.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>

                    {rev.title && <h5 className="text-xs font-bold text-slate-800">{rev.title}</h5>}
                    <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No reviews yet for this equipment.</p>
              )}
            </div>

            {/* Leave a review form */}
            <form onSubmit={handleReviewSubmit} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
              <h4 className="text-sm font-bold text-slate-900">Leave a Verified Rental Review</h4>

              {reviewMsg && (
                <div className="p-3 bg-medblue-50 border border-medblue-200 rounded-xl text-xs text-medblue-800 font-semibold">
                  {reviewMsg}
                </div>
              )}

              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-700">Rating:</span>
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  className="p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-amber-500"
                >
                  <option value={5}>★★★★★ (5/5)</option>
                  <option value={4}>★★★★☆ (4/5)</option>
                  <option value={3}>★★★☆☆ (3/5)</option>
                  <option value={2}>★★☆☆☆ (2/5)</option>
                  <option value={1}>★☆☆☆☆ (1/5)</option>
                </select>
              </div>

              <div>
                <input
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="Review Title (e.g. Excellent hospital bed, prompt delivery)"
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-medblue-500"
                />
              </div>

              <div>
                <textarea
                  rows="3"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Describe your rental experience, device hygiene, and support..."
                  required
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-medblue-500"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={reviewSubmitting}
                className="px-6 py-2.5 bg-medblue-600 hover:bg-medblue-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors disabled:opacity-50"
              >
                {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetailPage;
