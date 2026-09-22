import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Star,
  ShieldCheck,
  ShoppingBag,
  ArrowUpDown,
  RotateCcw,
  Sparkles,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { EquipmentCardSkeleton } from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import { handleImageError, getExactMedicalImage } from '../utils/imageFallback';

const MarketplacePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();

  const [equipmentList, setEquipmentList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters state from URL query
  const categoryParam = searchParams.get('category') || 'all';
  const searchParam = searchParams.get('search') || '';
  const durationParam = searchParams.get('duration') || 'daily';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const conditionParam = searchParams.get('condition') || 'all';
  const sortParam = searchParams.get('sort') || 'popular';

  const [searchInput, setSearchInput] = useState(searchParam);
  const [priceRange, setPriceRange] = useState({ min: minPriceParam, max: maxPriceParam });
  const [selectedDuration, setSelectedDuration] = useState(durationParam);

  // Fetch Categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data.success) setCategories(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCats();
  }, []);

  // Fetch Equipment based on searchParams
  useEffect(() => {
    const fetchEquipment = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams(searchParams);
        params.set('page', currentPage);
        params.set('limit', 12);

        const res = await api.get(`/equipment?${params.toString()}`);
        if (res.data.success) {
          setEquipmentList(res.data.data);
          setTotalCount(res.data.total);
          setTotalPages(res.data.totalPages);
        }
      } catch (err) {
        console.error('Fetch equipment error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [searchParams, currentPage]);

  const updateFilters = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilters('search', searchInput);
  };

  const resetFilters = () => {
    setSearchInput('');
    setPriceRange({ min: '', max: '' });
    setSelectedDuration('daily');
    setSearchParams({});
    setCurrentPage(1);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="container mx-auto px-4 lg:px-6 space-y-8">
        {/* Header Breadcrumb & Title */}
        <div className="bg-gradient-to-r from-medblue-900 via-medblue-800 to-navy-900 text-white rounded-3xl p-8 shadow-xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-xs font-bold text-medblue-200 uppercase tracking-wider">
                Healthcare Equipment Catalog
              </span>
              <h1 className="text-3xl font-black tracking-tight mt-1">Medical Equipment Marketplace</h1>
              <p className="text-xs text-medblue-100 mt-1">
                All prices shown in Indian Rupees (₹ INR). Sanitized and certified for clinical safety.
              </p>
            </div>

            {/* Quick Search */}
            <form onSubmit={handleSearchSubmit} className="w-full md:w-80 relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search equipment..."
                className="w-full pl-10 pr-20 py-2.5 bg-white/10 text-white placeholder-medblue-200 border border-white/20 rounded-full text-xs focus:outline-none focus:bg-white focus:text-slate-900 focus:placeholder-slate-400 transition-all"
              />
              <Search className="w-4 h-4 text-medblue-200 absolute left-3.5 top-3" />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-medgreen-600 text-white rounded-full text-xs font-bold"
              >
                Go
              </button>
            </form>
          </div>
        </div>

        {/* Main Layout: Sidebar Filters + Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT SIDEBAR FILTERS */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-2 font-bold text-slate-800 text-sm">
                  <SlidersHorizontal className="w-4 h-4 text-medblue-600" />
                  <span>Filters</span>
                </div>
                <button
                  onClick={resetFilters}
                  className="text-xs text-slate-400 hover:text-rose-600 font-semibold flex items-center space-x-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Rental Duration Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Price Display Duration
                </label>
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl text-xs font-bold text-slate-600">
                  {['daily', 'weekly', 'monthly'].map((dur) => (
                    <button
                      key={dur}
                      onClick={() => {
                        setSelectedDuration(dur);
                        updateFilters('duration', dur);
                      }}
                      className={`py-1.5 rounded-lg capitalize transition-all ${
                        selectedDuration === dur
                          ? 'bg-white text-medblue-600 shadow-sm font-black'
                          : 'hover:text-slate-900'
                      }`}
                    >
                      {dur}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Categories
                </label>
                <div className="space-y-1 max-h-56 overflow-y-auto pr-1 text-xs">
                  <button
                    onClick={() => updateFilters('category', 'all')}
                    className={`w-full text-left px-3 py-2 rounded-xl transition-colors ${
                      categoryParam === 'all'
                        ? 'bg-medblue-50 text-medblue-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() => updateFilters('category', cat.slug)}
                      className={`w-full text-left px-3 py-2 rounded-xl transition-colors flex justify-between items-center ${
                        categoryParam === cat.slug
                          ? 'bg-medblue-50 text-medblue-700 font-bold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                        {cat.itemCount}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Condition */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Condition
                </label>
                <div className="space-y-1 text-xs">
                  {['all', 'Brand New', 'Excellent', 'Certified Refurbished'].map((cond) => (
                    <button
                      key={cond}
                      onClick={() => updateFilters('condition', cond)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors ${
                        conditionParam === cond
                          ? 'bg-medblue-50 text-medblue-700 font-bold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {cond === 'all' ? 'Any Condition' : cond}
                    </button>
                  ))}
                </div>
              </div>

              {/* City Selection */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Location / City
                </label>
                <select
                  value={searchParams.get('city') || 'all'}
                  onChange={(e) => updateFilters('city', e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medblue-500 font-medium text-slate-700"
                >
                  <option value="all">All Locations in India</option>
                  <option value="Bengaluru">Bengaluru, Karnataka</option>
                  <option value="Mumbai">Mumbai, Maharashtra</option>
                  <option value="Delhi">Delhi NCR</option>
                  <option value="Hyderabad">Hyderabad, Telangana</option>
                  <option value="Chennai">Chennai, Tamil Nadu</option>
                </select>
              </div>
            </div>
          </aside>

          {/* RIGHT PRODUCT GRID */}
          <main className="lg:col-span-9 space-y-6">
            {/* Top Bar: Results Count + Sort */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-semibold text-slate-600">
              <div>
                Showing <strong className="text-slate-900">{equipmentList.length}</strong> of{' '}
                <strong className="text-slate-900">{totalCount}</strong> medical devices
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-slate-400">Sort by:</span>
                <select
                  value={sortParam}
                  onChange={(e) => updateFilters('sort', e.target.value)}
                  className="p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medblue-500 font-bold text-slate-800"
                >
                  <option value="popular">Most Popular</option>
                  <option value="price-low">Price: Low to High (₹)</option>
                  <option value="price-high">Price: High to Low (₹)</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Equipment Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <EquipmentCardSkeleton key={i} />
                ))}
              </div>
            ) : equipmentList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {equipmentList.map((item) => {
                  const displayPrice =
                    selectedDuration === 'weekly'
                      ? item.weeklyPrice
                      : selectedDuration === 'monthly'
                      ? item.monthlyPrice
                      : item.dailyPrice;

                  return (
                    <div
                      key={item._id}
                      className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 hover:border-medblue-400 hover:shadow-xl transition-all flex flex-col justify-between group"
                    >
                      <div>
                        {/* Image & Badges */}
                        <div className="relative h-48 bg-slate-50 overflow-hidden">
                          <img
                            src={item.images?.[0] || getExactMedicalImage(item.name, item.image || item.imageUrl)}
                            alt={item.name}
                            onError={(e) => handleImageError(e, item.name)}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[11px] font-bold text-medblue-800 shadow-sm">
                            {item.categoryName}
                          </span>
                          <span className="absolute top-3 right-3 px-2.5 py-1 bg-emerald-500 text-white rounded-full text-[11px] font-bold flex items-center space-x-1 shadow-sm">
                            <Star className="w-3 h-3 fill-current" />
                            <span>{item.rating}</span>
                          </span>
                        </div>

                        {/* Content */}
                        <div className="p-5 space-y-2">
                          <h3 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-medblue-600 transition-colors">
                            {item.name}
                          </h3>
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {item.shortDescription}
                          </p>

                          <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500">
                            <span className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{item.location?.city || 'Bengaluru'}</span>
                            </span>
                            <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{item.hygieneStatus?.split(' ')[0] || 'Sanitized'}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Pricing & Actions */}
                      <div className="p-5 pt-0">
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between mb-3">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                              Rental Price
                            </span>
                            <p className="text-xl font-black text-navy-950">
                              ₹{(displayPrice || 0).toLocaleString('en-IN')}
                              <span className="text-xs font-normal text-slate-500">/{selectedDuration}</span>
                            </p>
                          </div>
                          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                            Deposit: ₹{item.securityDeposit}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <Link
                            to={`/equipment/${item._id}`}
                            className="py-2.5 text-center bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
                          >
                            Details
                          </Link>
                          <button
                            onClick={() => addToCart(item, selectedDuration, 1, 1)}
                            className="py-2.5 text-center bg-medblue-600 hover:bg-medblue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center justify-center space-x-1"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Rent Now</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                title="No medical equipment matches your search"
                description="Try adjusting your filters, selecting a different category, or resetting your search keywords."
                actionText="Reset All Filters"
                onAction={resetFilters}
              />
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 pt-6">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-colors ${
                      currentPage === i + 1
                        ? 'bg-medblue-600 text-white shadow-md'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;
