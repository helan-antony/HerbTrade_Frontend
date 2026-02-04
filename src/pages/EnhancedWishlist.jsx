import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaHeart, 
  FaShoppingCart, 
  FaTrash, 
  FaArrowLeft,
  FaStar,
  FaHeartBroken,
  FaLeaf,
  FaShieldAlt,
  FaCalendarAlt,
  FaUserFriends,
  FaCheckCircle,
  FaTasks
} from 'react-icons/fa';

// Auth utility functions (inline to avoid import issues)
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

function EnhancedWishlist() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchWishlistItems();
  }, [navigate]);

  const fetchWishlistItems = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch wishlist items (herbal products)
      const wishlistResponse = await axios.get('http://localhost:5000/api/wishlist', {
        headers: getAuthHeaders()
      });

      // Fetch newsletter programs
      const newsletterResponse = await axios.get('http://localhost:5000/api/newsletters', {
        headers: getAuthHeaders()
      });

      // Combine both types of items
      const combinedItems = [];

      // Process wishlist items (herbal products)
      const wishlistItems = wishlistResponse.data.data?.items || [];
      wishlistItems.forEach(item => {
        const productData = item.productId;
        combinedItems.push({
          _id: typeof productData === 'object' ? productData._id : productData,
          name: item.productName || (typeof productData === 'object' ? productData.name : ''),
          price: item.productPrice || (typeof productData === 'object' ? productData.price : 0),
          image: item.productImage || (typeof productData === 'object' ? productData.image : ''),
          category: item.productCategory || (typeof productData === 'object' ? productData.category : ''),
          description: typeof productData === 'object' ? productData.description : '',
          grade: typeof productData === 'object' ? productData.grade : '',
          product: typeof productData === 'object' ? productData : null,
          isWellnessProgram: false
        });
      });

      // Process newsletter programs
      const newsletterPrograms = (newsletterResponse.data.newsletters || newsletterResponse.data || []).filter(program => 
        program.programType === 'wellness_program'
      );
      if (Array.isArray(newsletterPrograms)) {
        newsletterPrograms.forEach(program => {
          if (program && program._id) {
            combinedItems.push({
              _id: program._id,
              name: program.programName || program.title || 'Untitled Program',
              description: program.programDescription || program.content || 'No description available',
              price: 0,  // Newsletter programs are typically free
              category: program.programCategory || program.category || 'wellness',
              image: '',
              duration: program.programDuration || 0,
              difficulty: program.programDifficulty || 'beginner',
              targetAudience: program.programTargetAudience || [],
              creator: program.programCoachId || null,
              dailyTasks: program.programDailyTasks || [],
              weeklyMilestones: program.programWeeklyMilestones || [],
              prerequisites: program.programPrerequisites || [],
              benefits: program.programBenefits || [],
              status: program.programStatus || 'published',
              enrolledUsers: [],
              createdAt: program.publishedDate || null,
              updatedAt: program.publishedDate || null,
              __v: program.__v || 0,
              isWellnessProgram: true
            });
          }
        });
      }

      setWishlistItems(combinedItems);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      if (error.response?.status === 401) {
        logout();
        return;
      }

      // Fallback to localStorage
      try {
        const localWishlist = JSON.parse(localStorage.getItem('wishlistItems') || '[]');
        setWishlistItems(localWishlist);
      } catch (e) {
        setError('Failed to load wishlist items');
      }
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (itemId, isWellnessProgram = false) => {
    try {
      if (isWellnessProgram) {
        // Handle wellness program removal (if you have a specific endpoint)
        // For now, just remove from local state
        setWishlistItems(items => items.filter(item => item._id !== itemId));
      } else {
        // Handle product removal
        await axios.delete(`http://localhost:5000/api/wishlist/remove/${itemId}`, {
          headers: getAuthHeaders()
        });
        setWishlistItems(items => items.filter(item => {
          const id = item.product?._id || item._id;
          return id !== itemId;
        }));
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      if (error.response?.status === 401) {
        logout();
        return;
      }
      // Fallback to localStorage removal
      const updatedItems = wishlistItems.filter(item => {
        const id = item.product?._id || item._id;
        return id !== itemId;
      });
      setWishlistItems(updatedItems);
    }
  };

  const addToCart = async (product) => {
    if (product.isWellnessProgram) {
      // Handle wellness program enrollment (redirect to program page or enrollment)
      navigate(`/wellness-programs/${product._id}`);
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/cart/add', {
        productId: product._id,
        quantity: 1
      }, {
        headers: getAuthHeaders()
      });
      
      // Update localStorage cart as fallback
      const existingCart = JSON.parse(localStorage.getItem('cartItems') || '[]');
      const existingItemIndex = existingCart.findIndex(item => 
        (item.product?._id || item._id) === product._id
      );
      
      if (existingItemIndex > -1) {
        existingCart[existingItemIndex].quantity += 1;
      } else {
        existingCart.push({
          _id: 'cart-' + Date.now(),
          product: product,
          quantity: 1
        });
      }
      
      localStorage.setItem('cartItems', JSON.stringify(existingCart));
      alert('Item added to cart successfully!');
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (error.response?.status === 401) {
        logout();
        return;
      }
      
      // Fallback to localStorage only
      const existingCart = JSON.parse(localStorage.getItem('cartItems') || '[]');
      const existingItemIndex = existingCart.findIndex(item => 
        (item.product?._id || item._id) === product._id
      );
      
      if (existingItemIndex > -1) {
        existingCart[existingItemIndex].quantity += 1;
      } else {
        existingCart.push({
          _id: 'cart-' + Date.now(),
          product: product,
          quantity: 1
        });
      }
      
      localStorage.setItem('cartItems', JSON.stringify(existingCart));
      alert('Item added to cart successfully!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        <div className="text-center relative z-10">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-emerald-200 border-t-emerald-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 opacity-20 animate-pulse"></div>
          </div>
          <h2 className="text-2xl font-playfair font-bold text-slate-900 mb-2">Loading your wishlist...</h2>
          <p className="text-slate-600">Please wait while we fetch your favorite items</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-8 pt-24 relative">
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-5" style={{ backgroundImage: 'url(/assets/bg.png)' }} />
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
              <FaHeart className="mr-4 text-red-500" />
              My Wishlist
            </h1>
            <p className="text-slate-600 font-medium">Your favorite herbal treasures & wellness programs</p>
          </div>
          <div className="w-48"></div>
        </div>

        {error && (
          <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-3xl p-6 mb-8 shadow-lg">
            <div className="flex items-center justify-center">
              <FaShieldAlt className="text-red-500 mr-3" />
              <p className="text-red-700 font-semibold text-center">{error}</p>
            </div>
          </div>
        )}

        {wishlistItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="relative inline-block mb-8">
              <FaHeartBroken className="text-8xl text-slate-300 mx-auto" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <FaLeaf className="text-white text-sm" />
              </div>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-slate-900 mb-4">
              Your wishlist is empty
            </h2>
            <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Save your favorite herbal products and wellness programs to your wishlist!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/herbs')}
                className="group bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold px-10 py-5 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center text-lg"
              >
                <FaHeart className="mr-3 group-hover:scale-110 transition-transform duration-300" />
                Discover Products
              </button>
              <button 
                onClick={() => navigate('/wellness-programs')}
                className="group bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold px-10 py-5 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center text-lg"
              >
                <FaHeart className="mr-3 group-hover:scale-110 transition-transform duration-300" />
                Explore Wellness Programs
              </button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {wishlistItems.map((item) => {
              const product = item.product || item;
              return (
                <div key={product._id} className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-white/50 hover:border-emerald-200/50">
                  <div className="relative">
                    <img 
                      src={product.image || '/api/placeholder/300/200'} 
                      alt={product.name}
                      className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = '/api/placeholder/300/200';
                      }}
                    />
                    <button 
                      onClick={() => removeFromWishlist(product._id, product.isWellnessProgram)}
                      className="absolute top-4 right-4 w-12 h-12 bg-white/90 hover:bg-red-100 rounded-full flex items-center justify-center transition-all duration-300 group/btn shadow-lg"
                    >
                      <FaTrash className="text-red-500 group-hover/btn:scale-110 transition-transform duration-300" />
                    </button>
                    
                    {product.isWellnessProgram ? (
                      <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                        Wellness Program
                      </div>
                    ) : (
                      product.quality && (
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                          {product.quality}
                        </div>
                      )
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-playfair font-bold text-slate-900 mb-3 line-clamp-2">
                      {product.name}
                    </h3>
                    
                    <p className="text-slate-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Wellness Program specific info */}
                    {product.isWellnessProgram && (
                      <div className="mb-4 space-y-2">
                        <div className="flex items-center text-sm text-slate-600">
                          <FaCalendarAlt className="mr-2" />
                          <span>{product.duration} days</span>
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <FaUserFriends className="mr-2" />
                          <span className="capitalize">{product.difficulty} level</span>
                        </div>
                        {product.dailyTasks && product.dailyTasks.length > 0 && (
                          <div className="flex items-center text-sm text-slate-600">
                            <FaTasks className="mr-2" />
                            <span>{product.dailyTasks.length} daily tasks</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Rating */}
                    {product.averageRating && (
                      <div className="flex items-center mb-4">
                        <div className="flex text-yellow-400 mr-2">
                          {[1,2,3,4,5].map(i => (
                            <FaStar 
                              key={i} 
                              className={i <= product.averageRating ? 'text-yellow-400' : 'text-slate-300'} 
                            />
                          ))}
                        </div>
                        <span className="text-sm text-slate-600 font-medium">
                          ({product.totalRatings || 0})
                        </span>
                      </div>
                    )}

                    {/* Category */}
                    <div className="mb-4">
                      <span className={`px-4 py-2 rounded-full text-sm font-bold border ${
                        product.isWellnessProgram 
                          ? 'bg-gradient-to-r from-purple-100 to-indigo-50 text-purple-700 border-purple-200/50' 
                          : 'bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 border-emerald-200/50'
                      }`}>
                        {product.category}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between mb-6">
                      <div className={`text-2xl font-bold ${
                        product.isWellnessProgram 
                          ? 'text-purple-600' 
                          : 'bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent'
                      }`}>
                        {product.isWellnessProgram ? 'Free' : `₹${product.price}`}
                      </div>
                      {product.isWellnessProgram ? (
                        <span className="text-purple-600 text-sm font-bold bg-purple-50 px-3 py-1 rounded-full">
                          {product.status}
                        </span>
                      ) : product.inStock > 0 ? (
                        <span className="text-emerald-600 text-sm font-bold bg-emerald-50 px-3 py-1 rounded-full">In Stock</span>
                      ) : (
                        <span className="text-red-600 text-sm font-bold bg-red-50 px-3 py-1 rounded-full">Out of Stock</span>
                      )}
                    </div>

                    {/* Actions */}
                    <button 
                      onClick={() => addToCart(product)}
                      disabled={!product.isWellnessProgram && product.inStock === 0}
                      className={`w-full font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center ${
                        product.isWellnessProgram
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
                          : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-400 disabled:to-slate-500 text-white'
                      }`}
                    >
                      <FaShoppingCart className="mr-2" />
                      {product.isWellnessProgram ? 'View Program' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default EnhancedWishlist;