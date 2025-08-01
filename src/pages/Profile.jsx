import { useState, useEffect } from 'react';
import { FaUser, FaShoppingCart, FaHeart, FaTrash, FaPlus, FaMinus, FaEdit, FaCalendarAlt, FaMapMarkerAlt, FaStar, FaSignOutAlt, FaCalendarCheck, FaHospital } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Profile() {
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user from localStorage first
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }

    fetchUserProfile();
    fetchCartItems();
    fetchWishlistItems();
    fetchAppointmentCount();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        // Update localStorage with fresh user data
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCartItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/cart', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCartItems(data.data.items || []);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      const localCart = JSON.parse(localStorage.getItem('cartItems') || '[]');
      setCartItems(localCart.map(item => ({
        productId: item,
        quantity: item.quantity || 1,
        price: item.price
      })));
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlistItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/wishlist', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setWishlistItems(data.data.items || []);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      const localWishlist = JSON.parse(localStorage.getItem('wishlistItems') || '[]');
      setWishlistItems(localWishlist.map(item => ({ productId: item })));
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/cart/remove/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setCartItems(prev => prev.filter(item => item.productId._id !== productId));
        window.dispatchEvent(new Event('cartUpdated'));
        toast.success('Item removed from cart');
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item');
    }
  };

  const updateCartQuantity = async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/cart/update/${productId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity: newQuantity })
      });

      if (response.ok) {
        setCartItems(prev => prev.map(item =>
          item.productId._id === productId
            ? { ...item, quantity: newQuantity }
            : item
        ));
        window.dispatchEvent(new Event('cartUpdated'));
        toast.success('Quantity updated');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/wishlist/remove/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setWishlistItems(prev => prev.filter(item => item.productId._id !== productId));
        window.dispatchEvent(new Event('wishlistUpdated'));
        toast.success('Item removed from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove item');
    }
  };

  const moveToCart = async (item) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/cart/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: item.productId._id,
          quantity: 1
        })
      });

      if (response.ok) {
        await removeFromWishlist(item.productId._id);
        await fetchCartItems();
        window.dispatchEvent(new Event('cartUpdated'));
        window.dispatchEvent(new Event('wishlistUpdated'));
        toast.success('Item moved to cart');
      }
    } catch (error) {
      console.error('Error moving to cart:', error);
      toast.error('Failed to move item to cart');
    }
  };

  const fetchAppointmentCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const [appointmentsRes, hospitalBookingsRes] = await Promise.all([
        fetch('http://localhost:5000/api/appointments/user', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/hospital-bookings', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      let totalCount = 0;

      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json();
        totalCount += (appointmentsData || []).length;
      }

      if (hospitalBookingsRes.ok) {
        const hospitalBookingsData = await hospitalBookingsRes.json();
        totalCount += (hospitalBookingsData.data || []).length;
      }

      setAppointmentCount(totalCount);
    } catch (error) {
      console.error('Error fetching appointment count:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    console.log('handleLogout function called');
    try {
      console.log('Starting logout process...');

      // Clear all user-related data
      console.log('Clearing localStorage...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('cartItems');
      localStorage.removeItem('wishlistItems');
      localStorage.removeItem('herbtradeCart');
      localStorage.removeItem('herbtradeWishlist');
      console.log('localStorage cleared');

      // Reset component state
      console.log('Resetting component state...');
      setUser(null);
      setCartItems([]);
      setWishlistItems([]);
      console.log('Component state reset');

      // Dispatch events to update other components
      console.log('Dispatching events...');
      window.dispatchEvent(new Event('userChanged'));
      window.dispatchEvent(new Event('cartUpdated'));
      window.dispatchEvent(new Event('wishlistUpdated'));
      console.log('Events dispatched');

      // Show success message
      console.log('Showing success toast...');
      toast.success('Logged out successfully');

      // Navigate to login
      console.log('Navigating to login...');
      navigate('/login');

      // Force refresh to clear any cached data
      console.log('Setting timeout for page refresh...');
      setTimeout(() => {
        console.log('Refreshing page...');
        window.location.reload();
      }, 100);

      console.log('Logout process completed successfully');
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Error during logout');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600 mx-auto"></div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 opacity-20 animate-pulse"></div>
              </div>
              <p className="mt-6 text-xl font-medium text-slate-700">Loading your profile...</p>
              <p className="mt-2 text-slate-500">Please wait while we fetch your information</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="card-ultra p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="relative group">
                <div className="w-32 h-32 bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl group-hover:shadow-emerald-300/50 transition-all duration-500 border-4 border-white">
                  <FaUser className="text-white text-4xl" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-green-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-4xl lg:text-5xl font-playfair font-bold text-slate-900 mb-3 tracking-tight">
                  {user?.name || (() => {
                    try {
                      const storedUser = localStorage.getItem('user');
                      return storedUser ? JSON.parse(storedUser).name : 'User';
                    } catch {
                      return 'User';
                    }
                  })()}
                </h1>
                <div className="space-y-2">
                  <p className="text-slate-600 text-lg flex items-center justify-center sm:justify-start gap-3">
                    <FaMapMarkerAlt className="text-emerald-500" />
                    {user?.email || (() => {
                      try {
                        const storedUser = localStorage.getItem('user');
                        return storedUser ? JSON.parse(storedUser).email : 'user@example.com';
                      } catch {
                        return 'user@example.com';
                      }
                    })()}
                  </p>
                  <p className="text-slate-500 flex items-center justify-center sm:justify-start gap-3">
                    <FaCalendarAlt className="text-emerald-500" />
                    Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '7/24/2025'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Edit Profile button clicked - event:', e);
                  console.log('Current user:', user);
                  console.log('Navigating to /edit-profile...');
                  try {
                    navigate('/edit-profile');
                    console.log('Navigation successful');
                  } catch (error) {
                    console.error('Navigation error:', error);
                  }
                }}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 group cursor-pointer"
                style={{ pointerEvents: 'auto', zIndex: 10 }}
                type="button"
              >
                <FaEdit className="group-hover:rotate-12 transition-transform duration-300" />
                Edit Profile
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Logout button clicked - event:', e);
                  console.log('Current user:', user);
                  console.log('Calling handleLogout...');
                  try {
                    handleLogout();
                    console.log('Logout function called successfully');
                  } catch (error) {
                    console.error('Logout error:', error);
                  }
                }}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 group cursor-pointer"
                style={{ pointerEvents: 'auto', zIndex: 10 }}
                type="button"
              >
                <FaSignOutAlt className="group-hover:translate-x-1 transition-transform duration-300" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="card-ultra p-8 text-center group hover:scale-105 transition-all duration-500">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:shadow-blue-300/50 transition-all duration-500">
              <FaShoppingCart className="text-white text-2xl" />
            </div>
            <h3 className="text-4xl font-bold text-slate-900 mb-2">{cartItems.length}</h3>
            <p className="text-slate-600 font-medium">Items in Cart</p>
          </div>
          <div className="card-ultra p-8 text-center group hover:scale-105 transition-all duration-500" style={{ animationDelay: '0.1s' }}>
            <div className="w-20 h-20 bg-gradient-to-br from-pink-400 via-pink-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:shadow-pink-300/50 transition-all duration-500">
              <FaHeart className="text-white text-2xl" />
            </div>
            <h3 className="text-4xl font-bold text-slate-900 mb-2">{wishlistItems.length}</h3>
            <p className="text-slate-600 font-medium">Wishlist Items</p>
          </div>
          <div
            className="card-ultra p-8 text-center group hover:scale-105 transition-all duration-500 cursor-pointer"
            style={{ animationDelay: '0.2s' }}
            onClick={() => {
              console.log('Bookings stats card clicked');
              navigate('/view-bookings');
            }}
          >
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:shadow-green-300/50 transition-all duration-500">
              <FaCalendarCheck className="text-white text-2xl" />
            </div>
            <h3 className="text-4xl font-bold text-slate-900 mb-2">{appointmentCount}</h3>
            <p className="text-slate-600 font-medium">My Bookings</p>
          </div>
          <div className="card-ultra p-8 text-center group hover:scale-105 transition-all duration-500" style={{ animationDelay: '0.3s' }}>
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:shadow-amber-300/50 transition-all duration-500">
              <FaStar className="text-white text-2xl" />
            </div>
            <h3 className="text-4xl font-bold text-slate-900 mb-2">4.8</h3>
            <p className="text-slate-600 font-medium">Rating</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 mb-8">
          <h2 className="text-3xl font-playfair font-bold text-slate-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => {
                console.log('View Bookings button clicked');
                navigate('/view-bookings');
              }}
              className="flex items-center space-x-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 hover:shadow-lg transition-all duration-300 group cursor-pointer"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-green-300/50 transition-all duration-300">
                <FaCalendarCheck className="text-white text-xl" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-slate-900">View Bookings</h3>
                <p className="text-sm text-slate-600">Manage appointments</p>
              </div>
            </button>

            <button
              onClick={() => {
                console.log('Find Hospitals button clicked');
                navigate('/hospitals');
              }}
              className="flex items-center space-x-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-300 group cursor-pointer"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-300/50 transition-all duration-300">
                <FaHospital className="text-white text-xl" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-slate-900">Find Hospitals</h3>
                <p className="text-sm text-slate-600">Book new appointment</p>
              </div>
            </button>

            <button
              onClick={() => {
                console.log('Browse Herbs button clicked');
                navigate('/herbs');
              }}
              className="flex items-center space-x-4 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200 hover:shadow-lg transition-all duration-300 group cursor-pointer"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-purple-300/50 transition-all duration-300">
                <FaShoppingCart className="text-white text-xl" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-slate-900">Browse Herbs</h3>
                <p className="text-sm text-slate-600">Explore catalog</p>
              </div>
            </button>
          </div>
        </div>

        {/* Cart and Wishlist */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Cart Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <FaShoppingCart className="text-white text-xl" />
                </div>
                {cartItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-semibold">
                    {cartItems.length}
                  </span>
                )}
              </div>
              <h2 className="text-3xl font-playfair font-bold text-slate-900">My Cart</h2>
            </div>
            
            {cartItems.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-32 h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <FaShoppingCart className="text-4xl text-slate-400" />
                </div>
                <p className="text-slate-600 text-xl font-medium mb-2">Your cart is empty</p>
                <p className="text-slate-400">Add some herbs to get started!</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {cartItems.map((item, index) => (
                  <div key={item.productId._id} className="bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 border border-slate-200/50" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="flex items-center gap-6">
                      <img
                        src={item.productId.image || '/placeholder.jpg'}
                        alt={item.productId.name}
                        className="w-20 h-20 object-cover rounded-xl shadow-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 text-lg truncate mb-1">{item.productId.name}</h3>
                        <p className="text-emerald-600 font-semibold text-lg">₹{item.price} × {item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateCartQuantity(item.productId._id, item.quantity - 1)}
                          className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center hover:bg-slate-50 hover:shadow-lg transition-all duration-200"
                        >
                          <FaMinus className="text-sm text-slate-600" />
                        </button>
                        <span className="w-10 text-center font-bold text-slate-900 text-lg">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.productId._id, item.quantity + 1)}
                          className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center hover:bg-slate-50 hover:shadow-lg transition-all duration-200"
                        >
                          <FaPlus className="text-sm text-slate-600" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.productId._id)}
                          className="w-10 h-10 bg-red-50 rounded-xl shadow-md flex items-center justify-center hover:bg-red-100 hover:shadow-lg transition-all duration-200 ml-2"
                        >
                          <FaTrash className="text-sm text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Wishlist Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <FaHeart className="text-white text-xl" />
                </div>
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-semibold">
                    {wishlistItems.length}
                  </span>
                )}
              </div>
              <h2 className="text-3xl font-playfair font-bold text-slate-900">My Wishlist</h2>
            </div>
            
            {wishlistItems.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-32 h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <FaHeart className="text-4xl text-slate-400" />
                </div>
                <p className="text-slate-600 text-xl font-medium mb-2">Your wishlist is empty</p>
                <p className="text-slate-400">Save items you love for later!</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {wishlistItems.map((item, index) => (
                  <div key={item.productId._id} className="bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 border border-slate-200/50" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="flex items-center gap-6">
                      <img
                        src={item.productId.image || '/placeholder.jpg'}
                        alt={item.productId.name}
                        className="w-20 h-20 object-cover rounded-xl shadow-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 text-lg truncate mb-1">{item.productId.name}</h3>
                        <p className="text-emerald-600 font-semibold text-lg">₹{item.productId.price}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => moveToCart(item)}
                          className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                        >
                          Add to Cart
                        </button>
                        <button
                          onClick={() => removeFromWishlist(item.productId._id)}
                          className="w-10 h-10 bg-red-50 rounded-xl shadow-md flex items-center justify-center hover:bg-red-100 hover:shadow-lg transition-all duration-200"
                        >
                          <FaTrash className="text-sm text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>


        </div>
      </div>
    </div>
  );
}

export default Profile;
