import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Truck,
  Clock,
  ShieldCheck,
  MapPin,
  Phone,
  Sparkles,
  ArrowRight,
  Package,
} from 'lucide-react';
import api from '../services/api';

const DeliveryTrackingPage = () => {
  const { orderId } = useParams();
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDelivery = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/delivery/${orderId}`);
        if (res.data.success) {
          setDelivery(res.data.data);
        }
      } catch (err) {
        console.error('Fetch delivery error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDelivery();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medblue-600"></div>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Tracking details not found</h2>
        <p className="text-xs text-slate-500 mt-2">Could not find tracking code for order #{orderId}.</p>
        <Link to="/customer/dashboard" className="mt-4 inline-block text-medblue-600 font-bold underline text-xs">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const stages = [
    'Order Confirmed',
    'Preparing Equipment',
    'Sanitization & Quality Check',
    'Packed',
    'Out for Delivery',
    'Delivered',
    'Returned',
  ];

  const currentStageIndex = stages.indexOf(delivery.currentStatus);

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="container mx-auto px-4 lg:px-6 space-y-8 max-w-4xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-medblue-900 to-navy-900 text-white rounded-3xl p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-xs font-bold text-medblue-200 uppercase tracking-wider">
              MedRentia Express Healthcare Logistics
            </span>
            <h1 className="text-3xl font-black mt-1">Live Delivery & Hygiene Tracker</h1>
            <p className="text-xs text-medblue-100 mt-1">
              Order ID: <strong>#{delivery.orderId}</strong> • Tracking Code:{' '}
              <strong>{delivery.trackingCode}</strong>
            </p>
          </div>

          <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-xs">
            <span className="text-medblue-200 block">Current Status</span>
            <span className="text-base font-bold text-emerald-400">{delivery.currentStatus}</span>
          </div>
        </div>

        {/* 7-Stage Visual Timeline */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-md space-y-8">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-navy-950">7-Stage Medical Delivery Progress</h3>
            <span className="text-xs font-semibold text-slate-500">
              Expected Delivery: {new Date(delivery.estimatedDeliveryTime || Date.now()).toLocaleDateString('en-IN')}
            </span>
          </div>

          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3.5 sm:before:left-4.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
            {delivery.timeline?.map((step, idx) => {
              const isCompleted = step.completed || idx <= currentStageIndex;
              const isCurrent = idx === currentStageIndex;

              return (
                <div key={idx} className="relative flex items-start space-x-4">
                  <div
                    className={`absolute -left-6 sm:-left-8 w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ring-4 ring-white ${
                      isCurrent
                        ? 'bg-medblue-600 text-white animate-pulse'
                        : isCompleted
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4
                        className={`text-sm font-bold ${
                          isCurrent
                            ? 'text-medblue-600'
                            : isCompleted
                            ? 'text-slate-900'
                            : 'text-slate-400'
                        }`}
                      >
                        {step.status}
                      </h4>
                      {step.timestamp && (
                        <span className="text-[10px] text-slate-400">
                          {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 max-w-xl">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Logistics Driver & Sanitization Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Driver details */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
              <Truck className="w-5 h-5 text-medblue-600" />
              <span>Assigned Delivery Executive</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl text-xs space-y-1">
              <p className="font-bold text-slate-800">{delivery.deliveryAgentName}</p>
              <p className="text-slate-500 flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-medblue-600" />
                <span>{delivery.deliveryAgentPhone}</span>
              </p>
            </div>
            <p className="text-[11px] text-slate-400">
              The delivery executive is trained to assist with basic unpacking and safe room placement.
            </p>
          </div>

          {/* Sanitization Certificate Box */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <span>Sanitization & Safety Details</span>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-emerald-800 font-medium">Hygiene Protocol:</span>
                <span className="font-bold text-emerald-950">Hospital-Grade HLD + UV-C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-800 font-medium">Certificate Number:</span>
                <span className="font-mono font-bold text-emerald-950">{delivery.sanitizationCertNumber}</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Equipment is transported in sealed medical barrier sleeves.
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center pt-2">
          <Link
            to="/customer/dashboard"
            className="inline-flex items-center space-x-2 text-xs font-bold text-medblue-600 hover:underline"
          >
            <span>Return to Customer Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DeliveryTrackingPage;
