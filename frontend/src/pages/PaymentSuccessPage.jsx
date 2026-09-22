import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  FileText,
  Truck,
  Layers,
  ArrowRight,
  ShieldCheck,
  Download,
  Calendar,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') || 'MED-784920';
  const dbOrderId = searchParams.get('dbOrderId');

  useEffect(() => {
    // Launch celebratory confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  const handleDownloadInvoice = async () => {
    if (!dbOrderId) {
      alert('Invoice download initialized for order ' + orderId);
      return;
    }
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
      console.error('Invoice download error:', err);
      alert('Unable to download invoice at this moment. You can also download it anytime from your dashboard.');
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-16 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xl text-center space-y-6">
          {/* Success Check Badge */}
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md animate-in zoom-in-50 duration-300">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider">
              Payment Verified & Captured (Razorpay Test Mode)
            </span>
            <h1 className="text-3xl font-black text-navy-950">Rental Order Confirmed!</h1>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Your medical equipment order <strong>#{orderId}</strong> has been placed. Our biomedical team is initiating the sterilization & dispatch protocol.
            </p>
          </div>

          {/* Delivery & Hygiene Notice */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-left text-xs space-y-2">
            <div className="flex items-center space-x-2 text-emerald-700 font-bold">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Next Steps: Sterilization & Express Dispatch</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Your equipment is being autoclaved and tested by biomedical engineers. Our delivery logistics partner will contact you shortly to coordinate doorstep setup and demo.
            </p>
          </div>

          {/* Action Buttons Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleDownloadInvoice}
              className="py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-bold text-xs shadow-sm transition-all flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4 text-medblue-600" />
              <span>Download PDF Invoice</span>
            </button>

            <Link
              to={`/delivery/${orderId}`}
              className="py-3.5 px-4 bg-medblue-600 hover:bg-medblue-700 text-white rounded-2xl font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              <Truck className="w-4 h-4" />
              <span>Track Live Delivery</span>
            </Link>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row justify-center items-center gap-4 text-xs font-bold text-slate-600">
            <Link to="/customer/dashboard" className="hover:text-medblue-600 flex items-center space-x-1">
              <Layers className="w-4 h-4" />
              <span>Go to Customer Dashboard</span>
            </Link>
            <span className="hidden sm:inline text-slate-300">•</span>
            <Link to="/equipment" className="hover:text-medblue-600 flex items-center space-x-1">
              <span>Rent More Equipment (₹)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
