import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate a professional MedRentia PDF receipt
 * @param {object} order - Order object populated with items & customer
 * @param {object} payment - Payment object
 * @returns {Promise<Buffer>} PDF Buffer
 */
export const generateInvoicePDF = (order, payment = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Colors
      const primaryColor = '#0284C7'; // Medical Blue
      const secondaryColor = '#059669'; // Healthcare Green
      const darkColor = '#0F172A';
      const grayColor = '#64748B';
      const lightBg = '#F8FAFC';

      // Header Banner
      doc.rect(0, 0, doc.page.width, 100).fill('#0B3B60');

      const logoPath = path.join(__dirname, '../assets/logo.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 40, 20, { width: 55, height: 55 });
        doc
          .fillColor('#FFFFFF')
          .fontSize(22)
          .font('Helvetica-Bold')
          .text('MEDRENTIA', 105, 26);

        doc
          .fontSize(9)
          .font('Helvetica')
          .fillColor('#93C5FD')
          .text('Medical Equipment. When You Need It.', 105, 52)
          .text('Support: +91 9652601628 | yelishettygnaneswar@gmail.com', 105, 65)
          .text('Hyderabad, Telangana, India', 105, 78);
      } else {
        doc
          .fillColor('#FFFFFF')
          .fontSize(24)
          .font('Helvetica-Bold')
          .text('MEDRENTIA', 40, 30);

        doc
          .fontSize(10)
          .font('Helvetica')
          .fillColor('#93C5FD')
          .text('Medical Equipment. When You Need It.', 40, 58)
          .text('Support: +91 9652601628 | yelishettygnaneswar@gmail.com', 40, 72);
      }

      doc
        .fillColor('#FFFFFF')
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('RENTAL INVOICE', doc.page.width - 200, 35, { align: 'right', width: 160 });

      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#E2E8F0')
        .text(`Invoice #: ${order.orderId}`, doc.page.width - 200, 58, { align: 'right', width: 160 })
        .text(`Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN')}`, doc.page.width - 200, 72, { align: 'right', width: 160 });

      let currentY = 120;

      // Customer & Order Information Box
      doc.rect(40, currentY, doc.page.width - 80, 85).fillAndStroke('#F1F5F9', '#CBD5E1');

      doc
        .fillColor(darkColor)
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('BILLED & DELIVERED TO:', 55, currentY + 12);

      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor(grayColor)
        .text(`Customer Name: ${order.customerName || order.customer?.name || 'Valued Customer'}`, 55, currentY + 28)
        .text(`Phone: ${order.deliveryAddress?.contactPhone || order.customerPhone || 'N/A'}`, 55, currentY + 42)
        .text(`Email: ${order.customerEmail || order.customer?.email || 'N/A'}`, 55, currentY + 56)
        .text(`Address: ${order.deliveryAddress?.street || ''}, ${order.deliveryAddress?.city || ''}, ${order.deliveryAddress?.state || ''} - ${order.deliveryAddress?.pincode || ''}`, 55, currentY + 70);

      // Payment summary on right side
      const rightBoxX = doc.page.width / 2 + 30;
      doc
        .fillColor(darkColor)
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('PAYMENT SUMMARY:', rightBoxX, currentY + 12);

      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor(grayColor)
        .text(`Payment Status: ${order.paymentStatus?.toUpperCase() || 'PAID'}`, rightBoxX, currentY + 28)
        .text(`Payment Method: ${payment.paymentMethod || 'Razorpay Gateway'}`, rightBoxX, currentY + 42)
        .text(`Transaction ID: ${order.razorpayPaymentId || payment.razorpayPaymentId || 'TXN-' + order.orderId}`, rightBoxX, currentY + 56)
        .text(`Rental Status: Active & Inspected`, rightBoxX, currentY + 70);

      currentY += 105;

      // Items Table Header
      doc.rect(40, currentY, doc.page.width - 80, 25).fill(primaryColor);
      doc
        .fillColor('#FFFFFF')
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('EQUIPMENT DESCRIPTION', 50, currentY + 8)
        .text('RENTAL PERIOD', 270, currentY + 8)
        .text('QTY', 370, currentY + 8, { width: 30, align: 'center' })
        .text('SECURITY DEP.', 410, currentY + 8, { width: 65, align: 'right' })
        .text('RENTAL FEE (₹)', 480, currentY + 8, { width: 75, align: 'right' });

      currentY += 25;

      // Items Rows
      let subtotal = 0;
      let totalDeposit = 0;

      order.items?.forEach((item, index) => {
        const rowBg = index % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
        doc.rect(40, currentY, doc.page.width - 80, 32).fill(rowBg);

        const durationText = `${item.rentalDuration?.toUpperCase()} (${new Date(item.rentalStartDate).toLocaleDateString('en-IN')} to ${new Date(item.rentalEndDate).toLocaleDateString('en-IN')})`;

        doc
          .fillColor(darkColor)
          .fontSize(9)
          .font('Helvetica-Bold')
          .text(item.name || item.equipmentName || 'Medical Device', 50, currentY + 6, { width: 210 })
          .font('Helvetica')
          .fontSize(8)
          .fillColor(grayColor)
          .text(`Provider: ${item.providerName || 'Verified Medical Hub'}`, 50, currentY + 18)
          .text(durationText, 270, currentY + 10, { width: 95 })
          .text(String(item.quantity || 1), 370, currentY + 10, { width: 30, align: 'center' })
          .text(`₹${(item.securityDeposit || 0).toLocaleString('en-IN')}`, 410, currentY + 10, { width: 65, align: 'right' })
          .fillColor(darkColor)
          .font('Helvetica-Bold')
          .text(`₹${(item.rentalPrice || 0).toLocaleString('en-IN')}`, 480, currentY + 10, { width: 75, align: 'right' });

        subtotal += item.rentalPrice || 0;
        totalDeposit += (item.securityDeposit || 0) * (item.quantity || 1);
        currentY += 32;
      });

      // Price Breakdown Box
      currentY += 15;
      const summaryX = doc.page.width - 240;

      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor(grayColor)
        .text('Rental Subtotal:', summaryX, currentY)
        .fillColor(darkColor)
        .text(`₹${(order.rentalFee || subtotal).toLocaleString('en-IN')}`, summaryX + 110, currentY, { align: 'right', width: 80 });

      currentY += 16;
      doc
        .fillColor(grayColor)
        .text('Refundable Security Deposit:', summaryX, currentY)
        .fillColor(darkColor)
        .text(`₹${(order.totalDeposit || totalDeposit).toLocaleString('en-IN')}`, summaryX + 110, currentY, { align: 'right', width: 80 });

      currentY += 16;
      doc
        .fillColor(grayColor)
        .text('Doorstep Sanitized Delivery:', summaryX, currentY)
        .fillColor(darkColor)
        .text(`₹${(order.deliveryFee || 0).toLocaleString('en-IN')}`, summaryX + 110, currentY, { align: 'right', width: 80 });

      currentY += 16;
      doc
        .fillColor(grayColor)
        .text('GST / Taxes (18%):', summaryX, currentY)
        .fillColor(darkColor)
        .text(`₹${(order.tax || 0).toLocaleString('en-IN')}`, summaryX + 110, currentY, { align: 'right', width: 80 });

      currentY += 20;
      doc.rect(summaryX - 10, currentY, 205, 26).fill('#E0F2FE');
      doc
        .fillColor(primaryColor)
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('GRAND TOTAL PAID:', summaryX, currentY + 8)
        .text(`₹${(order.totalAmount || 0).toLocaleString('en-IN')}`, summaryX + 105, currentY + 8, { align: 'right', width: 80 });

      // Hygiene & Return Guarantee Box
      currentY += 45;
      doc.rect(40, currentY, doc.page.width - 80, 50).fillAndStroke('#ECFDF5', '#A7F3D0');
      doc
        .fillColor(secondaryColor)
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('✓ 100% SANITIZED & CALIBRATED MEDICAL GRADE EQUIPMENT GUARANTEE', 50, currentY + 8);
      doc
        .fillColor('#065F46')
        .fontSize(8)
        .font('Helvetica')
        .text('All equipment has undergone high-level hospital disinfection and digital sensor accuracy checks prior to dispatch. Security deposit will be refunded within 24-48 business hours upon safe return inspection.', 50, currentY + 22, { width: doc.page.width - 100 });

      // Footer
      const footerY = doc.page.height - 50;
      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor(grayColor)
        .text('MedRentia Healthcare Technologies Pvt Ltd | Hyderabad, Telangana, India | yelishettygnaneswar@gmail.com | +91 9652601628', 40, footerY, { align: 'center', width: doc.page.width - 80 })
        .text('This is a computer-generated tax invoice and requires no physical signature.', 40, footerY + 12, { align: 'center', width: doc.page.width - 80 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
