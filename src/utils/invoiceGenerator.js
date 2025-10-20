import { jsPDF } from "jspdf";
import "jspdf-autotable";

/**
 * Generate PDF invoice for an order
 * @param {Object} order - Order object containing order details
 * @param {Object} user - User object containing user details
 * @returns {jsPDF} - Generated PDF document
 */
export const generateInvoice = (order, user) => {
  // Create new PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Set font styles
  doc.setFont('helvetica');

  // Add company header
  doc.setFontSize(22);
  doc.setTextColor(16, 185, 129); // Emerald green
  doc.text('HerbTrade', 20, 20);
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Natural Healing Made Simple', 20, 28);
  
  // Add company address
  doc.setFontSize(10);
  doc.text('123 Herbal Street, Ayurveda Nagar', 20, 35);
  doc.text('Kerala, India - 685508', 20, 40);
  doc.text('Phone: +91 9876543210 | Email: info@herbtrade.com', 20, 45);

  // Add invoice title
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('INVOICE', 150, 25);

  // Add invoice details
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Invoice #: ${order._id.slice(-8).toUpperCase()}`, 150, 35);
  doc.text(`Date: ${new Date(order.orderDate || order.createdAt).toLocaleDateString('en-IN')}`, 150, 40);
  doc.text(`Order ID: ${order._id.slice(-8).toUpperCase()}`, 150, 45);

  // Add customer details
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Bill To:', 20, 60);
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(order.shippingAddress?.fullName || user.name, 20, 68);
  doc.text(order.shippingAddress?.address || '', 20, 73);
  doc.text(`${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''}`, 20, 78);
  doc.text(`${order.shippingAddress?.pincode || ''}, ${order.shippingAddress?.country || ''}`, 20, 83);
  doc.text(`Email: ${order.shippingAddress?.email || user.email}`, 20, 88);
  doc.text(`Phone: ${order.shippingAddress?.phone || user.phone || ''}`, 20, 93);

  // Add payment details
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Payment Details:', 120, 60);
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Payment Method: ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}`, 120, 68);
  doc.text(`Payment Status: ${order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}`, 120, 73);

  // Add order items table
  const items = order.items.map(item => [
    item.product?.name || 'Product',
    item.quantity,
    `₹${item.price.toFixed(2)}`,
    `₹${(item.price * item.quantity).toFixed(2)}`
  ]);

  // Calculate totals
  const subtotal = order.totalAmount / 1.18;
  const tax = order.totalAmount - subtotal;

  doc.autoTable({
    startY: 100,
    head: [['Item', 'Quantity', 'Unit Price', 'Total']],
    body: items,
    theme: 'grid',
    headStyles: {
      fillColor: [16, 185, 129],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 30, halign: 'right' }
    }
  });

  // Add totals section
  const finalY = doc.lastAutoTable.finalY || 150;
  
  doc.setFontSize(10);
  doc.text('Subtotal:', 140, finalY + 10);
  doc.text(`₹${subtotal.toFixed(2)}`, 180, finalY + 10);
  
  doc.text('Tax (18%):', 140, finalY + 17);
  doc.text(`₹${tax.toFixed(2)}`, 180, finalY + 17);
  
  doc.setFont(undefined, 'bold');
  doc.text('Total:', 140, finalY + 27);
  doc.text(`₹${order.totalAmount.toFixed(2)}`, 180, finalY + 27);

  // Add footer
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Thank you for your business!', 20, 280);
  doc.text('This is a computer generated invoice', 20, 285);
  
  // Add page number
  doc.text('Page 1 of 1', 180, 285);

  return doc;
};

/**
 * Download invoice as PDF file
 * @param {jsPDF} doc - PDF document
 * @param {string} filename - Filename for the downloaded file
 */
export const downloadInvoice = (doc, filename) => {
  doc.save(filename);
};

export default { generateInvoice, downloadInvoice };