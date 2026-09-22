import Razorpay from 'razorpay';
import crypto from 'crypto';

let razorpayInstance = null;

try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && !process.env.RAZORPAY_KEY_ID.includes('test_medrentia123')) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
} catch (err) {
  console.warn('[MedRentia Razorpay] Real instance not initialized, using simulated test mode.');
}

/**
 * Create Razorpay Order
 * @param {number} amount - Amount in INR (₹)
 * @param {string} receipt - Unique receipt string
 * @param {object} notes - Custom metadata
 */
export const createRazorpayOrder = async (amount, receipt, notes = {}) => {
  const amountInPaise = Math.round(amount * 100);

  if (razorpayInstance) {
    try {
      const order = await razorpayInstance.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: receipt,
        notes: notes,
      });
      return {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status,
      };
    } catch (error) {
      console.error('[MedRentia Razorpay Error]:', error);
      throw error;
    }
  }

  // Simulated Test Mode for local development
  const mockOrderId = 'order_med_' + crypto.randomBytes(8).toString('hex');
  return {
    id: mockOrderId,
    amount: amountInPaise,
    currency: 'INR',
    receipt: receipt,
    status: 'created',
    notes: notes,
    isMock: true,
  };
};

/**
 * Verify Razorpay Payment Signature
 * @param {string} orderId 
 * @param {string} paymentId 
 * @param {string} signature 
 */
export const verifyRazorpaySignature = (orderId, paymentId, signature) => {
  // If simulated mock order
  if (orderId && orderId.startsWith('order_med_')) {
    return true;
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return true;

  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
};
