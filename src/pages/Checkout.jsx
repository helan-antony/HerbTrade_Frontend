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
  FaLock,
  FaExclamationTriangle
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
const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('cartItems');
  localStorage.removeItem('wishlistItems');
  window.location.href = '/login';
};

function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditingAddress, setIsEditingAddress] = useState(true); // Default to editing if no address found
  const [savedAddress, setSavedAddress] = useState(null); // Store the fetched saved address

  // Load cart items and user profile on mount
  useEffect(() => {
    const loadData = async () => {
      // 1. Load Cart
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

      // 2. Load User Profile for Address
      if (isAuthenticated()) {
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_URL || ''}/api/auth/profile`, {
            headers: getAuthHeaders()
          });

          if (res.data.success && res.data.user) {
            const user = res.data.user;
            // Check if user has a saved address
            const hasAddress = user.address && user.city && user.pincode;

            if (hasAddress) {
              const addressData = {
                fullName: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                city: user.city || '',
                state: user.state || '',
                pincode: user.pincode || '',
                country: user.country || 'India'
              };
              setShippingInfo(addressData);
              setSavedAddress(addressData);
              setIsEditingAddress(false); // Switch to view mode
            } else {
              // Pre-fill basic info but stay in edit mode
              setShippingInfo(prev => ({
                ...prev,
                fullName: user.name || '',
                email: user.email || '',
                phone: user.phone || ''
              }));
              setIsEditingAddress(true);
            }
          }
        } catch (err) {
          console.error("Failed to fetch user profile for checkout:", err);
          // Fallback to localStorage basic info if API fails
          const user = getCurrentUser();
          if (user) {
            setShippingInfo(prev => ({
              ...prev,
              fullName: prev.fullName || user.name || '',
              email: prev.email || user.email || '',
              phone: prev.phone || user.phone || ''
            }));
          }
        }
      }
      setLoading(false);
    };

    loadData();
  }, []);

  // Check for invalid cart items (missing price or quantity)
  useEffect(() => {
    if (cartItems.length > 0) {
      const invalid = cartItems.some(item => {
        // Handle both formats: {product, quantity} and {product: {_id, price, ...}, quantity}
        const product = item.product && typeof item.product === 'object' ? item.product : item;
        return !product.price || isNaN(Number(product.price)) || !item.quantity || isNaN(Number(item.quantity));
      });
      if (invalid) {
        toast.error('One or more items in your cart are missing price or quantity. Please remove and re-add them.');
      }
    }
  }, [cartItems]);

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState({});

  // Validation functions
  const validateFullName = (value) => {
    if (!value.trim()) return "Full name is required";
    if (value.trim().length < 2) return "Full name must be at least 2 characters";
    if (value.trim().length > 50) return "Full name must be less than 50 characters";
    if (!/^[a-zA-Z\s]+$/.test(value)) return "Full name can only contain letters and spaces";
    return "";
  };

  const validateEmail = (value) => {
    if (!value.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "Please enter a valid email address";
    if (value.length > 254) return "Email address is too long";
    return "";
  };

  const validatePhone = (value) => {
    if (!value.trim()) return "Phone number is required";
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(value)) return "Please enter a valid 10-digit Indian phone number";
    return "";
  };

  const validatePincode = (value) => {
    if (!value.trim()) return "Pincode is required";
    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(value)) return "Please enter a valid 6-digit pincode";
    return "";
  };

  const validateAddress = (value) => {
    if (!value.trim()) return "Address is required";
    if (value.trim().length < 10) return "Address must be at least 10 characters";
    if (value.trim().length > 200) return "Address must be less than 200 characters";
    return "";
  };

  const validateCity = (value) => {
    if (!value.trim()) return "City is required";
    if (value.trim().length < 2) return "City must be at least 2 characters";
    if (value.trim().length > 50) return "City must be less than 50 characters";
    if (!/^[a-zA-Z\s]+$/.test(value)) return "City can only contain letters and spaces";
    return "";
  };

  const validateState = (value) => {
    if (!value.trim()) return "State is required";
    if (value.trim().length < 2) return "State must be at least 2 characters";
    if (value.trim().length > 50) return "State must be less than 50 characters";
    if (!/^[a-zA-Z\s]+$/.test(value)) return "State can only contain letters and spaces";
    return "";
  };

  // Handles input changes for shipping info fields with validation
  function handleInputChange(field, value) {
    setShippingInfo(prev => ({
      ...prev,
      [field]: value
    }));

    // Real-time validation
    let error = "";
    switch (field) {
      case 'fullName':
        error = validateFullName(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'phone':
        error = validatePhone(value);
        break;
      case 'pincode':
        error = validatePincode(value);
        break;
      case 'address':
        error = validateAddress(value);
        break;
      case 'city':
        error = validateCity(value);
        break;
      case 'state':
        error = validateState(value);
        break;
      default:
        break;
    }

    setValidationErrors(prev => ({
      ...prev,
      [field]: error
    }));
  }

  // Place order functionality
  async function handlePlaceOrder() {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }

    // Validate all fields
    const errors = {};
    errors.fullName = validateFullName(shippingInfo.fullName);
    errors.email = validateEmail(shippingInfo.email);
    errors.phone = validatePhone(shippingInfo.phone);
    errors.pincode = validatePincode(shippingInfo.pincode);
    errors.address = validateAddress(shippingInfo.address);
    errors.city = validateCity(shippingInfo.city);
    errors.state = validateState(shippingInfo.state);

    setValidationErrors(errors);

    // Check if there are any validation errors
    const hasErrors = Object.values(errors).some(error => error !== "");
    if (hasErrors) {
      toast.error('Please fix the validation errors before placing your order.');
      // Scroll to top to see errors
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

        // Prepare cart items and total
        const items = cartItems.map(item => ({
          product: getProductId(item),
          quantity: item.quantity
        }));

        const orderData = {
          items,
          totalAmount: getFinalTotal(),
          shippingAddress: shippingInfo,
          paymentMethod,
          notes: orderNotes
        };

        // Create order on backend
        const orderRes = await axios.post(
          `${import.meta.env.VITE_API_URL || ''}/api/orders`,
          orderData,
          { headers: getAuthHeaders() }
        );

        if (!orderRes.data.success) {
          throw new Error(orderRes.data.message || 'Failed to initialize order');
        }

        const { orderId, razorpayOrderId, razorpayKey, amount, currency } = orderRes.data;

        if (!razorpayOrderId) {
          throw new Error('Failed to get payment details from server');
        }

        const options = {
          key: razorpayKey,
          amount: amount,
          currency: currency || 'INR',
          name: 'HerbTrade',
          description: 'Herbal Products Purchase',
          order_id: razorpayOrderId,
          handler: async function (response) {
            // For now, we'll just show success since the order was already created
            // In a real implementation, you would verify the payment with Razorpay
            toast.success('Payment Successful!');

            // Remove ordered items from cart
            await removeOrderedItemsFromCart(cartItems);

            // Download invoice automatically
            downloadInvoiceAutomatically(orderRes.data.order);

            // Navigate to order confirmation page with the order ID
            // Using backend Order ID for our internal routing, not value returned by Razorpay hook
            setTimeout(() => navigate(`/order-confirmation/${orderId}`), 1500);
          },
          prefill: {
            name: shippingInfo.fullName,
            email: shippingInfo.email,
            contact: shippingInfo.phone
          },
          theme: { color: '#10b981' },
          modal: {
            ondismiss: function () {
              setSubmitting(false);
              toast.info('Payment cancelled or closed.');
            }
          }
        };
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          console.error("Payment Failed:", response.error);
          toast.error(`Payment Failed: ${response.error.description}`);
          // Don't auto-navigate on failure, let user try again or choose COD
          setSubmitting(false);
        });
        rzp.open();
        // Do not setSubmitting(false) here, wait for handler or dismiss
      } else {
        // Cash on Delivery
        const items = cartItems.map(item => ({
          product: getProductId(item),
          quantity: item.quantity
        }));

        const orderData = {
          items,
          totalAmount: getFinalTotal(),
          shippingAddress: shippingInfo,
          paymentMethod: 'cod',
          notes: orderNotes
        };

        const orderRes = await axios.post(
          `${import.meta.env.VITE_API_URL || ''}/api/orders`,
          orderData,
          { headers: getAuthHeaders() }
        );

        toast.success('Order placed successfully!');

        // Remove ordered items from cart
        await removeOrderedItemsFromCart(cartItems);

        // Download invoice automatically
        downloadInvoiceAutomatically(orderRes.data.order);

        // Navigate to order confirmation page with the order ID
        const orderId = orderRes.data.orderId || orderRes.data.order?._id;
        setTimeout(() => navigate(`/order-confirmation/${orderId}`), 1500);
        setSubmitting(false);
      }
    } catch (err) {
      console.error('Order placement error:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to place order. Please try again.';
      toast.error(errorMessage);
      setSubmitting(false);
    }
  }

  // Function to remove ordered items from cart
  async function removeOrderedItemsFromCart(orderedItems) {
    try {
      // Remove items from backend cart
      for (const item of orderedItems) {
        // Extract product ID based on item structure
        const productId = item.productId?._id || item.productId || item.product?._id || item._id;
        if (productId) {
          try {
            await axios.delete(`${import.meta.env.VITE_API_URL || ''}/api/cart/remove/${productId}`, {
              headers: getAuthHeaders()
            });
          } catch (deleteError) {
            console.warn(`Failed to remove item ${productId} from backend cart:`, deleteError);
            // Continue with other items even if one fails
          }
        }
      }

      // Clear localStorage cart
      localStorage.removeItem('cartItems');

      // Update cart items in state
      setCartItems([]);

      // Dispatch event to update navbar cart count
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error removing ordered items from cart:', error);
      // Even if we fail to remove from backend, clear localStorage
      localStorage.removeItem('cartItems');
      setCartItems([]);
      window.dispatchEvent(new Event('cartUpdated'));
    }
  }

  // Function to automatically download invoice after order placement
  function downloadInvoiceAutomatically(orderData) {
    try {
      import('../utils/invoiceGenerator').then(({ generateInvoice, downloadInvoice }) => {
        const user = JSON.parse(localStorage.getItem('user'));
        const doc = generateInvoice(orderData, user);
        const filename = `invoice-${orderData._id.slice(-8).toUpperCase()}.pdf`;
        downloadInvoice(doc, filename);
        toast.success('Invoice downloaded successfully!');
      }).catch(error => {
        console.error('Error importing invoice generator:', error);
        toast.info('Your order was placed successfully! You can download the invoice from the order confirmation page.');
      });
    } catch (error) {
      console.error('Error auto-downloading invoice:', error);
      toast.info('Your order was placed successfully! You can download the invoice from the order confirmation page.');
    }
  }

  // Helper function to get product ID from cart item
  const getProductId = (item) => {
    if (item.productId && typeof item.productId === 'object' && item.productId._id) {
      return item.productId._id;
    } else if (item.product && typeof item.product === 'object' && item.product._id) {
      return item.product._id;
    } else if (typeof item.productId === 'string') {
      return item.productId;
    } else {
      return item._id;
    }
  };

  // Helper functions for order summary
  function getTotalPrice() {
    return cartItems.reduce((total, item) => {
      // Handle both formats: {product, quantity} and {product: {_id, price, ...}, quantity}
      const product = item.product && typeof item.product === 'object' ? item.product : item;
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
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-playfair font-bold text-slate-900 flex items-center">
                  <FaMapMarkerAlt className="mr-3 text-emerald-600" />
                  Shipping Information
                </h2>
                {!isEditingAddress && (
                  <button
                    onClick={() => setIsEditingAddress(true)}
                    className="text-emerald-600 font-semibold hover:text-emerald-700 underline flex items-center"
                  >
                    Change
                  </button>
                )}
              </div>

              {!isEditingAddress ? (
                // View Mode
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-colors duration-300">
                  <div className="flex items-start">
                    <div className="bg-white p-3 rounded-full shadow-sm mr-4 text-emerald-600">
                      <FaHome size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg mb-1">{shippingInfo.fullName}</h3>
                      <p className="text-slate-600 mb-1">{shippingInfo.address}</p>
                      <p className="text-slate-600 mb-2">{shippingInfo.city}, {shippingInfo.state} - {shippingInfo.pincode}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-500 mt-3">
                        <div className="flex items-center">
                          <FaPhone className="mr-2" />
                          {shippingInfo.phone}
                        </div>
                        <div className="flex items-center">
                          <FaEnvelope className="mr-2" />
                          {shippingInfo.email}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Edit Mode
                <div className="grid md:grid-cols-2 gap-6 animate-fadeIn">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      <FaUser className="inline mr-2 text-emerald-600" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-emerald-500 transition-all duration-300 ${validationErrors.fullName
                        ? 'border-red-500 focus:ring-red-500/20'
                        : 'border-slate-300 focus:ring-emerald-500/20'
                        }`}
                      placeholder="Enter your full name"
                    />
                    {validationErrors.fullName && (
                      <div className="flex items-center mt-1 text-red-500 text-sm">
                        <FaExclamationTriangle className="mr-1" />
                        <span>{validationErrors.fullName}</span>
                      </div>
                    )}
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
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-emerald-500 transition-all duration-300 ${validationErrors.email
                        ? 'border-red-500 focus:ring-red-500/20'
                        : 'border-slate-300 focus:ring-emerald-500/20'
                        }`}
                      placeholder="Enter your email"
                    />
                    {validationErrors.email && (
                      <div className="flex items-center mt-1 text-red-500 text-sm">
                        <FaExclamationTriangle className="mr-1" />
                        <span>{validationErrors.email}</span>
                      </div>
                    )}
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
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-emerald-500 transition-all duration-300 ${validationErrors.phone
                        ? 'border-red-500 focus:ring-red-500/20'
                        : 'border-slate-300 focus:ring-emerald-500/20'
                        }`}
                      placeholder="Enter 10-digit phone number"
                    />
                    {validationErrors.phone && (
                      <div className="flex items-center mt-1 text-red-500 text-sm">
                        <FaExclamationTriangle className="mr-1" />
                        <span>{validationErrors.phone}</span>
                      </div>
                    )}
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
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-emerald-500 transition-all duration-300 ${validationErrors.pincode
                        ? 'border-red-500 focus:ring-red-500/20'
                        : 'border-slate-300 focus:ring-emerald-500/20'
                        }`}
                      placeholder="Enter 6-digit pincode"
                    />
                    {validationErrors.pincode && (
                      <div className="flex items-center mt-1 text-red-500 text-sm">
                        <FaExclamationTriangle className="mr-1" />
                        <span>{validationErrors.pincode}</span>
                      </div>
                    )}
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
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-emerald-500 transition-all duration-300 ${validationErrors.address
                        ? 'border-red-500 focus:ring-red-500/20'
                        : 'border-slate-300 focus:ring-emerald-500/20'
                        }`}
                      placeholder="Enter your complete address"
                    />
                    {validationErrors.address && (
                      <div className="flex items-center mt-1 text-red-500 text-sm">
                        <FaExclamationTriangle className="mr-1" />
                        <span>{validationErrors.address}</span>
                      </div>
                    )}
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
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-emerald-500 transition-all duration-300 ${validationErrors.city
                        ? 'border-red-500 focus:ring-red-500/20'
                        : 'border-slate-300 focus:ring-emerald-500/20'
                        }`}
                      placeholder="Enter your city"
                    />
                    {validationErrors.city && (
                      <div className="flex items-center mt-1 text-red-500 text-sm">
                        <FaExclamationTriangle className="mr-1" />
                        <span>{validationErrors.city}</span>
                      </div>
                    )}
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
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-emerald-500 transition-all duration-300 ${validationErrors.state
                        ? 'border-red-500 focus:ring-red-500/20'
                        : 'border-slate-300 focus:ring-emerald-500/20'
                        }`}
                      placeholder="Enter your state"
                    />
                    {validationErrors.state && (
                      <div className="flex items-center mt-1 text-red-500 text-sm">
                        <FaExclamationTriangle className="mr-1" />
                        <span>{validationErrors.state}</span>
                      </div>
                    )}
                  </div>
                  {savedAddress && (
                    <div className="md:col-span-2 flex justify-end mt-2">
                      <button
                        onClick={() => {
                          setShippingInfo(savedAddress);
                          setIsEditingAddress(false);
                        }}
                        className="bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 font-medium px-6 py-2 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Payment Method */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-8 border border-white/50">
              <h2 className="text-2xl font-playfair font-bold text-slate-900 mb-6 flex items-center">
                <FaCreditCard className="mr-3 text-emerald-600" />
                Payment Method
              </h2>
              <div className="space-y-4">
                <div
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${paymentMethod === 'cod'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-200 hover:border-emerald-300'
                    }`}
                  onClick={() => setPaymentMethod('cod')}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'
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
                {/* Mock Payment / UPI Option */}
                <div
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${paymentMethod === 'mock_online'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-200 hover:border-emerald-300'
                    }`}
                  onClick={() => setPaymentMethod('mock_online')}
                >
                  <div className="flex items-center mb-2">
                    <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${paymentMethod === 'mock_online' ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'
                      }`}>
                      {paymentMethod === 'mock_online' && <FaCheck className="text-white text-xs" />}
                    </div>
                    <FaCreditCard className="text-emerald-600 mr-3" />
                    <div>
                      <h3 className="font-semibold text-slate-900">UPI Payment</h3>
                      <p className="text-sm text-slate-600">Pay securely using UPI</p>
                    </div>
                  </div>
                  {paymentMethod === 'mock_online' && (
                    <div className="ml-8 mt-2 animate-fadeIn">
                      <input
                        type="text"
                        placeholder="Enter UPI ID (e.g. user@oksbi)"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:border-emerald-500 focus:outline-none"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <p className="text-xs text-emerald-600 mt-1">Simulated payment mechanism</p>
                    </div>
                  )}
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
                  // Handle both formats: {product, quantity} and {product: {_id, price, ...}, quantity}
                  const product = item.product && typeof item.product === 'object' ? item.product : item;
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
                              : `${(item.quantity / 1000).toFixed(1)}kg`
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
    </div>
  );
}
export default Checkout;