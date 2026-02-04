import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Leaf,
  Heart,
  ShoppingCart,
  ChevronDown,
  Menu,
  X,
  Search,
  Bell,
  Settings,
  LogOut,
  Package,
  MapPin,
  BookOpen,
  Sparkles,
  Calendar,
  Shield,
  MessageCircle
} from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

function Navbar() {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const navigate = useNavigate();

  const fetchCartCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch('http://localhost:5000/api/cart', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          const count = data.data.items?.reduce((total, item) => total + (item.quantity || 1), 0) || 0;
          setCartCount(count);
        } else if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setCartCount(0);
          setWishlistCount(0);
        }
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
      const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      const count = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
      setCartCount(count);
    }
  };

  const fetchWishlistCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch('http://localhost:5000/api/wishlist', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setWishlistCount(data.data.items?.length || 0);
        } else if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setCartCount(0);
          setWishlistCount(0);
        }
      }
    } catch (error) {
      console.error('Error fetching wishlist count:', error);
      const wishlistItems = JSON.parse(localStorage.getItem('wishlistItems') || '[]');
      setWishlistCount(wishlistItems.length);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      fetchCartCount();
      fetchWishlistCount();
    }

    const onStorage = (e) => {
      if (e.key === 'user') {
        setUser(e.newValue ? JSON.parse(e.newValue) : null);
        if (e.newValue && localStorage.getItem('token')) {
          fetchCartCount();
          fetchWishlistCount();
        }
      }
    };

    const onUserChange = () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      setUser(storedUser ? JSON.parse(storedUser) : null);
      if (storedUser && token) {
        fetchCartCount();
        fetchWishlistCount();
      }
    };

    const updateCounts = () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      if (token && user) {
        fetchCartCount();
        fetchWishlistCount();
      }
    };

    if (storedUser && token) {
      updateCounts();
    }

    window.addEventListener('storage', onStorage);
    window.addEventListener('userChanged', onUserChange);
    window.addEventListener('cartUpdated', updateCounts);
    window.addEventListener('wishlistUpdated', updateCounts);

    const origSetItem = localStorage.setItem;
    localStorage.setItem = function (key, _value) {
      origSetItem.apply(this, arguments);
      if (key === 'user') {
        window.dispatchEvent(new Event('userChanged'));
      }
      if (key.includes('cart') || key.includes('wishlist')) {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        if (token && user) {
          updateCounts();
        }
      }
    };

    const origRemoveItem = localStorage.removeItem;
    localStorage.removeItem = function (key) {
      origRemoveItem.apply(this, arguments);
      if (key === 'user') {
        window.dispatchEvent(new Event('userChanged'));
      }
      if (key.includes('cart') || key.includes('wishlist')) {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        if (token && user) {
          updateCounts();
        }
      }
    };

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('userChanged', onUserChange);
      window.removeEventListener('cartUpdated', updateCounts);
      window.removeEventListener('wishlistUpdated', updateCounts);
      localStorage.setItem = origSetItem;
      localStorage.removeItem = origRemoveItem;
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('.user-dropdown')) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('cartItems');
    localStorage.removeItem('wishlistItems');
    localStorage.removeItem('herbtradeCart');
    localStorage.removeItem('herbtradeWishlist');

    setUser(null);
    setCartCount(0);
    setWishlistCount(0);
    setIsMenuOpen(false);

    window.dispatchEvent(new Event('userChanged'));
    window.dispatchEvent(new Event('cartUpdated'));
    window.dispatchEvent(new Event('wishlistUpdated'));

    navigate('/login');

    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="nav-ultra fixed top-0 left-0 right-0 z-50">
      <div className="container-ultra px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-20">
          <Link
            to="/"
            className="flex items-center space-x-4 group interactive-hover"
          >
            <div className="relative">
              <div className="p-4 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl shadow-lg group-hover:shadow-2xl transition-all duration-500 glow-emerald">
                <Leaf className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-500" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full animate-pulse-glow"></div>
              <Sparkles className="absolute -bottom-1 -left-1 w-4 h-4 text-emerald-400 animate-bounce-gentle" />
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-playfair font-bold gradient-text group-hover:scale-105 transition-transform duration-500">
                HerbTrade
              </span>
              <span className="text-sm text-slate-500 font-medium -mt-1 group-hover:text-emerald-600 transition-colors duration-300">Natural Wellness</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center space-x-1">
            {user ? (
              <>
                {user.role === 'admin' ? (
                  <div className="flex items-center space-x-4">
                    <div className="relative user-dropdown">
                      <button
                        onClick={toggleMenu}
                        className={`flex items-center space-x-4 px-6 py-3 rounded-2xl backdrop-blur-sm transition-all duration-500 font-semibold shadow-lg hover:shadow-2xl interactive-hover border-2 ${isMenuOpen
                          ? 'bg-gradient-to-r from-emerald-200/90 to-teal-200/90 text-emerald-800 border-emerald-300/50 shadow-emerald-200/50'
                          : 'bg-gradient-to-r from-emerald-100/80 to-teal-100/80 hover:from-emerald-200/80 hover:to-teal-200/80 text-emerald-700 border-emerald-200/30 hover:border-emerald-300/50'
                          }`}
                        style={{ zIndex: 1000 }}
                        type="button"
                        aria-expanded={isMenuOpen}
                        aria-haspopup="true"
                      >
                        {user.profilePic ? (
                          <img src={user.profilePic} alt={user.name || 'User'} className="w-10 h-10 rounded-full object-cover shadow-lg" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-lg glow-emerald">
                            {user.name?.charAt(0) || 'A'}
                          </div>
                        )}
                        <span className="text-sm">Admin Panel</span>
                        <ChevronDown className={`w-5 h-5 transition-transform duration-500 ${isMenuOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isMenuOpen && (
                        <div
                          className="absolute right-0 mt-4 w-72 bg-white/95 backdrop-blur-xl rounded-3xl py-4 shadow-2xl border border-emerald-100/50 animate-fade-in-scale"
                          style={{ zIndex: 9999 }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="px-6 py-4 border-b border-slate-200/50 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 rounded-t-3xl">
                            <div className="flex items-center space-x-3">
                              {user.profilePic ? (
                                <img src={user.profilePic} alt={user.name || 'User'} className="w-12 h-12 rounded-full object-cover shadow-lg" />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg animate-glow-pulse">
                                  {user.name?.charAt(0) || 'A'}
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                                <p className="text-xs text-slate-500 font-medium">Administrator</p>
                              </div>
                            </div>
                          </div>

                          <div className="py-2">
                            <Link
                              to="/admin-dashboard"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                closeMenu();
                                navigate('/admin-dashboard');
                              }}
                              className="w-full px-6 py-4 text-left text-slate-700 hover:bg-emerald-50/80 hover:text-emerald-700 transition-all duration-300 flex items-center space-x-3 no-underline cursor-pointer group"
                            >
                              <Shield className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform duration-300" />
                              <span className="font-medium">Admin Dashboard</span>
                            </Link>

                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                closeMenu();
                                navigate('/admin-orders');
                              }}
                              className="w-full px-6 py-4 text-left text-slate-700 hover:bg-emerald-50/80 hover:text-emerald-700 transition-all duration-300 flex items-center space-x-3 font-medium cursor-pointer group"
                              type="button"
                            >
                              <Package className="w-5 h-5 text-emerald-600 mr-1 group-hover:scale-110 transition-transform duration-300" />
                              <span>Orders</span>
                            </button>

                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                closeMenu();
                                navigate('/admin-newsletter');
                              }}
                              className="w-full px-6 py-4 text-left text-slate-700 hover:bg-emerald-50/80 hover:text-emerald-700 transition-all duration-300 flex items-center space-x-3 font-medium cursor-pointer group"
                              type="button"
                            >
                              <BookOpen className="w-5 h-5 text-emerald-600 mr-1 group-hover:scale-110 transition-transform duration-300" />
                              <span>Health Tips</span>
                            </button>

                            <hr className="my-2 border-slate-200/50 mx-4" />

                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                closeMenu();
                                handleLogout();
                              }}
                              className="w-full px-6 py-4 text-left text-red-600 hover:bg-red-50/80 transition-all duration-300 flex items-center space-x-3 font-medium cursor-pointer group"
                              type="button"
                            >
                              <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                              <span>Logout</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : user.role === 'wellness_coach' ? (
                  <div className="flex items-center space-x-4">
                    <div className="relative user-dropdown">
                      <button
                        onClick={toggleMenu}
                        className={`flex items-center space-x-4 px-6 py-3 rounded-2xl backdrop-blur-sm transition-all duration-500 font-semibold shadow-lg hover:shadow-2xl interactive-hover border-2 ${isMenuOpen
                          ? 'bg-gradient-to-r from-purple-200/90 to-indigo-200/90 text-purple-800 border-purple-300/50 shadow-purple-200/50'
                          : 'bg-gradient-to-r from-purple-100/80 to-indigo-100/80 hover:from-purple-200/80 hover:to-indigo-200/80 text-purple-700 border-purple-200/30 hover:border-purple-300/50'
                          }`}
                        style={{ zIndex: 1000 }}
                        type="button"
                        aria-expanded={isMenuOpen}
                        aria-haspopup="true"
                      >
                        {user.profilePic ? (
                          <img src={user.profilePic} alt={user.name || 'User'} className="w-10 h-10 rounded-full object-cover shadow-lg" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm shadow-lg glow-purple">
                            {user.name?.charAt(0) || 'W'}
                          </div>
                        )}
                        <span className="text-sm">Coach Panel</span>
                        <ChevronDown className={`w-5 h-5 transition-transform duration-500 ${isMenuOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isMenuOpen && (
                        <div
                          className="absolute right-0 mt-4 w-72 bg-white/95 backdrop-blur-xl rounded-3xl py-4 shadow-2xl border border-purple-100/50 animate-fade-in-scale"
                          style={{ zIndex: 9999 }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="px-6 py-4 border-b border-slate-200/50 bg-gradient-to-r from-purple-50/50 to-indigo-50/50 rounded-t-3xl">
                            <div className="flex items-center space-x-3">
                              {user.profilePic ? (
                                <img src={user.profilePic} alt={user.name || 'User'} className="w-12 h-12 rounded-full object-cover shadow-lg" />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 via-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold shadow-lg animate-glow-pulse">
                                  {user.name?.charAt(0) || 'W'}
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                                <p className="text-xs text-slate-500 font-medium">Wellness Coach</p>
                              </div>
                            </div>
                          </div>

                          <div className="py-2">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                closeMenu();
                                navigate('/wellness-coach-dashboard');
                              }}
                              className="w-full px-6 py-4 text-left text-slate-700 hover:bg-purple-50/80 hover:text-purple-700 transition-all duration-300 flex items-center space-x-3 font-medium cursor-pointer group"
                              type="button"
                            >
                              <User className="w-5 h-5 text-purple-600 mr-1 group-hover:scale-110 transition-transform duration-300" />
                              <span>Coach Dashboard</span>
                            </button>

                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                closeMenu();
                                navigate('/wellness-program');
                              }}
                              className="w-full px-6 py-4 text-left text-slate-700 hover:bg-green-50/80 hover:text-green-700 transition-all duration-300 flex items-center space-x-3 font-medium cursor-pointer group"
                              type="button"
                            >
                              <BookOpen className="w-5 h-5 text-green-600 mr-1 group-hover:scale-110 transition-transform duration-300" />
                              <span>Wellness Programs</span>
                            </button>

                            <hr className="my-2 border-slate-200/50 mx-4" />

                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                closeMenu();
                                handleLogout();
                              }}
                              className="w-full px-6 py-4 text-left text-red-600 hover:bg-red-50/80 transition-all duration-300 flex items-center space-x-3 font-medium cursor-pointer group"
                              type="button"
                            >
                              <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                              <span>Logout</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : ['seller', 'employee', 'manager', 'supervisor'].includes(user.role) ? (
                  <div className="flex items-center space-x-4">
                    <div className="relative user-dropdown">
                      <button
                        onClick={toggleMenu}
                        className={`flex items-center space-x-4 px-6 py-3 rounded-2xl backdrop-blur-sm transition-all duration-500 font-semibold shadow-lg hover:shadow-2xl interactive-hover border-2 ${isMenuOpen
                          ? 'bg-gradient-to-r from-emerald-200/90 to-teal-200/90 text-emerald-800 border-emerald-300/50 shadow-emerald-200/50'
                          : 'bg-gradient-to-r from-emerald-100/80 to-teal-100/80 hover:from-emerald-200/80 hover:to-teal-200/80 text-emerald-700 border-emerald-200/30 hover:border-emerald-300/50'
                          }`}
                        style={{ zIndex: 1000 }}
                        type="button"
                        aria-expanded={isMenuOpen}
                        aria-haspopup="true"
                      >
                        {user.profilePic ? (
                          <img src={user.profilePic} alt={user.name || 'User'} className="w-10 h-10 rounded-full object-cover shadow-lg" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-lg glow-emerald">
                            {user.name?.charAt(0) || 'A'}
                          </div>
                        )}
                        <span className="text-sm">Admin Panel</span>
                        <ChevronDown className={`w-5 h-5 transition-transform duration-500 ${isMenuOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isMenuOpen && (
                        <div
                          className="absolute right-0 mt-4 w-72 bg-white/95 backdrop-blur-xl rounded-3xl py-4 shadow-2xl border border-emerald-100/50 animate-fade-in-scale"
                          style={{ zIndex: 9999 }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="px-6 py-4 border-b border-slate-200/50 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 rounded-t-3xl">
                            <div className="flex items-center space-x-3">
                              {user.profilePic ? (
                                <img src={user.profilePic} alt={user.name || 'User'} className="w-12 h-12 rounded-full object-cover shadow-lg" />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg animate-glow-pulse">
                                  {user.name?.charAt(0) || 'A'}
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                                <p className="text-xs text-slate-500 font-medium">Administrator</p>
                              </div>
                            </div>
                          </div>

                          <div className="py-2">
                            <Link
                              to="/admin-dashboard"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                closeMenu();
                                navigate('/admin-dashboard');
                              }}
                              className="w-full px-6 py-4 text-left text-slate-700 hover:bg-emerald-50/80 hover:text-emerald-700 transition-all duration-300 flex items-center space-x-3 no-underline cursor-pointer group"
                            >
                              <Shield className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform duration-300" />
                              <span className="font-medium">Admin Dashboard</span>
                            </Link>

                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                closeMenu();
                                navigate('/admin-orders');
                              }}
                              className="w-full px-6 py-4 text-left text-slate-700 hover:bg-emerald-50/80 hover:text-emerald-700 transition-all duration-300 flex items-center space-x-3 font-medium cursor-pointer group"
                              type="button"
                            >
                              <Package className="w-5 h-5 text-emerald-600 mr-1 group-hover:scale-110 transition-transform duration-300" />
                              <span>Orders</span>
                            </button>

                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                closeMenu();
                                navigate('/admin-newsletter');
                              }}
                              className="w-full px-6 py-4 text-left text-slate-700 hover:bg-emerald-50/80 hover:text-emerald-700 transition-all duration-300 flex items-center space-x-3 font-medium cursor-pointer group"
                              type="button"
                            >
                              <BookOpen className="w-5 h-5 text-emerald-600 mr-1 group-hover:scale-110 transition-transform duration-300" />
                              <span>Health Tips</span>
                            </button>

                            <hr className="my-2 border-slate-200/50 mx-4" />

                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                closeMenu();
                                handleLogout();
                              }}
                              className="w-full px-6 py-4 text-left text-red-600 hover:bg-red-50/80 transition-all duration-300 flex items-center space-x-3 font-medium cursor-pointer group"
                              type="button"
                            >
                              <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                              <span>Logout</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : ['seller', 'employee', 'manager', 'supervisor'].includes(user.role) ? (
                  <div className="flex items-center space-x-4">
                    <div className="relative user-dropdown">
                      <button
                        onClick={toggleMenu}
                        className={`flex items-center space-x-4 px-6 py-3 rounded-2xl backdrop-blur-sm transition-all duration-500 font-semibold shadow-lg hover:shadow-2xl interactive-hover border-2 ${isMenuOpen
                          ? 'bg-gradient-to-r from-orange-200/90 to-amber-200/90 text-orange-800 border-orange-300/50 shadow-orange-200/50'
                          : 'bg-gradient-to-r from-orange-100/80 to-amber-100/80 hover:from-orange-200/80 hover:to-amber-200/80 text-orange-700 border-orange-200/30 hover:border-orange-300/50'
                          }`}
                        style={{ zIndex: 1000 }}
                        type="button"
                        aria-expanded={isMenuOpen}
                        aria-haspopup="true"
                      >
                        {user.profilePic ? (
                          <img src={user.profilePic} alt={user.name || 'User'} className="w-10 h-10 rounded-full object-cover shadow-lg" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 flex items-center justify-center text-white font-bold text-sm shadow-lg glow-orange">
                            {user.name?.charAt(0) || 'S'}
                          </div>
                        )}
                        <span className="text-sm">Seller Panel</span>
                        <ChevronDown className={`w-5 h-5 transition-transform duration-500 ${isMenuOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isMenuOpen && (
                        <div
                          className="absolute right-0 mt-4 w-72 bg-white/95 backdrop-blur-xl rounded-3xl py-4 shadow-2xl border border-orange-100/50 animate-fade-in-scale"
                          style={{ zIndex: 9999 }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="px-6 py-4 border-b border-slate-200/50 bg-gradient-to-r from-orange-50/50 to-amber-50/50 rounded-t-3xl">
                            <div className="flex items-center space-x-3">
                              {user.profilePic ? (
                                <img src={user.profilePic} alt={user.name || 'User'} className="w-12 h-12 rounded-full object-cover shadow-lg" />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 flex items-center justify-center text-white font-bold shadow-lg animate-glow-pulse">
                                  {user.name?.charAt(0) || 'S'}
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                                <p className="text-xs text-slate-500 font-medium">
                                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="py-2">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                closeMenu();
                                navigate('/seller-dashboard');
                              }}
                              className="w-full flex items-center px-6 py-4 text-slate-700 hover:bg-orange-50/80 hover:text-orange-700 transition-all duration-300 cursor-pointer group"
                              type="button"
                            >
                              <Package className="w-5 h-5 text-orange-600 mr-3 group-hover:scale-110 transition-transform duration-300" />
                              <div className="text-left">
                                <div className="font-medium">Seller Dashboard</div>
                                <div className="text-xs text-slate-500">Manage products & orders</div>
                              </div>
                            </button>

                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                closeMenu();
                                navigate('/seller-dashboard?tab=profile');
                              }}
                              className="w-full flex items-center px-6 py-4 text-slate-700 hover:bg-emerald-50/80 hover:text-emerald-700 transition-all duration-300 cursor-pointer group"
                              type="button"
                            >
                              <User className="w-5 h-5 text-emerald-600 mr-3 group-hover:scale-110 transition-transform duration-300" />
                              <div className="text-left">
                                <div className="font-medium">My Profile</div>
                                <div className="text-xs text-slate-500">View profile information</div>
                              </div>
                            </button>

                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                closeMenu();
                                navigate('/edit-profile');
                              }}
                              className="w-full flex items-center px-6 py-4 text-slate-700 hover:bg-purple-50/80 hover:text-purple-700 transition-all duration-300 cursor-pointer group"
                              type="button"
                            >
                              <Settings className="w-5 h-5 text-purple-600 mr-3 group-hover:scale-110 transition-transform duration-300" />
                              <div className="text-left">
                                <div className="font-medium">Edit Profile</div>
                                <div className="text-xs text-slate-500">Update information & password</div>
                              </div>
                            </button>

                            <hr className="my-2 border-slate-200/50 mx-4" />

                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                closeMenu();
                                handleLogout();
                              }}
                              className="w-full flex items-center px-6 py-4 text-red-600 hover:bg-red-50/80 transition-all duration-300 cursor-pointer group"
                              type="button"
                            >
                              <LogOut className="w-5 h-5 text-red-600 mr-3 group-hover:scale-110 transition-transform duration-300" />
                              <div className="text-left">
                                <div className="font-medium">Logout</div>
                                <div className="text-xs text-red-400">Sign out of your account</div>
                              </div>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : user.role === 'delivery' ? (
                  <div className="flex items-center space-x-4">
                    <div className="relative user-dropdown">
                      <button
                        onClick={toggleMenu}
                        className={`flex items-center space-x-4 px-6 py-3 rounded-2xl backdrop-blur-sm transition-all duration-500 font-semibold shadow-lg hover:shadow-2xl interactive-hover border-2 ${isMenuOpen
                          ? 'bg-gradient-to-r from-emerald-200/90 to-teal-200/90 text-emerald-800 border-emerald-300/50 shadow-emerald-200/50'
                          : 'bg-gradient-to-r from-emerald-100/80 to-teal-100/80 hover:from-emerald-200/80 hover:to-teal-200/80 text-emerald-700 border-emerald-200/30 hover:border-emerald-300/50'
                          }`}
                        style={{ zIndex: 1000 }}
                        type="button"
                        aria-expanded={isMenuOpen}
                        aria-haspopup="true"
                      >
                        {user.profilePic ? (
                          <img src={user.profilePic} alt={user.name || 'User'} className="w-10 h-10 rounded-full object-cover shadow-lg" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-lg glow-emerald">
                            {user.name?.charAt(0) || 'D'}
                          </div>
                        )}
                        <span className="text-sm">Delivery Panel</span>
                        <ChevronDown className={`w-5 h-5 transition-transform duration-500 ${isMenuOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isMenuOpen && (
                        <div
                          className="absolute right-0 mt-4 w-72 bg-white/95 backdrop-blur-xl rounded-3xl py-4 shadow-2xl border border-emerald-100/50 animate-fade-in-scale"
                          style={{ zIndex: 9999 }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="px-6 py-4 border-b border-slate-200/50 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 rounded-t-3xl">
                            <div className="flex items-center space-x-3">
                              {user.profilePic ? (
                                <img src={user.profilePic} alt={user.name || 'User'} className="w-12 h-12 rounded-full object-cover shadow-lg" />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg animate-glow-pulse">
                                  {user.name?.charAt(0) || 'D'}
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                                <p className="text-xs text-slate-500 font-medium">Delivery</p>
                              </div>
                            </div>
                          </div>
                          <div className="py-2">
                            <button
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); closeMenu(); navigate('/delivery-dashboard'); }}
                              className="w-full flex items-center px-6 py-4 text-slate-700 hover:bg-emerald-50/80 hover:text-emerald-700 transition-all duration-300 cursor-pointer group"
                              type="button"
                            >
                              <Package className="w-5 h-5 text-emerald-600 mr-3 group-hover:scale-110 transition-transform duration-300" />
                              <div className="text-left">
                                <div className="font-medium">Delivery Dashboard</div>
                                <div className="text-xs text-slate-500">Manage assigned orders</div>
                              </div>
                            </button>
                            <button
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); closeMenu(); navigate('/edit-profile'); }}
                              className="w-full flex items-center px-6 py-4 text-slate-700 hover:bg-purple-50/80 hover:text-purple-700 transition-all duration-300 cursor-pointer group"
                              type="button"
                            >
                              <Settings className="w-5 h-5 text-purple-600 mr-3 group-hover:scale-110 transition-transform duration-300" />
                              <div className="text-left">
                                <div className="font-medium">Edit Profile</div>
                                <div className="text-xs text-slate-500">Update info & password</div>
                              </div>
                            </button>
                            <hr className="my-2 border-slate-200/50 mx-4" />
                            <button
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); closeMenu(); handleLogout(); }}
                              className="w-full flex items-center px-6 py-4 text-red-600 hover:bg-red-50/80 transition-all duration-300 cursor-pointer group"
                              type="button"
                            >
                              <LogOut className="w-5 h-5 text-red-600 mr-3 group-hover:scale-110 transition-transform duration-300" />
                              <div className="text-left">
                                <div className="font-medium">Logout</div>
                                <div className="text-xs text-red-400">Sign out of your account</div>
                              </div>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link
                      to="/herbs"
                      className="nav-link flex items-center space-x-3 px-4 py-3 group"
                    >
                      <Package className="w-5 h-5 group-hover:text-emerald-600 transition-colors duration-500" />
                      <span className="font-medium">Herbs</span>
                    </Link>

                    <Link
                      to="/hospital-discovery"
                      className="nav-link flex items-center space-x-3 px-4 py-3 group"
                    >
                      <MapPin className="w-5 h-5 group-hover:text-emerald-600 transition-colors duration-500" />
                      <span className="font-medium">Hospitals</span>
                    </Link>

                    <Link
                      to="/blog"
                      className="nav-link flex items-center space-x-3 px-4 py-3 group"
                    >
                      <BookOpen className="w-5 h-5 group-hover:text-emerald-600 transition-colors duration-500" />
                      <span className="font-medium">Blog</span>
                    </Link>

                    <Link
                      to="/discussion"
                      className="nav-link flex items-center space-x-3 px-4 py-3 group"
                    >
                      <MessageCircle className="w-5 h-5 group-hover:text-emerald-600 transition-colors duration-500" />
                      <span className="font-medium">Discuss</span>
                    </Link>

                    <Link
                      to="/newsletter"
                      className="nav-link flex items-center space-x-3 px-4 py-3 group"
                    >
                      <BookOpen className="w-5 h-5 group-hover:text-emerald-600 transition-colors duration-500" />
                      <span className="font-medium">Health Tips</span>
                    </Link>

                    <div className="flex items-center space-x-3 ml-6">
                      <Link
                        to="/wishlist"
                        className="relative p-3 rounded-2xl bg-slate-100/80 hover:bg-rose-100/80 backdrop-blur-sm transition-all duration-500 group interactive-hover shadow-sm hover:shadow-lg"
                      >
                        <Heart className="w-6 h-6 text-slate-600 group-hover:text-rose-500 transition-colors duration-500" />
                        {wishlistCount > 0 && (
                          <span className="absolute -top-2 -right-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-heartbeat shadow-lg">
                            {wishlistCount > 99 ? '99+' : wishlistCount}
                          </span>
                        )}
                      </Link>

                      <Link
                        to="/cart"
                        className="relative p-3 rounded-2xl bg-slate-100/80 hover:bg-emerald-100/80 backdrop-blur-sm transition-all duration-500 group interactive-hover shadow-sm hover:shadow-lg"
                      >
                        <ShoppingCart className="w-6 h-6 text-slate-600 group-hover:text-emerald-600 transition-colors duration-500" />
                        {cartCount > 0 && (
                          <span className="absolute -top-2 -right-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-heartbeat shadow-lg">
                            {cartCount > 99 ? '99+' : cartCount}
                          </span>
                        )}
                      </Link>

                      <div className="relative user-dropdown">
                        <button
                          onClick={toggleMenu}
                          className={`flex items-center space-x-3 px-4 py-3 rounded-2xl backdrop-blur-sm transition-all duration-500 group interactive-hover shadow-sm hover:shadow-lg border-2 ${isMenuOpen
                            ? 'bg-emerald-100/90 border-emerald-300/50 shadow-emerald-200/50'
                            : 'bg-slate-100/80 hover:bg-emerald-100/80 border-slate-200/30 hover:border-emerald-300/50'
                            }`}
                          style={{ zIndex: 1000 }}
                          type="button"
                          aria-expanded={isMenuOpen}
                          aria-haspopup="true"
                        >
                          {user.profilePic ? (
                            <img src={user.profilePic} alt={user.name || 'User'} className="w-10 h-10 rounded-full object-cover shadow-lg" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-lg glow-emerald">
                              {user.name?.charAt(0) || 'U'}
                            </div>
                          )}
                          <span className="text-sm font-medium text-slate-700 group-hover:text-emerald-700 transition-colors duration-300">
                            {user.name}
                          </span>
                          <ChevronDown className={`w-5 h-5 text-slate-600 group-hover:text-emerald-600 transition-all duration-500 ${isMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isMenuOpen && (
                          <div
                            className="absolute right-0 mt-4 w-72 bg-white/95 backdrop-blur-xl rounded-3xl py-4 shadow-2xl border border-emerald-100/50 animate-fade-in-scale"
                            style={{ zIndex: 9999 }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="px-6 py-4 border-b border-slate-200/50 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 rounded-t-3xl">
                              <div className="flex items-center space-x-3">
                                {user.profilePic ? (
                                  <img src={user.profilePic} alt={user.name || 'User'} className="w-12 h-12 rounded-full object-cover shadow-lg" />
                                ) : (
                                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg animate-glow-pulse">
                                    {user.name?.charAt(0) || 'U'}
                                  </div>
                                )}
                                <div>
                                  <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                                  <p className="text-xs text-slate-500 font-medium">
                                    {['seller', 'employee', 'manager', 'supervisor', 'delivery'].includes(user.role)
                                      ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                                      : 'Premium Member'}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="py-2">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log('🔥 PROFILE CLICKED!');
                                  closeMenu();
                                  navigate('/profile');
                                }}
                                className="w-full flex items-center px-6 py-4 text-slate-700 hover:bg-emerald-50/80 hover:text-emerald-700 transition-all duration-300 cursor-pointer group"
                                type="button"
                              >
                                <User className="w-5 h-5 text-emerald-600 mr-3 group-hover:scale-110 transition-transform duration-300" />
                                <div className="text-left">
                                  <div className="font-medium">My Profile</div>
                                  <div className="text-xs text-slate-500">View and manage your profile</div>
                                </div>
                              </button>

                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log('🔥 BOOKINGS CLICKED!');
                                  closeMenu();
                                  navigate('/view-bookings');
                                }}
                                className="w-full flex items-center px-6 py-4 text-slate-700 hover:bg-blue-50/80 hover:text-blue-700 transition-all duration-300 cursor-pointer group"
                                type="button"
                              >
                                <Calendar className="w-5 h-5 text-blue-600 mr-3 group-hover:scale-110 transition-transform duration-300" />
                                <div className="text-left">
                                  <div className="font-medium">My Bookings</div>
                                  <div className="text-xs text-slate-500">View appointment history</div>
                                </div>
                              </button>

                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  closeMenu();
                                  navigate('/my-orders');
                                }}
                                className="w-full flex items-center px-6 py-4 text-slate-700 hover:bg-emerald-50/80 hover:text-emerald-700 transition-all duration-300 cursor-pointer group"
                                type="button"
                              >
                                <Package className="w-5 h-5 text-emerald-600 mr-3 group-hover:scale-110 transition-transform duration-300" />
                                <div className="text-left">
                                  <div className="font-medium">My Orders</div>
                                  <div className="text-xs text-slate-500">View purchased products</div>
                                </div>
                              </button>

                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log('🔥 EDIT PROFILE CLICKED!');
                                  closeMenu();
                                  navigate('/edit-profile');
                                }}
                                className="w-full flex items-center px-6 py-4 text-slate-700 hover:bg-purple-50/80 hover:text-purple-700 transition-all duration-300 cursor-pointer group"
                                type="button"
                              >
                                <Settings className="w-5 h-5 text-purple-600 mr-3 group-hover:scale-110 transition-transform duration-300" />
                                <div className="text-left">
                                  <div className="font-medium">Edit Profile</div>
                                  <div className="text-xs text-slate-500">Update your information</div>
                                </div>
                              </button>

                              <hr className="my-2 border-slate-200/50 mx-4" />

                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log('🔥 LOGOUT CLICKED!');
                                  closeMenu();
                                  handleLogout();
                                }}
                                className="w-full flex items-center px-6 py-4 text-red-600 hover:bg-red-50/80 transition-all duration-300 cursor-pointer group"
                                type="button"
                              >
                                <LogOut className="w-5 h-5 text-red-600 mr-3 group-hover:scale-110 transition-transform duration-300" />
                                <div className="text-left">
                                  <div className="font-medium">Logout</div>
                                  <div className="text-xs text-red-400">Sign out of your account</div>
                                </div>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center space-x-1">
                <Link
                  to="/herbs"
                  className="nav-link flex items-center space-x-2 group"
                >
                  <Package className="w-4 h-4 group-hover:text-emerald-600 transition-colors duration-300" />
                  <span>Herbs</span>
                </Link>

                <Link
                  to="/hospital-discovery"
                  className="nav-link flex items-center space-x-2 group"
                >
                  <MapPin className="w-4 h-4 group-hover:text-emerald-600 transition-colors duration-300" />
                  <span>Hospitals</span>
                </Link>

                <Link
                  to="/blog"
                  className="nav-link flex items-center space-x-2 group"
                >
                  <BookOpen className="w-4 h-4 group-hover:text-emerald-600 transition-colors duration-300" />
                  <span>Blog</span>
                </Link>

                <Link
                  to="/discussion"
                  className="nav-link flex items-center space-x-2 group"
                >
                  <MessageCircle className="w-4 h-4 group-hover:text-emerald-600 transition-colors duration-300" />
                  <span>Discuss</span>
                </Link>

                <div className="flex items-center space-x-2 ml-4">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-slate-700 font-semibold hover:text-emerald-600 transition-colors duration-300"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="btn-primary px-6 py-2 text-sm hover:scale-105"
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="lg:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-xl bg-gray-100 hover:bg-emerald-100 transition-colors duration-300 group"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-gray-600 group-hover:text-emerald-600 transition-colors duration-300" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600 group-hover:text-emerald-600 transition-colors duration-300" />
              )}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden absolute top-20 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-2xl animate-slide-up">
            <div className="px-6 py-8 space-y-2">
              {user ? (
                <>
                  {user.role === 'delivery' ? (
                    <button
                      onClick={() => { closeMenu(); navigate('/delivery-dashboard'); }}
                      className="flex items-center space-x-3 w-full text-left px-4 py-3 text-slate-700 font-semibold hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-all duration-300"
                    >
                      <Package className="w-5 h-5" />
                      <span>Delivery Dashboard</span>
                    </button>
                  ) : user.role !== 'admin' && (
                    <>
                      <Link to="/herbs" onClick={closeMenu} className="flex items-center space-x-3 px-4 py-3 text-slate-700 font-semibold hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-all duration-300"><Package className="w-5 h-5" /><span>Herbs</span></Link>
                      <Link to="/hospital-discovery" onClick={closeMenu} className="flex items-center space-x-3 px-4 py-3 text-slate-700 font-semibold hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-all duration-300"><MapPin className="w-5 h-5" /><span>Hospitals</span></Link>
                      <Link to="/wellness-coaches" onClick={closeMenu} className="flex items-center space-x-3 px-4 py-3 text-slate-700 font-semibold hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-all duration-300"><Leaf className="w-5 h-5" /><span>Wellness Programs</span></Link>
                      <Link to="/blog" onClick={closeMenu} className="flex items-center space-x-3 px-4 py-3 text-slate-700 font-semibold hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-all duration-300"><BookOpen className="w-5 h-5" /><span>Blog</span></Link>
                      <Link to="/discussion" onClick={closeMenu} className="flex items-center space-x-3 px-4 py-3 text-slate-700 font-semibold hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-all duration-300"><MessageCircle className="w-5 h-5" /><span>Discuss</span></Link>
                      <Link to="/newsletter" onClick={closeMenu} className="flex items-center space-x-3 px-4 py-3 text-slate-700 font-semibold hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-all duration-300"><BookOpen className="w-5 h-5" /><span>Health Tips</span></Link>
                      <Link to="/wishlist" onClick={closeMenu} className="flex items-center justify-between px-4 py-3 text-slate-700 font-semibold hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-all duration-300"><div className="flex items-center space-x-3"><Heart className="w-5 h-5" /><span>Wishlist</span></div>{wishlistCount > 0 && (<span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 font-bold">{wishlistCount}</span>)}</Link>
                      <Link to="/cart" onClick={closeMenu} className="flex items-center justify-between px-4 py-3 text-slate-700 font-semibold hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-all duration-300"><div className="flex items-center space-x-3"><ShoppingCart className="w-5 h-5" /><span>Cart</span></div>{cartCount > 0 && (<span className="bg-emerald-500 text-white text-xs rounded-full px-2 py-1 font-bold">{cartCount}</span>)}</Link>
                    </>
                  )}
                  <hr className="border-gray-200 my-4" />
                  <button
                    onClick={() => { closeMenu(); navigate('/edit-profile'); }}
                    className="flex items-center space-x-3 w-full text-left px-4 py-3 text-slate-700 font-semibold hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-all duration-300"
                  >
                    <Settings className="w-5 h-5" />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full text-left px-4 py-3 text-red-600 font-semibold hover:bg-red-50 rounded-xl transition-all duration-300"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/herbs"
                    onClick={closeMenu}
                    className="flex items-center space-x-3 px-4 py-3 text-slate-700 font-semibold hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-all duration-300"
                  >
                    <Package className="w-5 h-5" />
                    <span>Herbs</span>
                  </Link>
                  <Link
                    to="/hospital-discovery"
                    onClick={closeMenu}
                    className="flex items-center space-x-3 px-4 py-3 text-slate-700 font-semibold hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-all duration-300"
                  >
                    <MapPin className="w-5 h-5" />
                    <span>Hospitals</span>
                  </Link>
                  <Link
                    to="/blog"
                    onClick={closeMenu}
                    className="flex items-center space-x-3 px-4 py-3 text-slate-700 font-semibold hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-all duration-300"
                  >
                    <BookOpen className="w-5 h-5" />
                    <span>Blog</span>
                  </Link>
                  <Link
                    to="/discussion"
                    onClick={closeMenu}
                    className="flex items-center space-x-3 px-4 py-3 text-slate-700 font-semibold hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-all duration-300"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Discuss</span>
                  </Link>
                  <Link
                    to="/newsletter"
                    onClick={closeMenu}
                    className="flex items-center space-x-3 px-4 py-3 text-slate-700 font-semibold hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-all duration-300"
                  >
                    <BookOpen className="w-5 h-5" />
                    <span>Health Tips</span>
                  </Link>
                  <hr className="border-gray-200 my-4" />
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="flex items-center space-x-3 px-4 py-3 text-slate-700 font-semibold hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-all duration-300"
                  >
                    <span>Sign In</span>
                  </Link>
                  <Link
                    to="/signup"
                    onClick={closeMenu}
                    className="btn-primary px-4 py-3 text-center rounded-xl font-semibold"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={closeMenu}
        />
      )}
    </nav>
  );
}

export default Navbar; 
