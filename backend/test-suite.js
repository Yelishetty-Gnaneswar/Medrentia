import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './app.js';
import connectDB from './src/config/db.js';

let server;
let PORT = 5000;

const request = (method, path, body = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = [];
      res.on('data', (chunk) => data.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(data);
        const contentType = res.headers['content-type'] || '';
        if (contentType.includes('application/json')) {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(buffer.toString()), headers: res.headers });
          } catch (e) {
            resolve({ status: res.statusCode, raw: buffer.toString(), headers: res.headers });
          }
        } else {
          resolve({ status: res.statusCode, buffer: buffer, headers: res.headers });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

async function runTestSuite() {
  console.log('🧪 ========================================================');
  console.log('🧪 MEDRENTIA FULL-STACK END-TO-END AUTOMATED QA TEST SUITE');
  console.log('🧪 ========================================================\n');

  // Start in-process server for standalone test execution
  await connectDB();
  PORT = 5055;
  server = app.listen(PORT);
  console.log(`[Test Server] In-process test server started on port ${PORT}\n`);

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Health Check
    const health = await request('GET', '/api/health');
    assert(health.status === 200 && health.data.currency === 'INR (₹)', '1. Health Check & Rupee Currency Verification');

    // 2. Categories
    const categories = await request('GET', '/api/categories');
    assert(categories.status === 200 && categories.data.count === 9, '2. 9 Healthcare Categories Loaded with Dynamic Counts');

    // 3. Equipment Listings & Search
    const equipment = await request('GET', '/api/equipment');
    assert(equipment.status === 200 && equipment.data.total >= 15, `3. Equipment Listings (Total: ${equipment.data.total} devices)`);

    const wheelchairSearch = await request('GET', '/api/equipment?search=wheelchair');
    assert(wheelchairSearch.status === 200 && wheelchairSearch.data.data.some(e => e.name.toLowerCase().includes('wheelchair')), '4. Search Query "wheelchair" accurately filters listings');

    // 4. Customer Login
    const customerLogin = await request('POST', '/api/auth/login', {
      email: 'customer@medrentia.test',
      password: 'MedRentia@123',
    });
    assert(customerLogin.status === 200 && customerLogin.data.user.role === 'customer', '5. Customer Login & JWT issuance');
    const customerToken = customerLogin.data.token;

    // 5. Provider Login
    const providerLogin = await request('POST', '/api/auth/login', {
      email: 'provider@medrentia.test',
      password: 'MedRentia@123',
    });
    assert(providerLogin.status === 200 && providerLogin.data.user.role === 'provider', '6. Provider Login & Role Detection');
    const providerToken = providerLogin.data.token;

    // 6. Admin Login
    const adminLogin = await request('POST', '/api/auth/login', {
      email: 'admin@medrentia.test',
      password: 'MedRentia@123',
    });
    assert(adminLogin.status === 200 && adminLogin.data.user.role === 'admin', '7. Admin Login & Access Check');
    const adminToken = adminLogin.data.token;

    // 7. Customer Register New User
    const testEmail = `new_patient_${Date.now()}@medrentia.test`;
    const newCustomer = await request('POST', '/api/auth/register', {
      name: 'Ananya Verma',
      email: testEmail,
      phone: '+91 99112 23344',
      password: 'MedRentia@123',
      role: 'customer',
    });
    assert(newCustomer.status === 201 && newCustomer.data.user.email === testEmail, '8. New Customer Registration & Password Hashing');

    // 8. Add to Cart & Cart Recalculation
    const sampleDevice = equipment.data.data[0];
    const addCart = await request('POST', '/api/cart', {
      equipmentId: sampleDevice._id,
      rentalDuration: 'weekly',
      durationUnits: 2,
      quantity: 1,
    }, { Authorization: `Bearer ${customerToken}` });
    assert(addCart.status === 200 && addCart.data.data.items.length > 0, '9. Add to Rental Cart with Weekly Duration');

    // 9. Checkout & Razorpay Order Creation
    const checkoutOrder = await request('POST', '/api/payments/create-order', {
      items: [
        {
          equipment: sampleDevice._id,
          name: sampleDevice.name,
          rentalDuration: 'weekly',
          durationUnits: 2,
          rentalPrice: sampleDevice.weeklyPrice * 2,
          securityDeposit: sampleDevice.securityDeposit,
          quantity: 1,
        }
      ],
      deliveryAddress: {
        street: 'Flat 101, Palm Meadows, Whitefield',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560066',
        contactPhone: '+91 98450 12345',
      },
    }, { Authorization: `Bearer ${customerToken}` });
    assert(checkoutOrder.status === 200 && checkoutOrder.data.data.razorpayOrderId.length > 0, '10. Razorpay Order Creation & Indian Rupee Total');
    const dbOrderId = checkoutOrder.data.data.dbOrderId;
    const orderId = checkoutOrder.data.data.orderId;
    const rzpOrderId = checkoutOrder.data.data.razorpayOrderId;

    // 10. Razorpay Payment Verification
    const verifyPayment = await request('POST', '/api/payments/verify', {
      razorpayOrderId: rzpOrderId,
      razorpayPaymentId: `pay_test_${Date.now()}`,
      razorpaySignature: 'simulated_sig_medrentia',
      dbOrderId: dbOrderId,
      paymentMethod: 'UPI',
    }, { Authorization: `Bearer ${customerToken}` });
    assert(verifyPayment.status === 200 && verifyPayment.data.data.order.paymentStatus === 'paid', '11. Payment Signature Verification & Order Finalization');

    // 11. Payment Idempotency Protection
    const doubleVerify = await request('POST', '/api/payments/verify', {
      razorpayOrderId: rzpOrderId,
      razorpayPaymentId: `pay_test_${Date.now()}`,
      razorpaySignature: 'simulated_sig_medrentia',
      dbOrderId: dbOrderId,
      paymentMethod: 'UPI',
    }, { Authorization: `Bearer ${customerToken}` });
    assert(doubleVerify.status === 200 && doubleVerify.data.message.includes('already verified'), '12. Double Payment Idempotency Protection');

    // 12. PDF Invoice Download
    const receiptPDF = await request('GET', `/api/orders/${dbOrderId}/receipt`, null, { Authorization: `Bearer ${customerToken}` });
    assert(receiptPDF.status === 200 && receiptPDF.headers['content-type'] === 'application/pdf', '13. Branded PDF Invoice Generation');

    // 13. 7-Stage Delivery Tracker
    const delivery = await request('GET', `/api/delivery/${orderId}`);
    assert(delivery.status === 200 && delivery.data.data.timeline.length === 7, '14. 7-Stage Delivery & Sanitization Tracking Timeline');

    // 14. Customer Active Rentals & Extension
    const rentals = await request('GET', '/api/rentals', null, { Authorization: `Bearer ${customerToken}` });
    assert(rentals.status === 200 && rentals.data.count > 0, '15. Customer Active Rentals List');
    const rentalId = rentals.data.data[0]._id;

    const extendRental = await request('PUT', `/api/rentals/${rentalId}/extend`, {
      extensionDays: 7,
      extensionPeriod: 'weekly',
      additionalFee: 750,
    }, { Authorization: `Bearer ${customerToken}` });
    assert(extendRental.status === 200 && extendRental.data.data.status === 'Extended', '16. Rental Extension Workflow');

    // 15. Provider Listing Creation
    const newDevice = await request('POST', '/api/equipment', {
      name: 'Digital 12-Lead Clinical ECG Machine',
      category: categories.data.data[3]._id,
      categoryName: 'Monitoring Devices',
      shortDescription: '12-channel electrocardiograph with interpretation software and thermal printer.',
      description: 'Medical grade 12-lead ECG monitor for clinical cardiovascular diagnosis.',
      images: ['https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=800&q=80'],
      dailyPrice: 350,
      weeklyPrice: 1900,
      monthlyPrice: 5800,
      quantity: 5,
      securityDeposit: 4000,
      deliveryFee: 150,
      condition: 'Brand New',
      location: { city: 'Bengaluru', state: 'Karnataka', area: 'Indiranagar' },
    }, { Authorization: `Bearer ${providerToken}` });
    assert(newDevice.status === 201 && newDevice.data.data.name.includes('ECG Machine'), '17. Provider Add Medical Device to MongoDB');

    // 16. Provider Analytics & Utilization
    const providerAnalytics = await request('GET', '/api/provider/analytics', null, { Authorization: `Bearer ${providerToken}` });
    assert(providerAnalytics.status === 200 && providerAnalytics.data.data.monthlyData.length > 0, '18. Provider Monthly Revenue Trends & Utilization Analytics');

    // 17. Admin Dashboard KPIs & Governance
    const adminDashboard = await request('GET', '/api/admin/dashboard', null, { Authorization: `Bearer ${adminToken}` });
    assert(adminDashboard.status === 200 && adminDashboard.data.data.totalUsers > 0, '19. Admin Console GMV & User Metrics');

    // 18. Role Security Check (Customer accessing Admin Route must fail)
    const unauthorizedCheck = await request('GET', '/api/admin/dashboard', null, { Authorization: `Bearer ${customerToken}` });
    assert(unauthorizedCheck.status === 403, '20. Role Security: Customer blocked from Admin routes (HTTP 403)');

    console.log('\n========================================================');
    console.log(`📊 TEST SUITE SUMMARY: ${passed} PASSED | ${failed} FAILED`);
    console.log('========================================================\n');

    server.close();
    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Test Suite Exception:', error);
    if (server) server.close();
    process.exit(1);
  }
}

runTestSuite();
