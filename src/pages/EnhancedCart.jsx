import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FaShoppingCart,
  FaTrash,
  FaPlus,
  FaMinus,
  FaArrowLeft,
  FaShoppingBag,
  FaHeart,
  FaLeaf,
  FaShieldAlt,
  FaExclamationTriangle
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
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const navigate = useNavigate();

  // Helper function to extract product ID from cart item
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

  // Helper function to extract product data from cart item
  const getProductData = (item) => {
    if (item.productId && typeof item.productId === 'object' && item.productId._id) {
      return item.productId;
    } else if (item.product && typeof item.product === 'object' && item.product._id) {
      return item.product;
    } else if (typeof item.productId === 'string') {
      return {
        _id: item.productId,
        name: item.productName || item.name,
        image: item.productImage || item.image,
        category: item.productCategory || item.category,
        price: item.price
      };
    } else {
      return item;
    }
  };

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

      const newCartItems = response.data.data?.items || [];
      setCartItems(newCartItems);
    } catch (error) {
      console.error('Error fetching cart:', error);
      if (error.response?.status === 401) {
        logout();
        return;
      }
      
      // Fallback to localStorage for demo purposes
      try {
        const localCart = JSON.parse(localStorage.getItem('cartItems') || '[]');
        const herbtradeCart = JSON.parse(localStorage.getItem('herbtradeCart') || '[]');

        // If cartItems is empty but herbtradeCart has data, use herbtradeCart
        if (localCart.length === 0 && herbtradeCart.length > 0) {
          const herbtradeFormatted = herbtradeCart.map((item, index) => ({
            _id: item._id || `cart-${item.product._id}-${Date.now()}-${index}`,
            productId: item.product._id,
            quantity: item.quantity || 1,
            product: item.product
          }));
          setCartItems(herbtradeFormatted);
          return;
        }

        if (localCart.length === 0) {
          setCartItems([]);
          return;
        }
        const formattedCart = localCart.map((item, index) => {
          // If item already has the correct structure (new format)
          if (item.product && item.productId && item.quantity) {
            return item;
          }

          // If item has product wrapper but missing other fields (old format)
          if (item.product) {
            return {
              _id: item._id || `cart-${item.product._id}-${Date.now()}-${index}`,
              productId: item.product._id,
              quantity: item.quantity || 1,
              product: item.product
            };
          }

          // If item is flattened product format (legacy)
          if (item._id && item.name && item.price) {
            const productData = { ...item };
            delete productData.quantity; // Remove quantity from product data
            return {
              _id: `cart-${item._id}-${Date.now()}-${index}`,
              productId: item._id,
              quantity: item.quantity || 1,
              product: productData
            };
          }

          return item;
        });

        setCartItems(formattedCart);
      } catch (e) {
        console.error('Error loading cart from localStorage:', e);
        setError('Failed to load cart items');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    // If quantity becomes 0 or less, trigger remove confirmation
    if (newQuantity < 1) {
      const product = cartItems.find(item => getProductId(item)?.toString() === productId?.toString());
      if (product) {
        handleRemoveClick(getProductData(product));
      }
      return;
    }

    // Ensure productId is a string
    const cleanProductId = productId?.toString();
    if (!cleanProductId) {
      toast.error('Invalid product ID');
      return;
    }

    console.log('Updating quantity for product:', cleanProductId, 'to quantity:', newQuantity);

    try {
      await axios.put(`http://localhost:5000/api/cart/update/${cleanProductId}`,
        { quantity: newQuantity },
        { headers: getAuthHeaders() }
      );

      setCartItems(items =>
        items.map(item => 
          getProductId(item)?.toString() === cleanProductId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );

      // Trigger navbar count update
      window.dispatchEvent(new Event('cartUpdated'));

      // Show subtle feedback for quantity update
      const product = cartItems.find(item => getProductId(item)?.toString() === cleanProductId);

      if (product) {
        const productName = getProductData(product)?.name;
        toast.info(`Updated ${productName} quantity to ${newQuantity}`, {
          position: "bottom-right",
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
        });
      }

    } catch (error) {
      console.error('Error updating quantity:', error);
      if (error.response?.status === 401) {
        logout();
        return;
      }

      // Fallback to local update
      setCartItems(items =>
        items.map(item => 
          getProductId(item)?.toString() === cleanProductId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );

      // Trigger navbar count update
      window.dispatchEvent(new Event('cartUpdated'));

      // Show error message
      toast.error('Failed to update quantity. Please try again.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleRemoveClick = (cartItem) => {
    setItemToRemove(cartItem);
    setShowRemoveDialog(true);
  };

  const confirmRemove = async () => {
    if (!itemToRemove) return;

    // Check if this is a clear all operation
    if (itemToRemove.name === 'all items') {
      await clearEntireCart();
      return;
    }

    // Extract the correct product ID - handle different cart item structures
    // The backend expects the productId that's stored in the cart item's productId field
    let productId;
    if (itemToRemove.productId) {
      // If productId exists, use it (this is what's stored in the database)
      if (typeof itemToRemove.productId === 'object' && itemToRemove.productId._id) {
        productId = itemToRemove.productId._id.toString();
      } else {
        productId = itemToRemove.productId.toString();
      }
    } else if (itemToRemove.product?._id) {
      // Fallback to product._id
      productId = itemToRemove.product._id.toString();
    } else {
      // Last fallback to item._id
      productId = itemToRemove._id.toString();
    }

    const productName = itemToRemove.product?.name || itemToRemove.name;





    try {
      const response = await axios.delete(`http://localhost:5000/api/cart/remove/${productId}`, {
        headers: getAuthHeaders()
      });



      if (response.data.success) {
        // Immediately update local state to remove the item
        setCartItems(prevItems => {
          const filteredItems = prevItems.filter(item => {
            // Use the same logic as above to extract product ID
            let itemProductId;
            if (item.productId) {
              if (typeof item.productId === 'object' && item.productId._id) {
                itemProductId = item.productId._id.toString();
              } else {
                itemProductId = item.productId.toString();
              }
            } else if (item.product?._id) {
              itemProductId = item.product._id.toString();
            } else {
              itemProductId = item._id.toString();
            }

            return itemProductId !== productId;
          });
          return filteredItems;
        });



        // Clear localStorage to prevent conflicts
        localStorage.removeItem('cartItems');
        localStorage.removeItem('herbtradeCart');

        // Trigger navbar count update
        window.dispatchEvent(new Event('cartUpdated'));

        // Show success message
        toast.success(`${productName} removed from cart!`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        throw new Error(response.data.message || 'Failed to remove item');
      }

    } catch (error) {
      console.error('Error removing from cart:', error);
      if (error.response?.status === 401) {
        logout();
        return;
      }

      // Fallback to local removal
      console.log('Using fallback removal for productId:', productId);
      setCartItems(items => {
        const filteredItems = items.filter(item => {
          const itemProductId = item.product?._id || item.productId || item._id;
          const shouldKeep = itemProductId !== productId;
          console.log('Fallback filtering:', {
            itemProductId,
            productId,
            shouldKeep,
            itemName: item.product?.name || item.name
          });
          return shouldKeep;
        });

        console.log('Fallback: Items after filtering:', filteredItems.length, 'remaining');

        // Clear localStorage to prevent conflicts
        localStorage.removeItem('cartItems');
        localStorage.removeItem('herbtradeCart');

        return filteredItems;
      });

      // Trigger navbar count update
      window.dispatchEvent(new Event('cartUpdated'));

      // Show success message even for fallback
      toast.success(`${productName} removed from cart!`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      // Close dialog and reset state
      setShowRemoveDialog(false);
      setItemToRemove(null);
    }
  };

  const cancelRemove = () => {
    setShowRemoveDialog(false);
    setItemToRemove(null);
  };

  const clearEntireCart = async () => {
    try {
      // Clear cart on server
      await axios.delete('http://localhost:5000/api/cart/clear', {
        headers: getAuthHeaders()
      });

      setCartItems([]);

      // Trigger navbar count update
      window.dispatchEvent(new Event('cartUpdated'));

      // Show success message
      toast.success('Cart cleared successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

    } catch (error) {
      console.error('Error clearing cart:', error);
      if (error.response?.status === 401) {
        logout();
        return;
      }

      // Fallback to local clear
      setCartItems([]);

      // Trigger navbar count update
      window.dispatchEvent(new Event('cartUpdated'));

      // Show success message even for fallback
      toast.success('Cart cleared successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      // Close dialog and reset state
      setShowRemoveDialog(false);
      setItemToRemove(null);
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
          <div className="flex items-center space-x-4">
            {cartItems.length > 0 && (
              <button
                onClick={() => {
                  setItemToRemove({ name: 'all items' });
                  setShowRemoveDialog(true);
                }}
                className="group flex items-center text-red-600 hover:text-red-700 transition-all duration-300 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl shadow-md hover:shadow-lg border border-red-200/50"
                title="Clear entire cart"
              >
                <FaTrash className="mr-2 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-semibold text-sm">Clear Cart</span>
              </button>
            )}
          </div>
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
              {cartItems.map((item, index) => {
                const product = getProductData(item);
                const productId = getProductId(item);
                const imageUrl = product?.image || item.image || item.productImage || 'https://via.placeholder.com/300x200/10b981/ffffff?text=Herb+Image';

                return (
                  <div key={productId || index} className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 border border-white/50 hover:border-emerald-200/50">
                    <div className="flex items-center space-x-8">
                      <div className="relative">
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="w-32 h-32 object-cover rounded-3xl shadow-lg group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x200/10b981/ffffff?text=Herb+Image';
                          }}
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
                            onClick={() => {
                              const decrement = product.category === 'Medicines' ? 1 : 50; // 1 count for medicines, 50g for herbs
                              updateQuantity(productId, Math.max(1, item.quantity - decrement));
                            }}
                            className="w-12 h-12 bg-white hover:bg-slate-100 rounded-xl flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg group/btn"
                          >
                            <FaMinus className="text-slate-600 group-hover/btn:scale-110 transition-transform duration-300" />
                          </button>
                          <div className="w-20 text-center">
                            <span className="font-bold text-lg text-slate-900 block">
                              {product.category === 'Medicines' 
                                ? `${item.quantity}` 
                                : item.quantity < 1000 
                                  ? `${item.quantity}g` 
                                  : `${(item.quantity/1000).toFixed(1)}kg`
                              }
                            </span>
                            <span className="text-xs text-slate-500">
                              {product.category === 'Medicines' ? 'count' : 'weight'}
                            </span>
                          </div>
                          <button 
                            onClick={() => {
                              const increment = product.category === 'Medicines' ? 1 : 50; // 1 count for medicines, 50g for herbs
                              updateQuantity(productId, item.quantity + increment);
                            }}
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
                            ₹{product.price} per {product.category === 'Medicines' ? 'unit' : 'gram'}
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemoveClick(item);
                          }}
                          className="w-12 h-12 bg-red-50 hover:bg-red-100 rounded-xl flex items-center justify-center transition-all duration-300 group/btn border border-red-200/50 hover:border-red-300 hover:shadow-lg"
                          title={`Remove ${product.name} from cart`}
                          type="button"
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

                <button 
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-5 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 text-lg mb-6"
                >
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

      {/* Confirmation Dialog */}
      {showRemoveDialog && itemToRemove && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 transform animate-in zoom-in-95 duration-300">
            <div className="text-center">
              {/* Warning Icon */}
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaExclamationTriangle className="text-red-500 text-2xl" />
              </div>

              {/* Title */}
              <h3 className="text-2xl font-playfair font-bold text-slate-900 mb-4">
                {itemToRemove.name === 'all items' ? 'Clear Entire Cart?' : 'Remove Item from Cart?'}
              </h3>

              {/* Message */}
              {itemToRemove.name === 'all items' ? (
                <>
                  <p className="text-slate-600 mb-2">
                    Are you sure you want to clear your entire cart?
                  </p>
                  <p className="text-lg font-semibold text-slate-900 mb-6">
                    This will remove all {cartItems.length} items
                  </p>
                </>
              ) : (
                <>
                  <p className="text-slate-600 mb-2">
                    Are you sure you want to remove
                  </p>
                  <p className="text-lg font-semibold text-slate-900 mb-6">
                    "{itemToRemove.name}"
                  </p>
                </>
              )}
              <p className="text-sm text-slate-500 mb-8">
                This action cannot be undone.
              </p>

              {/* Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={cancelRemove}
                  className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all duration-300 hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRemove}
                  className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  {itemToRemove.name === 'all items' ? 'Clear Cart' : 'Remove Item'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

export default EnhancedCart;
