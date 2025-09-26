import React, { useState, useEffect } from 'react';
import { loadRazorpayScript } from '../utils/razorpay';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FaShoppingCart,
  FaArrowLeft,
  FaMapMarkerAlt,
  FaCreditCard,
  FaMoneyBillWave,
  FaShieldAlt,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaHome,
  FaCity,
  FaGlobe,
  FaLeaf,
  FaCheck,
  FaSpinner,
  FaTruck,
  FaLock
} from 'react-icons/fa';

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
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('cartItems');
  localStorage.removeItem('wishlistItems');
  window.location.href = '/login';
};

function Checkout() {

  // Load cart items from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem('cartItems');
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (e) {
        setCartItems([]);
      }
    } else {
      setCartItems([]);
    }
    setLoading(false);
  }, []);

  // Check for invalid cart items (missing price or quantity)
  useEffect(() => {
    if (cartItems.length > 0) {
      const invalid = cartItems.some(item => {
        const product = item.productId || item;
        return !product.price || isNaN(Number(product.price)) || !item.quantity || isNaN(Number(item.quantity));
      });
      if (invalid) {
        toast.error('One or more items in your cart are missing price or quantity. Please remove and re-add them.');
      }
    }
  }, [cartItems]);
  // Handles input changes for shipping info fields
  function handleInputChange(field, value) {
    setShippingInfo(prev => ({
      ...prev,
      [field]: value
    }));
  }

  // Place order functionality
  async function handlePlaceOrder() {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }
    if (!shippingInfo.fullName || !shippingInfo.email || !shippingInfo.phone || !shippingInfo.address || !shippingInfo.city || !shippingInfo.state || !shippingInfo.pincode) {
      toast.error('Please fill in all required shipping information.');
      return;
    }
    setSubmitting(true);
    try {
      if (paymentMethod === 'razorpay') {
        // Load Razorpay script
        const res = await loadRazorpayScript();
        if (!res) {
          toast.error('Failed to load Razorpay.');
          setSubmitting(false);
          return;
        }
        // Create order on backend
        const orderRes = await axios.post(
          `${import.meta.env.VITE_API_URL || ''}/orders/create-razorpay-order`,
          {
            amount: Math.round(getFinalTotal() * 100), // in paise
            cartItems,
            shippingInfo,
            orderNotes
          },
          { headers: getAuthHeaders() }
        );
        const { orderId, razorpayKey } = orderRes.data;
        const options = {
          key: razorpayKey,
          amount: Math.round(getFinalTotal() * 100),
          currency: 'INR',
          name: 'HerbTrade',
          description: 'Order Payment',
          order_id: orderId,
          handler: async function (response) {
            // Verify payment on backend
            await axios.post(
              `${import.meta.env.VITE_API_URL || ''}/orders/verify-razorpay-payment`,
              {
                ...response,
                cartItems,
                shippingInfo,
                orderNotes
              },
              { headers: getAuthHeaders() }
            );
            toast.success('Order placed successfully!');
            localStorage.removeItem('cartItems');
            setTimeout(() => navigate('/order-confirmation'), 1500);
          },
          prefill: {
            name: shippingInfo.fullName,
            email: shippingInfo.email,
            contact: shippingInfo.phone
          },
          theme: { color: '#10b981' }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Cash on Delivery
        await axios.post(
          `${import.meta.env.VITE_API_URL || ''}/orders/create-cod-order`,
          {
            cartItems,
            shippingInfo,
            orderNotes
          },
          { headers: getAuthHeaders() }
        );
        toast.success('Order placed successfully!');
        localStorage.removeItem('cartItems');
        setTimeout(() => navigate('/order-confirmation'), 1500);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order.');
    } finally {
      setSubmitting(false);
    }
  }
  // Helper functions for order summary
  function getTotalPrice() {
    return cartItems.reduce((total, item) => {
      const product = item.productId || item;
      let price = Number(product.price);
      let quantity = Number(item.quantity);
      if (isNaN(price) || price <= 0) price = 0;
      if (isNaN(quantity) || quantity <= 0) quantity = 1;
      return total + (price * quantity);
    }, 0);
  }

  function getTaxAmount() {
    return getTotalPrice() * 0.18;
  }

  function getFinalTotal() {
    return getTotalPrice() + getTaxAmount();
  }
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  // Form states
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [razorpayLoading, setRazorpayLoading] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');


  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-8 pt-24">
      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="group flex items-center text-slate-600 hover:text-emerald-600 transition-all duration-300 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl border border-white/50"
          >
            <FaArrowLeft className="mr-3 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-semibold">Back to Cart</span>
          </button>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-playfair font-bold text-slate-900 flex items-center justify-center mb-2">
              <FaShoppingCart className="mr-4 text-emerald-600" />
              Checkout
            </h1>
            <p className="text-slate-600 font-medium">Complete your herbal wellness order</p>
          </div>
          <div className="w-32"></div> {/* Spacer for centering */}
        </div>
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-3xl p-6 mb-8 shadow-lg">
            <div className="flex items-center justify-center">
              <FaShieldAlt className="text-red-500 mr-3" />
              <p className="text-red-700 font-semibold text-center">{error}</p>
            </div>
          </div>
        )}
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Information */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-8 border border-white/50">
              <h2 className="text-2xl font-playfair font-bold text-slate-900 mb-6 flex items-center">
                <FaMapMarkerAlt className="mr-3 text-emerald-600" />
                Shipping Information
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <FaUser className="inline mr-2 text-emerald-600" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <FaEnvelope className="inline mr-2 text-emerald-600" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={shippingInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <FaPhone className="inline mr-2 text-emerald-600" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={shippingInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                    placeholder="Enter 10-digit phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <FaGlobe className="inline mr-2 text-emerald-600" />
                    Pincode *
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.pincode}
                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                    placeholder="Enter 6-digit pincode"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <FaHome className="inline mr-2 text-emerald-600" />
                    Address *
                  </label>
                  <textarea
                    value={shippingInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows="3"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                    placeholder="Enter your complete address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <FaCity className="inline mr-2 text-emerald-600" />
                    City *
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                    placeholder="Enter your city"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <FaGlobe className="inline mr-2 text-emerald-600" />
                    State *
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                    placeholder="Enter your state"
                  />
                </div>
              </div>
            </div>
            {/* Payment Method */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-8 border border-white/50">
              <h2 className="text-2xl font-playfair font-bold text-slate-900 mb-6 flex items-center">
                <FaCreditCard className="mr-3 text-emerald-600" />
                Payment Method
              </h2>
              <div className="space-y-4">
                <div 
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                    paymentMethod === 'cod' 
                      ? 'border-emerald-500 bg-emerald-50' 
                      : 'border-slate-200 hover:border-emerald-300'
                  }`}
                  onClick={() => setPaymentMethod('cod')}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                      paymentMethod === 'cod' ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'
                    }`}>
                      {paymentMethod === 'cod' && <FaCheck className="text-white text-xs" />}
                    </div>
                    <FaMoneyBillWave className="text-emerald-600 mr-3" />
                    <div>
                      <h3 className="font-semibold text-slate-900">Cash on Delivery</h3>
                      <p className="text-sm text-slate-600">Pay when your order arrives</p>
                    </div>
                  </div>
                </div>
                <div 
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                    paymentMethod === 'razorpay' 
                      ? 'border-emerald-500 bg-emerald-50' 
                      : 'border-slate-200 hover:border-emerald-300'
                  }`}
                  onClick={() => setPaymentMethod('razorpay')}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                      paymentMethod === 'razorpay' ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'
                    }`}>
                      {paymentMethod === 'razorpay' && <FaCheck className="text-white text-xs" />}
                    </div>
                    <FaCreditCard className="text-emerald-600 mr-3" />
                    <div>
                      <h3 className="font-semibold text-slate-900">Razorpay (Card/UPI/Netbanking)</h3>
                      <p className="text-sm text-slate-600">Pay securely online with Razorpay</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Order Notes */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-8 border border-white/50">
              <h2 className="text-2xl font-playfair font-bold text-slate-900 mb-6">
                Order Notes (Optional)
              </h2>
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                rows="4"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                placeholder="Any special instructions for your order..."
              />
            </div>
          </div>
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 sticky top-8 border border-white/50">
              <h2 className="text-2xl font-playfair font-bold text-slate-900 mb-8 flex items-center">
                <FaShieldAlt className="mr-3 text-emerald-600" />
                Order Summary
              </h2>
              {/* Cart Items */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cartItems.map((item, index) => {
                  const product = item.productId || item;
                  return (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
                      <img
                        src={product.image || '/assets/ashwagandha.png'}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = '/assets/ashwagandha.png';
                        }}
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 text-sm">{product.name}</h4>
                        <p className="text-xs text-slate-600">
                          {product.category === 'Medicines' 
                            ? `${item.quantity} units` 
                            : item.quantity < 1000 
                              ? `${item.quantity}g` 
                              : `${(item.quantity/1000).toFixed(1)}kg`
                          }
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-600">₹{(!isNaN(Number(product.price)) && Number(product.price) > 0 && !isNaN(Number(item.quantity)) && Number(item.quantity) > 0) ? (Number(product.price) * Number(item.quantity)).toFixed(2) : <span className="text-red-500">Invalid</span>}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Price Breakdown */}
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-600 font-medium">Subtotal ({cartItems.length} items)</span>
                  <span className="font-bold text-slate-900">₹{getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-600 font-medium flex items-center">
                    <FaTruck className="mr-2 text-emerald-600" />
                    Shipping
                  </span>
                  <span className="font-bold text-emerald-600">Free</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-600 font-medium">Tax (18%)</span>
                  <span className="font-bold text-slate-900">₹{getTaxAmount().toFixed(2)}</span>
                </div>
                <hr className="border-slate-200" />
                <div className="flex justify-between items-center text-2xl font-bold py-2">
                  <span className="text-slate-900">Total</span>
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    ₹{getFinalTotal().toFixed(2)}
                  </span>
                </div>
              </div>
              {/* Place Order Button */}
              <button 
                onClick={handlePlaceOrder}
                disabled={submitting || cartItems.length === 0}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-bold py-5 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 disabled:transform-none transition-all duration-300 text-lg mb-6 flex items-center justify-center"
              >
                {submitting ? (
                  <>
                    <FaSpinner className="animate-spin mr-3" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    <FaLock className="mr-3" />
                    Place Order
                  </>
                )}
              </button>
              {/* Security Notice */}
              <div className="text-center text-sm text-slate-500">
                <FaShieldAlt className="inline mr-2 text-emerald-600" />
                Your order is secured with SSL encryption
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
export default Checkout;
// ...existing code...