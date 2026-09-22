import React, { useState } from 'react';
import { ShieldCheck, Lock, CreditCard, Smartphone, Building, Wallet, CheckCircle, AlertCircle, X } from 'lucide-react';

const RazorpayModal = ({ isOpen, onClose, orderData, onSuccess }) => {
  if (!isOpen || !orderData) return null;

  const [activeTab, setActiveTab] = useState('upi'); // 'upi', 'card', 'netbanking'
  const [upiId, setUpiId] = useState('user@okaxis');
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');
  const [selectedBank, setSelectedBank] = useState('HDFC');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    setErrorMsg('');

    try {
      // Simulate Razorpay checkout response delay
      setTimeout(async () => {
        const paymentPayload = {
          razorpayOrderId: orderData.razorpayOrderId,
          razorpayPaymentId: `pay_rzp_${Date.now()}`,
          razorpaySignature: `sig_${Date.now()}_medrentia`,
          dbOrderId: orderData.dbOrderId,
          paymentMethod: activeTab === 'upi' ? 'UPI' : activeTab === 'card' ? 'Card' : 'Net Banking',
        };

        try {
          await onSuccess(paymentPayload);
        } catch (err) {
          setErrorMsg(err.message || 'Payment verification failed');
          setIsProcessing(false);
        }
      }, 1200);
    } catch (err) {
      setErrorMsg('Unexpected payment error');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
        {/* Razorpay Header */}
        <div className="bg-gradient-to-r from-medblue-900 to-medblue-700 text-white p-6 relative">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="absolute top-5 right-5 text-slate-300 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 text-xs font-semibold text-medblue-200 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Razorpay Secure Checkout • Test Mode</span>
          </div>

          <div className="flex justify-between items-end mt-2">
            <div>
              <h3 className="text-xl font-bold text-white">MedRentia Healthcare</h3>
              <p className="text-xs text-medblue-200">Order ID: {orderData.orderId}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-medblue-200 block">Total Payable</span>
              <span className="text-2xl font-black text-white">₹{(orderData.amount || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Payment Tabs */}
        <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-600">
          <button
            onClick={() => setActiveTab('upi')}
            className={`py-3.5 flex items-center justify-center space-x-1.5 transition-colors border-b-2 ${
              activeTab === 'upi'
                ? 'border-medblue-600 text-medblue-600 bg-white font-black'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>UPI / QR</span>
          </button>
          <button
            onClick={() => setActiveTab('card')}
            className={`py-3.5 flex items-center justify-center space-x-1.5 transition-colors border-b-2 ${
              activeTab === 'card'
                ? 'border-medblue-600 text-medblue-600 bg-white font-black'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Cards</span>
          </button>
          <button
            onClick={() => setActiveTab('netbanking')}
            className={`py-3.5 flex items-center justify-center space-x-1.5 transition-colors border-b-2 ${
              activeTab === 'netbanking'
                ? 'border-medblue-600 text-medblue-600 bg-white font-black'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>NetBanking</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'upi' && (
            <div className="space-y-3 text-left">
              <label className="block text-xs font-semibold text-slate-700">Instant UPI VPA / Handle</label>
              <div className="relative">
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. yourname@oksbi"
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medblue-500 focus:outline-none"
                />
                <span className="absolute right-3 top-3 text-xs font-bold text-emerald-600">Verified VPA</span>
              </div>
              <div className="grid grid-cols-4 gap-2 pt-2">
                {['Google Pay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                  <div key={app} className="p-2 border border-slate-200 rounded-xl text-center text-xs font-semibold text-slate-700 hover:border-medblue-500 cursor-pointer bg-slate-50 hover:bg-medblue-50">
                    {app}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'card' && (
            <div className="space-y-3 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medblue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Expiry MM/YY</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medblue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">CVV</label>
                  <input
                    type="password"
                    maxLength="4"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medblue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'netbanking' && (
            <div className="space-y-3 text-left">
              <label className="block text-xs font-semibold text-slate-700">Select Bank</label>
              <div className="grid grid-cols-2 gap-2">
                {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra', 'Punjab National'].map((bank) => (
                  <button
                    key={bank}
                    type="button"
                    onClick={() => setSelectedBank(bank)}
                    className={`p-2.5 text-xs font-semibold rounded-xl border text-left transition-colors ${
                      selectedBank === bank
                        ? 'border-medblue-600 bg-medblue-50 text-medblue-700'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {bank}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Secure Trust note */}
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs flex items-center space-x-2">
            <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>256-bit SSL Encrypted • Refundable security deposit protected under MedRentia Guarantee</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-6 bg-slate-50 border-t border-slate-100">
          <button
            onClick={handleSimulatePayment}
            disabled={isProcessing}
            className="w-full py-3.5 bg-gradient-to-r from-medblue-600 to-medgreen-600 hover:from-medblue-700 hover:to-medgreen-700 text-white rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Verifying with Bank & Razorpay...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Pay ₹{(orderData.amount || 0).toLocaleString('en-IN')} & Confirm Rental</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RazorpayModal;
