import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaShoppingCart, 
  FaTrash, 
  FaPlus, 
  FaMinus, 
  FaArrowLeft,
  FaShoppingBag,
  FaHeart,
  FaLeaf,
  FaShieldAlt
} from 'react-icons/fa';

// Auth utility functions (inline for now to avoid import issues)
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

function EnhancedCart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchCartItems();
  }, [navigate]);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get('http://localhost:5000/api/cart', {
        headers: getAuthHeaders()
      });
      
      setCartItems(response.data.items || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
      if (error.response?.status === 401) {
        logout();
        return;
      }
      
      // Fallback to localStorage for demo purposes
      try {
        const localCart = JSON.parse(localStorage.getItem('cartItems') || '[]');
        setCartItems(localCart);
      } catch (e) {
        setError('Failed to load cart items');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      await axios.put(`http://localhost:5000/api/cart/${productId}`, 
        { quantity: newQuantity },
        { headers: getAuthHeaders() }
      );
      
      setCartItems(items => 
        items.map(item => 
          item.product._id === productId 
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    } catch (error) {
      console.error('Error updating quantity:', error);
      if (error.response?.status === 401) {
        logout();
        return;
      }
      
      // Fallback to local update
      setCartItems(items => 
        items.map(item => 
          item.product?._id === productId || item._id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await axios.delete(`http://localhost:5000/api/cart/${productId}`, {
        headers: getAuthHeaders()
      });
      
      setCartItems(items => items.filter(item => item.product._id !== productId));
    } catch (error) {
      console.error('Error removing from cart:', error);
      if (error.response?.status === 401) {
        logout();
        return;
      }
      
      // Fallback to local removal
      setCartItems(items => items.filter(item => 
        item.product?._id !== productId && item._id !== productId
      ));
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product?.price || item.price || 0;
      const quantity = item.quantity || 1;
      return total + (price * quantity);
    }, 0);
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        {/* Floating decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        <div className="text-center relative z-10">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-emerald-200 border-t-emerald-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 opacity-20 animate-pulse"></div>
          </div>
          <h2 className="text-2xl font-playfair font-bold text-slate-900 mb-2">Loading your cart...</h2>
          <p className="text-slate-600">Please wait while we fetch your items</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-8 pt-24 relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-5"
        style={{ backgroundImage: 'url(/assets/bg.png)' }}
      />
      {/* Floating decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-cyan-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/herbs')}
              className="group flex items-center text-slate-600 hover:text-emerald-600 transition-all duration-300 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl border border-white/50"
            >
              <FaArrowLeft className="mr-3 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="font-semibold">Continue Shopping</span>
            </button>
          </div>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-playfair font-bold text-slate-900 flex items-center justify-center mb-2">
              <FaShoppingCart className="mr-4 text-emerald-600" />
              Shopping Cart
            </h1>
            <p className="text-slate-600 font-medium">Your herbal wellness journey</p>
          </div>
          <div className="w-48"></div> {/* Spacer for centering */}
        </div>

        {error && (
          <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-3xl p-6 mb-8 shadow-lg">
            <div className="flex items-center justify-center">
              <FaShieldAlt className="text-red-500 mr-3" />
              <p className="text-red-700 font-semibold text-center">{error}</p>
            </div>
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="relative inline-block mb-8">
              <FaShoppingBag className="text-8xl text-slate-300 mx-auto" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                <FaLeaf className="text-white text-sm" />
              </div>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-slate-900 mb-4">
              Your cart is empty
            </h2>
            <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Discover our amazing collection of premium herbal products and start your wellness journey today!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button 
                onClick={() => navigate('/herbs')}
                className="group bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold px-10 py-5 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center text-lg"
              >
                <FaShoppingBag className="mr-3 group-hover:scale-110 transition-transform duration-300" />
                Start Shopping
              </button>

            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {cartItems.map((item) => {
                const product = item.product || item;
                return (
                  <div key={product._id} className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 border border-white/50 hover:border-emerald-200/50">
                    <div className="flex items-center space-x-8">
                      <div className="relative">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-32 h-32 object-cover rounded-3xl shadow-lg group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                          <FaLeaf className="text-white text-sm" />
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-2xl font-playfair font-bold text-slate-900 mb-3">{product.name}</h3>
                        <p className="text-slate-600 mb-4 leading-relaxed">{product.description}</p>
                        <div className="flex items-center space-x-3">
                          <span className="bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold border border-emerald-200/50">
                            {product.category}
                          </span>
                          <span className="bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-bold border border-blue-200/50">
                            {product.quality}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-3 bg-slate-50 rounded-2xl p-2">
                          <button 
                            onClick={() => updateQuantity(product._id, item.quantity - 1)}
                            className="w-12 h-12 bg-white hover:bg-slate-100 rounded-xl flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg group/btn"
                          >
                            <FaMinus className="text-slate-600 group-hover/btn:scale-110 transition-transform duration-300" />
                          </button>
                          <span className="w-16 text-center font-bold text-xl text-slate-900">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(product._id, item.quantity + 1)}
                            className="w-12 h-12 bg-emerald-500 hover:bg-emerald-600 rounded-xl flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg group/btn"
                          >
                            <FaPlus className="text-white group-hover/btn:scale-110 transition-transform duration-300" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            ₹{(product.price * item.quantity).toFixed(2)}
                          </div>
                          <div className="text-sm text-slate-500 font-medium">
                            ₹{product.price} each
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button 
                          onClick={() => removeFromCart(product._id)}
                          className="w-12 h-12 bg-red-50 hover:bg-red-100 rounded-xl flex items-center justify-center transition-all duration-300 group/btn border border-red-200/50 hover:border-red-300"
                        >
                          <FaTrash className="text-red-500 group-hover/btn:scale-110 transition-transform duration-300" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 sticky top-8 border border-white/50">
                <h2 className="text-2xl font-playfair font-bold text-slate-900 mb-8 flex items-center">
                  <FaShieldAlt className="mr-3 text-emerald-600" />
                  Order Summary
                </h2>
                
                <div className="space-y-6 mb-8">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-600 font-medium">Subtotal ({cartItems.length} items)</span>
                    <span className="font-bold text-slate-900">₹{getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-600 font-medium">Shipping</span>
                    <span className="font-bold text-emerald-600">Free</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-600 font-medium">Tax (18%)</span>
                    <span className="font-bold text-slate-900">₹{(getTotalPrice() * 0.18).toFixed(2)}</span>
                  </div>
                  <hr className="border-slate-200" />
                  <div className="flex justify-between items-center text-2xl font-bold py-2">
                    <span className="text-slate-900">Total</span>
                    <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      ₹{(getTotalPrice() * 1.18).toFixed(2)}
                    </span>
                  </div>
                </div>

                <button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-5 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 text-lg mb-6">
                  Proceed to Checkout
                </button>

                <div className="text-center">
                  <button 
                    onClick={() => navigate('/wishlist')}
                    className="group text-emerald-600 hover:text-emerald-700 font-bold flex items-center justify-center w-full py-3 rounded-2xl hover:bg-emerald-50 transition-all duration-300"
                  >
                    <FaHeart className="mr-2 group-hover:scale-110 transition-transform duration-300" />
                    View Wishlist
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EnhancedCart;
