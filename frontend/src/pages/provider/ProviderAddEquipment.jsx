import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  PlusCircle,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Upload,
  Layers,
  AlertCircle,
  DollarSign,
  CheckCircle2,
} from 'lucide-react';
import api from '../../services/api';

const ProviderAddEquipment = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [imageInputMode, setImageInputMode] = useState('upload'); // 'upload' or 'url'
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    name: 'Standard Foldable Wheelchair',
    category: '',
    categoryName: 'Mobility Equipment',
    shortDescription: 'Ergonomic lightweight aluminum folding wheelchair for patient mobility and recovery assistance.',
    description: 'High-grade hospital tested wheelchair with cushioned armrests, swing-away footrests, and puncture-proof mag wheels. Thoroughly sanitized before dispatch.',
    dailyPrice: 150,
    weeklyPrice: 750,
    monthlyPrice: 2200,
    sixMonthPrice: 11000,
    yearlyPrice: 19500,
    securityDeposit: 1500,
    deliveryFee: 150,
    quantity: 5,
    condition: 'Excellent',
    city: 'Bengaluru',
    area: 'Indiranagar',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
    featuresText: 'Foldable lightweight frame (11.5 kg), Weight capacity up to 125 kg, Puncture-resistant tires, Dual safety handbrakes',
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Use FileReader for instant local preview/fallback
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        setFormData((prev) => ({ ...prev, imageUrl: reader.result }));
      }
    };
    reader.readAsDataURL(file);

    // Also upload via API if available
    try {
      setUploadingImage(true);
      const data = new FormData();
      data.append('image', file);
      const res = await api.post('/equipment/upload-image', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success && res.data.imageUrl) {
        setFormData((prev) => ({ ...prev, imageUrl: res.data.imageUrl }));
      }
    } catch (err) {
      console.warn('API image upload fallback to Data URI:', err);
    } finally {
      setUploadingImage(false);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data.success && res.data.data.length > 0) {
          setCategories(res.data.data);
          setFormData((prev) => ({
            ...prev,
            category: res.data.data[0]._id,
            categoryName: res.data.data[0].name,
          }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'category') {
      const selectedCat = categories.find((c) => c._id === value);
      setFormData((prev) => ({
        ...prev,
        category: value,
        categoryName: selectedCat ? selectedCat.name : prev.categoryName,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCalculatePrices = (daily) => {
    const d = Number(daily) || 100;
    setFormData((prev) => ({
      ...prev,
      dailyPrice: d,
      weeklyPrice: Math.round(d * 5.5),
      monthlyPrice: Math.round(d * 20),
      sixMonthPrice: Math.round(d * 20 * 5.2),
      yearlyPrice: Math.round(d * 20 * 9.5),
      securityDeposit: Math.max(1000, Math.round(d * 10)),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const features = formData.featuresText
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean);

      const payload = {
        name: formData.name,
        category: formData.category,
        categoryName: formData.categoryName,
        shortDescription: formData.shortDescription,
        description: formData.description,
        images: [formData.imageUrl || 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80'],
        dailyPrice: Number(formData.dailyPrice),
        weeklyPrice: Number(formData.weeklyPrice),
        monthlyPrice: Number(formData.monthlyPrice),
        sixMonthPrice: Number(formData.sixMonthPrice),
        yearlyPrice: Number(formData.yearlyPrice),
        securityDeposit: Number(formData.securityDeposit),
        deliveryFee: Number(formData.deliveryFee),
        quantity: Number(formData.quantity),
        availableQuantity: Number(formData.quantity),
        condition: formData.condition,
        features,
        location: {
          city: formData.city,
          state: 'Karnataka',
          area: formData.area,
          pincode: '560038',
        },
        hygieneStatus: 'Certified Sanitized & Sealed',
      };

      const res = await api.post('/equipment', payload);
      if (res.data.success) {
        alert('Medical equipment successfully published and live in the marketplace!');
        navigate('/provider/equipment');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to list equipment. Please check input values.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="container mx-auto px-4 lg:px-6 max-w-4xl space-y-8">
        <div>
          <h1 className="text-3xl font-black text-navy-950">Add Medical Equipment</h1>
          <p className="text-xs text-slate-500 mt-1">
            List your certified medical device to start receiving verified rental bookings across India.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-md space-y-6 text-xs">
          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-navy-950 pb-2 border-b border-slate-100 uppercase tracking-wider">
              1. Basic Device Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Equipment Name *</label>
                <input
                  type="text"
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Ergonomic Folding Wheelchair"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medblue-500 font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Healthcare Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medblue-500 font-bold text-slate-800"
                >
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Short Description (Summary) *</label>
              <input
                type="text"
                required
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleChange}
                placeholder="Key highlights and purpose in one sentence..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medblue-500 text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Detailed Description & Medical Instructions *</label>
              <textarea
                rows="3"
                required
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Full clinical description, patient suitability, materials, and safety guidelines..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medblue-500 text-slate-900"
              ></textarea>
            </div>
          </div>

          {/* Section 2: Pricing Plans in ₹ (INR) */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-navy-950 uppercase tracking-wider">
                2. Multi-Tier Rental Pricing (₹ INR)
              </h3>
              <span className="text-[11px] text-medblue-600 font-semibold">Prices in Indian Rupees (₹)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Daily Price (₹) *</label>
                <input
                  type="number"
                  required
                  name="dailyPrice"
                  value={formData.dailyPrice}
                  onChange={(e) => handleCalculatePrices(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Weekly Price (₹) *</label>
                <input
                  type="number"
                  required
                  name="weeklyPrice"
                  value={formData.weeklyPrice}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Monthly Price (₹) *</label>
                <input
                  type="number"
                  required
                  name="monthlyPrice"
                  value={formData.monthlyPrice}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">6 Months Price (₹)</label>
                <input
                  type="number"
                  name="sixMonthPrice"
                  value={formData.sixMonthPrice}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Yearly Price (₹)</label>
                <input
                  type="number"
                  name="yearlyPrice"
                  value={formData.yearlyPrice}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Refundable Deposit (₹) *</label>
                <input
                  type="number"
                  required
                  name="securityDeposit"
                  value={formData.securityDeposit}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Inventory & Image */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-navy-950 pb-2 border-b border-slate-100 uppercase tracking-wider">
              3. Inventory Stock, Condition & Image
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Total Quantity in Stock *</label>
                <input
                  type="number"
                  required
                  min="1"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Device Condition *</label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                >
                  <option value="Brand New">Brand New</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Certified Refurbished">Certified Refurbished</option>
                  <option value="Good">Good</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">City Hub Location *</label>
                <input
                  type="text"
                  required
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                />
              </div>
            </div>

            {/* Image Selection with Dual Mode: File Upload or Image URL */}
            <div className="space-y-3">
              <label className="font-bold text-slate-700 block">
                Equipment Image (Upload File or Enter URL) *
              </label>

              <div className="flex space-x-2 border-b border-slate-200 pb-2">
                <button
                  type="button"
                  onClick={() => setImageInputMode('upload')}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                    imageInputMode === 'upload'
                      ? 'bg-medblue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setImageInputMode('url')}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                    imageInputMode === 'url'
                      ? 'bg-medblue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Direct Image URL
                </button>
              </div>

              {imageInputMode === 'upload' ? (
                <div>
                  <label className="border-2 border-dashed border-slate-300 hover:border-medblue-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-medblue-50/30 transition-all text-center">
                    <Upload className="w-8 h-8 text-medblue-600 mb-2" />
                    <span className="font-bold text-slate-800 text-xs">
                      {uploadingImage ? 'Uploading Image...' : 'Click to select image file (PNG, JPG, WebP)'}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1">Up to 5MB medical device photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
              ) : (
                <div>
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-medblue-500 text-xs"
                  />
                </div>
              )}

              {/* Real-time Image Preview */}
              {formData.imageUrl && (
                <div className="flex items-center space-x-4 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <img
                    src={formData.imageUrl}
                    alt="Equipment Preview"
                    className="w-16 h-16 rounded-xl object-cover border border-slate-300 shadow-sm shrink-0 bg-white"
                  />
                  <div className="overflow-hidden">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
                      ✓ Image Verified & Active
                    </span>
                    <p className="text-xs text-slate-700 font-semibold truncate max-w-md">
                      {formData.imageUrl}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      This exact image will appear across Marketplace, Details, Cart & Invoices.
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Key Features (comma-separated)</label>
              <input
                type="text"
                name="featuresText"
                value={formData.featuresText}
                onChange={handleChange}
                placeholder="e.g. Lightweight 11kg, Puncture-resistant tires, Weight limit 130kg"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-medgreen-600 to-medgreen-500 hover:from-medgreen-700 hover:to-medgreen-600 text-white rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Publishing Device...</span>
            ) : (
              <>
                <PlusCircle className="w-5 h-5" />
                <span>Publish Medical Equipment Listing</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProviderAddEquipment;
