import React from 'react';

export const EquipmentCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm animate-pulse">
    <div className="h-48 bg-slate-200 w-full"></div>
    <div className="p-5 space-y-3">
      <div className="h-3 bg-slate-200 rounded w-1/3"></div>
      <div className="h-5 bg-slate-200 rounded w-4/5"></div>
      <div className="h-3 bg-slate-200 rounded w-full"></div>
      <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
        <div className="h-6 bg-slate-200 rounded w-1/3"></div>
        <div className="h-8 bg-slate-200 rounded-full w-24"></div>
      </div>
    </div>
  </div>
);

export const DashboardCardSkeleton = () => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm animate-pulse space-y-3">
    <div className="flex justify-between">
      <div className="h-4 bg-slate-200 rounded w-1/3"></div>
      <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
    </div>
    <div className="h-8 bg-slate-200 rounded w-1/2"></div>
    <div className="h-3 bg-slate-200 rounded w-2/3"></div>
  </div>
);
