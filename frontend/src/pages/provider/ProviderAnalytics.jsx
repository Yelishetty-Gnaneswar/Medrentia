import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Activity,
  DollarSign,
  Percent,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api';

const ProviderAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await api.get('/provider/analytics');
        if (res.data.success) {
          setAnalytics(res.data.data);
        }
      } catch (err) {
        console.error('Analytics error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medblue-600"></div>
      </div>
    );
  }

  const monthlyData = analytics?.monthlyData || [];
  const topEquipment = analytics?.topEquipment || [];

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="container mx-auto px-4 lg:px-6 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-navy-950">Rental Revenue & Business Analytics</h1>
            <p className="text-xs text-slate-500 mt-1">
              Analyze seasonal demand, equipment utilization, and monthly settlement revenues in ₹.
            </p>
          </div>

          <Link
            to="/provider/dashboard"
            className="text-xs font-bold text-medblue-600 hover:underline"
          >
            ← Back to Provider Hub
          </Link>
        </div>

        {/* Visual Monthly Revenue Growth Bar representation */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-navy-950">Monthly Rental Revenue Trend (₹ INR)</h3>
              <p className="text-xs text-slate-400">Past 6 months settlement growth</p>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-full text-xs flex items-center space-x-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+28% Month-over-Month</span>
            </span>
          </div>

          <div className="grid grid-cols-6 gap-3 pt-6 items-end h-64">
            {monthlyData.map((m, idx) => {
              const maxRev = 120000;
              const heightPercent = Math.round((m.revenue / maxRev) * 100);

              return (
                <div key={idx} className="flex flex-col items-center space-y-2 h-full justify-end">
                  <span className="text-[11px] font-black text-slate-900">
                    ₹{(m.revenue / 1000).toFixed(0)}k
                  </span>
                  <div className="w-full bg-slate-100 rounded-2xl overflow-hidden h-44 flex items-end p-1">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-gradient-to-t from-medblue-700 to-medgreen-500 rounded-xl transition-all duration-500 hover:opacity-90"
                    ></div>
                  </div>
                  <span className="text-xs font-bold text-slate-600">{m.month}</span>
                  <span className="text-[10px] text-slate-400">{m.rentals} rentals</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Performing Devices Table */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-navy-950">Equipment Performance & ROI</h3>
            <p className="text-xs text-slate-500">Utilization percentages and revenue per medical device</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-800 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Medical Device</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Total Bookings</th>
                  <th className="p-3.5">Utilization</th>
                  <th className="p-3.5">Rating</th>
                  <th className="p-3.5 rounded-r-xl text-right">Total Revenue (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topEquipment.map((eq, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center space-x-3">
                        <img src={eq.image} alt={eq.name} className="w-10 h-10 rounded-xl object-cover border" />
                        <span className="font-bold text-slate-900">{eq.name}</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-medium">{eq.category}</td>
                    <td className="p-3.5 font-bold text-slate-900">{eq.rentals} rentals</td>
                    <td className="p-3.5">
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${Math.min(100, eq.utilization || 75)}%` }}
                            className="bg-medgreen-600 h-full rounded-full"
                          ></div>
                        </div>
                        <span className="font-bold text-slate-800">{eq.utilization || 75}%</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-bold text-amber-500">★ {eq.rating}</td>
                    <td className="p-3.5 text-right font-black text-navy-950 text-sm">
                      ₹{(eq.revenue || 0).toLocaleString('en-IN')}
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

export default ProviderAnalytics;
