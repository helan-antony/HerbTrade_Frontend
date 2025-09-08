import { 
  Box, Typography, Grid, Card, CardContent, CardMedia, TextField, Button, 
  Chip, Rating, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Snackbar, Alert, Badge,
  IconButton, Drawer, List, ListItem, ListItemText, Divider
} from "@mui/material";
import { 
  FaSearch, FaShoppingBasket, FaFilter, FaStar, FaHeart, 
  FaShoppingCart, FaPlus, FaMinus, FaTimes 
} from "react-icons/fa";
import { useState, useEffect } from "react";
import axios from "axios";
import API_ENDPOINTS, { apiCall } from "../config/api";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getAuthHeaders, logout } from '../utils/auth';

function HerbCatalog() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDialog, setProductDialog] = useState(false);
  const [cart, setCart] = useState([]);
  const [cartDrawer, setCartDrawer] = useState(false);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    loadCartFromStorage();
    loadWishlistFromStorage();

    // Listen for product updates from seller dashboard
    const handleProductUpdate = () => {
      fetchProducts();
    };

    window.addEventListener('productAdded', handleProductUpdate);
    window.addEventListener('productUpdated', handleProductUpdate);
    window.addEventListener('productDeleted', handleProductUpdate);

    return () => {
      window.removeEventListener('productAdded', handleProductUpdate);
      window.removeEventListener('productUpdated', handleProductUpdate);
      window.removeEventListener('productDeleted', handleProductUpdate);
    };
  }, [search, selectedCategory, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCategory) params.append('category', selectedCategory);
      if (sortBy) params.append('sort', sortBy);

      const response = await axios.get(`http://localhost:5000/api/products?${params}`);

      // If no products from API, use sample data
      if (!response.data || response.data.length === 0) {
        const { sampleHerbs } = await import('../utils/sampleData.js');
        setProducts(sampleHerbs);
      } else {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products/categories/list');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const loadCartFromStorage = () => {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      // Convert old format to new format
      const cartData = JSON.parse(savedCart);
      if (cartData.length > 0 && cartData[0].product) {
        // Old format with product wrapper
        setCart(cartData);
      } else {
        // New format - convert to old format for compatibility
        const convertedCart = cartData.map(item => ({
          product: item,
          quantity: item.quantity || 1
        }));
        setCart(convertedCart);
      }
    }
  };

  const loadWishlistFromStorage = () => {
    const savedWishlist = localStorage.getItem('wishlistItems');
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }
  };

  const saveCartToStorage = (newCart) => {
    try {
      // Compact product snapshot to reduce storage size
      const compactCart = newCart.map(item => ({
        product: {
          _id: item.product._id,
          name: item.product.name,
          price: item.product.price,
          image: item.product.image,
          category: item.product.category,
        },
        quantity: item.quantity || 1,
      }));

      // Save a single authoritative key (avoid duplicating large data)
      localStorage.setItem('herbtradeCart', JSON.stringify(compactCart));

      // Save in Cart page format but keep product compact
      const cartItems = compactCart.map((item, index) => ({
        _id: `cart-${item.product._id}-${Date.now()}-${index}`,
        productId: item.product._id,
        quantity: item.quantity,
        product: item.product,
      }));
      localStorage.setItem('cartItems', JSON.stringify(cartItems));

      // Trigger navbar count update
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (e) {
      console.error('saveCartToStorage quota error:', e);
      toast.error('Storage is full. Could not save cart locally.');
      // Best-effort: at least update the count without saving bulky data
      window.dispatchEvent(new Event('cartUpdated'));
    }
  };

  const saveWishlistToStorage = (newWishlist) => {
    try {
      const compact = newWishlist.map(item => ({
        _id: item._id,
        name: item.name,
        price: item.price,
        image: item.image,
        category: item.category,
      }));
      localStorage.setItem('herbtradeWishlist', JSON.stringify(compact));
      localStorage.setItem('wishlistItems', JSON.stringify(compact));
      window.dispatchEvent(new Event('wishlistUpdated'));
    } catch (e) {
      console.error('saveWishlistToStorage quota error:', e);
      toast.error('Storage is full. Could not save wishlist locally.');
      window.dispatchEvent(new Event('wishlistUpdated'));
    }
  };

  const addToCart = async (product, quantity = 1) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to add items to cart');
        return;
      }

      console.log('Adding to cart:', { productId: product._id, quantity });

      // Add to backend (use centralized API helper)
      const response = await apiCall(API_ENDPOINTS.CART.ADD, {
        method: 'POST',
        body: JSON.stringify({ productId: product._id, quantity })
      });

      let responseData = null;
      try {
        responseData = await response.json();
      } catch (_) {
        // Some success responses may have no body
      }

      if (response.ok && (responseData?.success !== false)) {
        // Update local state
        const existingItem = cart.find(item => item.product._id === product._id);
        let newCart;

        if (existingItem) {
          newCart = cart.map(item =>
            item.product._id === product._id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          newCart = [...cart, { product, quantity }];
        }

        console.log('Updating local cart:', newCart);
        setCart(newCart);
        saveCartToStorage(newCart);
        toast.success(`${product.name} added to cart!`);
      } else {
        const errorMsg = responseData?.message || responseData?.error || `Failed to add to cart (status ${response.status})`;
        console.error('Backend error:', responseData);
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  const removeFromCart = (productId) => {
    const newCart = cart.filter(item => item.product._id !== productId);
    setCart(newCart);
    saveCartToStorage(newCart);
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const newCart = cart.map(item =>
      item.product._id === productId
        ? { ...item, quantity }
        : item
    );
    setCart(newCart);
    saveCartToStorage(newCart);
  };

  const toggleWishlist = async (product) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to manage wishlist');
        return;
      }

      const isInWishlist = wishlist.some(item => item._id === product._id);

      if (isInWishlist) {
        // Remove from wishlist
        const response = await fetch(`http://localhost:5000/api/wishlist/remove/${product._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const newWishlist = wishlist.filter(item => item._id !== product._id);
          setWishlist(newWishlist);
          saveWishlistToStorage(newWishlist);
          toast.info(`${product.name} removed from wishlist`);
        }
      } else {
        // Add to wishlist (use centralized API helper)
        const response = await apiCall(API_ENDPOINTS.WISHLIST.ADD, {
          method: 'POST',
          body: JSON.stringify({ productId: product._id })
        });

        let responseData = null;
        try {
          responseData = await response.json();
        } catch (_) {
          // Some success responses may have no body
        }

        if (response.ok && (responseData?.success !== false)) {
          const newWishlist = [...wishlist, product];
          setWishlist(newWishlist);
          saveWishlistToStorage(newWishlist);
          toast.success(`${product.name} added to wishlist!`);
        } else {
          const errorMsg = responseData?.message || responseData?.error || `Failed to add to wishlist (status ${response.status})`;
          toast.error(errorMsg);
        }
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      toast.error('Failed to update wishlist');
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setProductDialog(true);
  };

  const getQualityColor = (quality) => {
    switch (quality) {
      case 'Organic': return '#4caf50';
      case 'Premium': return '#ff9800';
      default: return '#2196f3';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 pt-24 pb-12 relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-5"
        style={{ backgroundImage: 'url(/assets/bg.png)' }}
      />
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-playfair font-bold text-slate-900 tracking-tight">
              Herb Catalog
            </h1>
            <p className="text-lg text-slate-600 font-medium">
              🌿 Discover nature's finest healing herbs
            </p>
          </div>
          <button
            onClick={() => setCartDrawer(true)}
            className="relative p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl border border-white/50 transition-all duration-300 hover:-translate-y-1 group"
          >
            <FaShoppingCart className="text-2xl text-emerald-600 group-hover:text-emerald-700 transition-colors" />
            {getCartItemCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
                {getCartItemCount()}
              </span>
            )}
          </button>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 p-6 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Search Herbs
              </label>
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-600" />
                <input
                  type="text"
                  placeholder="Search herbs (e.g. turmeric for inflammation)"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/90 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-300/50 focus:border-emerald-500 transition-all duration-300 text-slate-900 placeholder-slate-500"
                />
              </div>
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-4 bg-white/90 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-300/50 focus:border-emerald-500 transition-all duration-300 text-slate-900"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="w-full px-4 py-4 bg-white/90 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-300/50 focus:border-emerald-500 transition-all duration-300 text-slate-900"
              >
                <option value="newest">Newest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="text-lg text-slate-600 font-medium">Loading herbs...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <div key={product._id} className="card-product group">
                <div className="relative overflow-hidden rounded-t-3xl">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-56 object-cover cursor-pointer transition-transform duration-700 group-hover:scale-110"
                    onClick={() => handleProductClick(product)}
                  />

                  {/* Wishlist Button */}
                  <button
                    onClick={() => toggleWishlist(product)}
                    className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-sm border border-white/30 transition-all duration-300 hover:scale-110 ${
                      wishlist.some(item => item._id === product._id)
                        ? 'bg-red-500/90 text-white'
                        : 'bg-white/90 text-slate-600 hover:text-red-500'
                    }`}
                  >
                    <FaHeart className="text-sm" />
                  </button>

                  {/* Quality Badge */}
                  <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold text-white ${
                    product.quality === 'Organic' ? 'bg-green-500' :
                    product.quality === 'Premium' ? 'bg-orange-500' :
                    'bg-blue-500'
                  }`}>
                    {product.quality}
                  </div>

                  {/* Grade Badge */}
                  {product.grade && (
                    <div className={`absolute top-14 left-4 px-2 py-1 rounded-full text-xs font-bold text-white ${
                      product.grade === 'Premium' ? 'bg-purple-500' :
                      product.grade === 'A+' ? 'bg-emerald-500' :
                      'bg-teal-500'
                    }`}>
                      {product.grade}
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <h3
                    className="text-xl font-playfair font-bold text-slate-900 mb-2 cursor-pointer hover:text-emerald-600 transition-colors duration-300"
                    onClick={() => handleProductClick(product)}
                  >
                    {product.name}
                  </h3>

                  <p className="text-slate-600 text-sm mb-4 flex-grow leading-relaxed">
                    {(product.description || '').substring(0, 100)}...
                  </p>

                  {/* Rating */}
                  <div className="flex items-center mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={`text-sm ${i < (product.averageRating || 0) ? 'text-yellow-400' : 'text-slate-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-slate-500 ml-2">
                      ({product.totalRatings || 0} reviews)
                    </span>
                  </div>

                  {/* Uses Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(product.uses || []).slice(0, 2).map(use => (
                      <span
                        key={use}
                        className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200"
                      >
                        {use}
                      </span>
                    ))}
                  </div>

                  {/* Price */}
                  <div className="text-2xl font-bold text-emerald-600 mb-3">
                    ₹{product.price}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        console.log('Add to Cart button clicked!', product);
                        addToCart(product);
                      }}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 relative z-50"
                      style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                    >
                      <FaShoppingBasket className="text-sm" />
                      Add to Cart
                    </button>

                    <button
                      onClick={() => toggleWishlist(product)}
                      className={`px-3 py-2.5 rounded-lg transition-all duration-200 relative z-50 ${
                        wishlist.some(item => item._id === product._id)
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-red-500'
                      }`}
                      style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                      title={wishlist.some(item => item._id === product._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    >
                      <FaHeart className="text-sm" />
                    </button>
                  </div>

                  {/* Stock Warning */}
                  {product.inStock < 10 && (
                    <div className="mt-3 text-xs text-red-600 font-medium bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                      ⚠️ Only {product.category === 'Medicines' 
                        ? `${product.inStock} ${product.dosageForm || 'units'}` 
                        : (product.inStock < 1000 ? `${product.inStock}g` : `${(product.inStock/1000).toFixed(1)}kg`)
                      } left in stock!
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Product Detail Dialog */}
      <Dialog
        open={productDialog}
        onClose={() => setProductDialog(false)}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }
        }}
      >
        {selectedProduct && (
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl font-playfair font-bold text-slate-900">
                {selectedProduct.name}
              </h2>
              <button
                onClick={() => setProductDialog(false)}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors duration-200"
              >
                <FaTimes className="text-slate-600" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full rounded-2xl shadow-lg"
                />
              </div>

              <div className="space-y-6">
                <div className="text-4xl font-bold text-emerald-600">
                  ₹{selectedProduct.price}
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={`text-lg ${i < (selectedProduct.averageRating || 0) ? 'text-yellow-400' : 'text-slate-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-slate-600">
                    ({selectedProduct.totalRatings || 0} reviews)
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className={`inline-block px-4 py-2 rounded-full text-white font-semibold ${
                    selectedProduct.quality === 'Organic' ? 'bg-green-500' :
                    selectedProduct.quality === 'Premium' ? 'bg-orange-500' :
                    'bg-blue-500'
                  }`}>
                    {selectedProduct.quality}
                  </div>
                  
                  {selectedProduct.grade && (
                    <div className={`inline-block px-4 py-2 rounded-full text-white font-semibold ${
                      selectedProduct.grade === 'Premium' ? 'bg-purple-500' :
                      selectedProduct.grade === 'A+' ? 'bg-emerald-500' :
                      'bg-teal-500'
                    }`}>
                      Grade {selectedProduct.grade}
                    </div>
                  )}
                </div>

                <p className="text-slate-700 leading-relaxed">
                  {selectedProduct.description}
                </p>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Uses:</h3>
                  <div className="flex flex-wrap gap-2">
                    {(selectedProduct.uses || []).map(use => (
                      <span
                        key={use}
                        className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full border border-emerald-200"
                      >
                        {use}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Medicine-specific details */}
                {selectedProduct.category === 'Medicines' && (
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-purple-800 mb-4">Medicine Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedProduct.dosageForm && (
                        <div>
                          <span className="text-sm font-medium text-slate-600">Dosage Form:</span>
                          <p className="text-slate-900 capitalize">{selectedProduct.dosageForm}</p>
                        </div>
                      )}
                      
                      {selectedProduct.strength && (
                        <div>
                          <span className="text-sm font-medium text-slate-600">Strength:</span>
                          <p className="text-slate-900">{selectedProduct.strength}</p>
                        </div>
                      )}
                      
                      {selectedProduct.manufacturer && (
                        <div>
                          <span className="text-sm font-medium text-slate-600">Manufacturer:</span>
                          <p className="text-slate-900">{selectedProduct.manufacturer}</p>
                        </div>
                      )}
                      
                      {selectedProduct.batchNumber && (
                        <div>
                          <span className="text-sm font-medium text-slate-600">Batch Number:</span>
                          <p className="text-slate-900">{selectedProduct.batchNumber}</p>
                        </div>
                      )}
                      
                      {selectedProduct.expiryDate && (
                        <div>
                          <span className="text-sm font-medium text-slate-600">Expiry Date:</span>
                          <p className="text-slate-900">{new Date(selectedProduct.expiryDate).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>

                    {selectedProduct.activeIngredients && selectedProduct.activeIngredients.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-slate-600">Active Ingredients:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedProduct.activeIngredients.map(ingredient => (
                            <span
                              key={ingredient}
                              className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full border border-green-200"
                            >
                              {ingredient}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedProduct.indications && selectedProduct.indications.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-slate-600">Indications:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedProduct.indications.map(indication => (
                            <span
                              key={indication}
                              className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full border border-blue-200"
                            >
                              {indication}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedProduct.dosage && (
                      <div>
                        <span className="text-sm font-medium text-slate-600">Dosage Instructions:</span>
                        <p className="text-slate-900 bg-white p-3 rounded-lg border border-slate-200 mt-1">
                          {selectedProduct.dosage}
                        </p>
                      </div>
                    )}

                    {selectedProduct.contraindications && (
                      <div>
                        <span className="text-sm font-medium text-slate-600">Contraindications:</span>
                        <p className="text-slate-900 bg-yellow-50 p-3 rounded-lg border border-yellow-200 mt-1">
                          ⚠️ {selectedProduct.contraindications}
                        </p>
                      </div>
                    )}

                    {selectedProduct.sideEffects && (
                      <div>
                        <span className="text-sm font-medium text-slate-600">Side Effects:</span>
                        <p className="text-slate-900 bg-red-50 p-3 rounded-lg border border-red-200 mt-1">
                          ⚠️ {selectedProduct.sideEffects}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl">
                  📦 Stock: {selectedProduct.category === 'Medicines' 
                    ? `${selectedProduct.inStock} ${selectedProduct.dosageForm || 'units'}` 
                    : (selectedProduct.inStock < 1000 ? `${selectedProduct.inStock}g` : `${(selectedProduct.inStock/1000).toFixed(1)}kg`)
                  } available
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-slate-200">
              <button
                onClick={() => toggleWishlist(selectedProduct)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                  wishlist.some(item => item._id === selectedProduct._id)
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <FaHeart />
                <span>
                  {wishlist.some(item => item._id === selectedProduct._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                </span>
              </button>
              <button
                onClick={() => {
                  console.log('Modal Add to Cart button clicked!', selectedProduct);
                  addToCart(selectedProduct);
                  setProductDialog(false);
                }}
                className="btn-primary flex items-center space-x-2"
              >
                <FaShoppingBasket />
                <span>Add to Cart</span>
              </button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Cart Drawer */}
      <Drawer
        anchor="right"
        open={cartDrawer}
        onClose={() => setCartDrawer(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 420,
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            backdropFilter: 'blur(20px)'
          }
        }}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-playfair font-bold text-slate-900">
              Shopping Cart ({getCartItemCount()})
            </h2>
            <button
              onClick={() => setCartDrawer(false)}
              className="p-2 rounded-full hover:bg-slate-200 transition-colors duration-200"
            >
              <FaTimes className="text-slate-600" />
            </button>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent mb-6"></div>

          {cart.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="text-6xl">🛒</div>
                <p className="text-slate-500 font-medium">Your cart is empty</p>
                <p className="text-sm text-slate-400">Add some herbs to get started!</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto space-y-4 scrollbar-ultra">
                {cart.map(item => (
                  <div key={item.product._id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-lg">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-xl"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 mb-1">
                          {item.product.name}
                        </h4>
                        <p className="text-sm text-slate-600">
                          ₹{item.product.price} per gram
                        </p>
                        <div className="flex items-center mt-2 space-x-2">
                          <button
                            onClick={() => updateCartQuantity(item.product._id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-emerald-100 hover:bg-emerald-200 flex items-center justify-center transition-colors duration-200"
                          >
                            <FaMinus className="text-xs text-emerald-600" />
                          </button>
                          <span className="w-12 text-center font-semibold text-slate-900 text-xs">
                            {item.quantity < 1000 ? `${item.quantity}g` : `${(item.quantity/1000).toFixed(1)}kg`}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.product._id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-emerald-100 hover:bg-emerald-200 flex items-center justify-center transition-colors duration-200"
                          >
                            <FaPlus className="text-xs text-emerald-600" />
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-emerald-600 mb-2">
                          ₹{item.product.price * item.quantity}
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product._id)}
                          className="p-2 rounded-full hover:bg-red-100 text-red-500 hover:text-red-600 transition-colors duration-200"
                        >
                          <FaTimes className="text-xs" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xl font-playfair font-bold text-slate-900">Total:</span>
                  <span className="text-2xl font-bold text-emerald-600">
                    ₹{getCartTotal()}
                  </span>
                </div>

                <button
                  className="w-full btn-primary text-lg py-4"
                  onClick={() => {
                    toast.success('Proceeding to checkout...');
                    // Add checkout logic here
                  }}
                >
                  Proceed to Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </Drawer>
      </div>
    </div>
  );
}

export default HerbCatalog; 


