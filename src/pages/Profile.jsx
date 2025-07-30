import { useState, useEffect } from 'react';
import { FaUser, FaShoppingCart, FaHeart, FaTrash, FaPlus, FaMinus, FaEdit, FaCalendarAlt, FaMapMarkerAlt, FaStar, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Profile() {
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
    fetchCartItems();
    fetchWishlistItems();
    fetchAppointments();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
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

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/appointments/user', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cartItems');
    localStorage.removeItem('wishlistItems');
    toast.success('Logged out successfully');
    navigate('/login');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 mb-8">
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
                  {user?.name || 'Teena Ram'}
                </h1>
                <div className="space-y-2">
                  <p className="text-slate-600 text-lg flex items-center justify-center sm:justify-start gap-3">
                    <FaMapMarkerAlt className="text-emerald-500" />
                    {user?.email || 'teenaram@gmail.com'}
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
                onClick={() => navigate('/edit-profile')}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 group"
              >
                <FaEdit className="group-hover:rotate-12 transition-transform duration-300" />
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 group"
              >
                <FaSignOutAlt className="group-hover:translate-x-1 transition-transform duration-300" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 text-center group hover:scale-105 transition-all duration-500">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:shadow-blue-300/50 transition-all duration-500">
              <FaShoppingCart className="text-white text-2xl" />
            </div>
            <h3 className="text-4xl font-bold text-slate-900 mb-2">{cartItems.length}</h3>
            <p className="text-slate-600 font-medium">Items in Cart</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 text-center group hover:scale-105 transition-all duration-500" style={{ animationDelay: '0.1s' }}>
            <div className="w-20 h-20 bg-gradient-to-br from-pink-400 via-pink-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:shadow-pink-300/50 transition-all duration-500">
              <FaHeart className="text-white text-2xl" />
            </div>
            <h3 className="text-4xl font-bold text-slate-900 mb-2">{wishlistItems.length}</h3>
            <p className="text-slate-600 font-medium">Wishlist Items</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 text-center group hover:scale-105 transition-all duration-500" style={{ animationDelay: '0.2s' }}>
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:shadow-amber-300/50 transition-all duration-500">
              <FaStar className="text-white text-2xl" />
            </div>
            <h3 className="text-4xl font-bold text-slate-900 mb-2">4.8</h3>
            <p className="text-slate-600 font-medium">Rating</p>
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

          {/* Appointments Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <FaCalendarAlt className="text-white text-xl" />
                </div>
                {appointments.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-semibold">
                    {appointments.length}
                  </span>
                )}
              </div>
              <h2 className="text-3xl font-playfair font-bold text-slate-900">My Appointments</h2>
            </div>
            
            {appointments.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-32 h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <FaCalendarAlt className="text-4xl text-slate-400" />
                </div>
                <p className="text-slate-600 text-xl font-medium mb-2">No appointments scheduled</p>
                <p className="text-slate-400">Book an appointment with our partner hospitals!</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {appointments.map((appointment, index) => (
                  <div key={appointment._id} className="bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 border border-slate-200/50" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="flex items-start gap-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <FaUser className="text-white text-xl" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 text-lg mb-2">{appointment.doctorName}</h3>
                        <p className="text-slate-600 mb-1"><strong>Hospital:</strong> {appointment.hospitalName}</p>
                        <p className="text-slate-600 mb-1"><strong>Date:</strong> {appointment.date}</p>
                        <p className="text-slate-600 mb-1"><strong>Time:</strong> {appointment.time}</p>
                        <p className="text-slate-600 mb-1"><strong>Reason:</strong> {appointment.reason}</p>
                        <p className="text-slate-600"><strong>Patient:</strong> {appointment.patientName}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          appointment.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {appointment.status || 'pending'}
                        </span>
                        <p className="text-xs text-slate-500">
                          {appointment.createdAt ? new Date(appointment.createdAt).toLocaleDateString() : 'Recent'}
                        </p>
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
