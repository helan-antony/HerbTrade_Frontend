import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FaCheckCircle,
  FaShoppingBag,
  FaMapMarkerAlt,
  FaCreditCard,
  FaCalendarAlt,
  FaTruck,
  FaPhone,
  FaEnvelope,
  FaHome,
  FaLeaf,
  FaPrint,
  FaDownload,
  FaArrowLeft,
  FaSpinner
} from 'react-icons/fa';

// Import invoice generator
import { generateInvoice, downloadInvoice } from '../utils/invoiceGenerator';

// Auth utility functions
const getAuthToken = () => localStorage.getItem('token');
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};
const isAuthenticated = () => !!(getAuthToken() && localStorage.getItem('user'));

function OrderConfirmation() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Helper functions for order summary calculations
  const calculateSubtotal = (totalAmount) => {
    // Since totalAmount = subtotal + (subtotal * 0.18) = subtotal * 1.18
    // Therefore subtotal = totalAmount / 1.18
    return totalAmount / 1.18;
  };

  const calculateTax = (totalAmount) => {
    // Tax = subtotal * 0.18 = (totalAmount / 1.18) * 0.18
    const subtotal = calculateSubtotal(totalAmount);
    return subtotal * 0.18;
  };

  // Verify that subtotal + tax equals total (with small tolerance for floating point errors)
  const verifyCalculations = (totalAmount) => {
    const subtotal = calculateSubtotal(totalAmount);
    const tax = calculateTax(totalAmount);
    const calculatedTotal = subtotal + tax;
    const difference = Math.abs(totalAmount - calculatedTotal);
    
    // Allow for small floating point differences (less than 0.01)
    return difference < 0.01;
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId, navigate]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/orders/${orderId}`, {
        headers: getAuthHeaders()
      });
      
      // Log calculation details for debugging
      const orderData = response.data;
      console.log('Order data:', orderData);
      console.log('Total amount:', orderData.totalAmount);
      const subtotal = calculateSubtotal(orderData.totalAmount);
      const tax = calculateTax(orderData.totalAmount);
      console.log('Calculated subtotal:', subtotal);
      console.log('Calculated tax:', tax);
      console.log('Subtotal + Tax:', subtotal + tax);
      console.log('Verification passed:', verifyCalculations(orderData.totalAmount));
      
      setOrder(orderData);
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Failed to load order details');
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-100',
      confirmed: 'text-blue-600 bg-blue-100',
      processing: 'text-purple-600 bg-purple-100',
      shipped: 'text-indigo-600 bg-indigo-100',
      delivered: 'text-green-600 bg-green-100',
      cancelled: 'text-red-600 bg-red-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadInvoice = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const doc = generateInvoice(order, user);
      const filename = `invoice-${order._id.slice(-8).toUpperCase()}.pdf`;
      downloadInvoice(doc, filename);
      toast.success('Invoice downloaded successfully!');
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error('Failed to generate invoice. Please try again.');
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-6xl text-emerald-600 mx-auto mb-4" />
          <h2 className="text-2xl font-playfair font-bold text-slate-900 mb-2">Loading order details...</h2>
          <p className="text-slate-600">Please wait while we fetch your order information</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaShoppingBag className="text-red-500 text-3xl" />
          </div>
          <h2 className="text-3xl font-playfair font-bold text-slate-900 mb-4">Order Not Found</h2>
          <p className="text-slate-600 mb-8">We couldn't find the order you're looking for.</p>
          <button
            onClick={() => navigate('/herbs')}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-8 pt-24">
      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <FaCheckCircle className="text-white text-4xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-playfair font-bold text-slate-900 mb-4">
            Order Confirmed!
          </h1>
          <p className="text-xl text-slate-600 mb-2">
            Thank you for your order. We've received your request and will process it shortly.
          </p>
          <p className="text-lg text-emerald-600 font-semibold">
            Order ID: #{order._id.slice(-8).toUpperCase()}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <button
            onClick={() => navigate('/herbs')}
            className="group flex items-center text-slate-600 hover:text-emerald-600 transition-all duration-300 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl border border-white/50"
          >
            <FaArrowLeft className="mr-3 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-semibold">Continue Shopping</span>
          </button>
          
          <button
            onClick={handlePrint}
            className="group flex items-center text-emerald-600 hover:text-emerald-700 transition-all duration-300 bg-emerald-50 hover:bg-emerald-100 px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl border border-emerald-200"
          >
            <FaPrint className="mr-3 group-hover:scale-110 transition-transform duration-300" />
            <span className="font-semibold">Print Order</span>
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Status */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-8 border border-white/50">
              <h2 className="text-2xl font-playfair font-bold text-slate-900 mb-6 flex items-center">
                <FaTruck className="mr-3 text-emerald-600" />
                Order Status
              </h2>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <p className="text-slate-600 mt-2">
                    Order placed on {formatDate(order.orderDate || order.createdAt)}
                  </p>
                </div>
                {order.trackingNumber && (
                  <div className="text-right">
                    <p className="text-sm text-slate-600">Tracking Number</p>
                    <p className="font-bold text-slate-900">{order.trackingNumber}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-8 border border-white/50">
              <h2 className="text-2xl font-playfair font-bold text-slate-900 mb-6 flex items-center">
                <FaShoppingBag className="mr-3 text-emerald-600" />
                Order Items
              </h2>
              
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-slate-50 rounded-2xl">
                    <img
                      src={item.product?.image || 'https://via.placeholder.com/80x80/10b981/ffffff?text=Herb'}
                      alt={item.product?.name || 'Product'}
                      className="w-16 h-16 object-cover rounded-xl shadow-md"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/80x80/10b981/ffffff?text=Herb';
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 text-lg">{item.product?.name || 'Product'}</h3>
                      <p className="text-slate-600">
                        Quantity: {item.product?.category === 'Medicines' 
                          ? `${item.quantity} units` 
                          : item.quantity < 1000 
                            ? `${item.quantity}g` 
                            : `${(item.quantity/1000).toFixed(1)}kg`
                        }
                      </p>
                      <p className="text-sm text-slate-500">₹{item.price} per {item.product?.category === 'Medicines' ? 'unit' : 'gram'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-emerald-600">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-8 border border-white/50">
              <h2 className="text-2xl font-playfair font-bold text-slate-900 mb-6 flex items-center">
                <FaMapMarkerAlt className="mr-3 text-emerald-600" />
                Shipping Address
              </h2>
              
              <div className="bg-slate-50 rounded-2xl p-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold text-slate-900 text-lg flex items-center">
                      <FaHome className="mr-2 text-emerald-600" />
                      {order.shippingAddress?.fullName}
                    </p>
                    <p className="text-slate-600 flex items-center mt-2">
                      <FaEnvelope className="mr-2 text-emerald-600" />
                      {order.shippingAddress?.email}
                    </p>
                    <p className="text-slate-600 flex items-center mt-2">
                      <FaPhone className="mr-2 text-emerald-600" />
                      {order.shippingAddress?.phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-900 font-medium">
                      {order.shippingAddress?.address}
                    </p>
                    <p className="text-slate-600">
                      {order.shippingAddress?.city}, {order.shippingAddress?.state}
                    </p>
                    <p className="text-slate-600">
                      {order.shippingAddress?.pincode}, {order.shippingAddress?.country}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-8 border border-white/50">
              <h2 className="text-2xl font-playfair font-bold text-slate-900 mb-6 flex items-center">
                <FaCreditCard className="mr-3 text-emerald-600" />
                Payment Method
              </h2>
              
              <div className="bg-slate-50 rounded-2xl p-6">
                <p className="text-lg font-semibold text-slate-900">
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
                </p>
                <p className="text-slate-600 mt-2">
                  {order.paymentMethod === 'cod' 
                    ? 'You will pay when your order is delivered to your doorstep.'
                    : 'Payment processed successfully.'
                  }
                </p>
              </div>
            </div>

            {/* Order Notes */}
            {order.notes && (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-8 border border-white/50">
                <h2 className="text-2xl font-playfair font-bold text-slate-900 mb-6">
                  Order Notes
                </h2>
                <div className="bg-slate-50 rounded-2xl p-6">
                  <p className="text-slate-700">{order.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 sticky top-8 border border-white/50">
              <h2 className="text-2xl font-playfair font-bold text-slate-900 mb-8 flex items-center">
                <FaLeaf className="mr-3 text-emerald-600" />
                Order Summary
              </h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-600 font-medium">Subtotal ({order.items.length} items)</span>
                  <span className="font-bold text-slate-900">₹{calculateSubtotal(order.totalAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-600 font-medium">Shipping</span>
                  <span className="font-bold text-emerald-600">Free</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-600 font-medium">Tax (18%)</span>
                  <span className="font-bold text-slate-900">₹{calculateTax(order.totalAmount).toFixed(2)}</span>
                </div>
                <hr className="border-slate-200" />
                <div className="flex justify-between items-center text-2xl font-bold py-2">
                  <span className="text-slate-900">Total Paid</span>
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    ₹{order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Estimated Delivery */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
                <div className="flex items-center mb-3">
                  <FaCalendarAlt className="text-emerald-600 mr-3" />
                  <h3 className="font-semibold text-slate-900">Estimated Delivery</h3>
                </div>
                <p className="text-slate-700 font-medium">
                  {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-sm text-slate-600 mt-2">
                  We'll send you tracking information once your order ships.
                </p>
              </div>

              {/* Contact Support */}
              <div className="mt-8 text-center">
                <p className="text-slate-600 mb-4">Need help with your order?</p>
                <button className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors duration-300">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="mt-16"
      />
    </div>
  );
}

export default OrderConfirmation;