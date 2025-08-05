import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import {
  TrendingUp, DollarSign, Package, ShoppingCart, Plus, Eye, Edit3, Trash2,
  User, Settings, BarChart3, Bell, CheckCircle, X, Truck, Star,
  Calendar, Clock, MapPin, Phone, Mail, Camera, Lock, Search,
  Filter, Download, Upload, RefreshCw, AlertCircle, Info,
  ChevronDown, ChevronUp, MoreVertical, Edit, Delete,
  Store, Heart
} from 'lucide-react';
import { toast } from 'react-toastify';

const SellerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [openProductDialog, setOpenProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '', category: '', price: '', inStock: '', description: '', image: '', uses: [], quality: 'Standard'
  });
  const [sellerProfile, setSellerProfile] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '', phone: '', profilePic: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchSellerData();
    
    // Check for tab parameter in URL
    const urlParams = new URLSearchParams(location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [location]);

  const fetchSellerData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [productsRes, ordersRes, statsRes, profileRes] = await Promise.all([
        fetch('http://localhost:5000/api/seller/products', { headers }),
        fetch('http://localhost:5000/api/seller/orders', { headers }),
        fetch('http://localhost:5000/api/seller/stats', { headers }),
        fetch('http://localhost:5000/api/seller/profile', { headers })
      ]);

      if (productsRes.ok) setProducts(await productsRes.json());
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
      if (profileRes.ok) {
        const profile = await profileRes.json();
        setSellerProfile(profile);
        setProfileForm({
          name: profile.name || '',
          phone: profile.phone || '',
          profilePic: profile.profilePic || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      console.error('Failed to fetch seller data:', error);
      showSnackbar('Failed to fetch data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleAddProduct = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newProduct)
      });

      if (response.ok) {
        const product = await response.json();
        setProducts([product, ...products]);
        setNewProduct({ name: '', category: '', price: '', inStock: '', description: '', image: '', uses: [], quality: 'Standard' });
        setOpenProductDialog(false);
        showSnackbar('Product added successfully!');
      } else {
        const error = await response.json();
        showSnackbar(error.error || 'Failed to add product', 'error');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      showSnackbar('Failed to add product', 'error');
    }
  };

  const handleEditProduct = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/seller/products/${editingProduct._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newProduct)
      });

      if (response.ok) {
        const updatedProduct = await response.json();
        setProducts(products.map(p => p._id === updatedProduct._id ? updatedProduct : p));
        setEditingProduct(null);
        setNewProduct({ name: '', category: '', price: '', inStock: '', description: '', image: '', uses: [], quality: 'Standard' });
        setOpenProductDialog(false);
        showSnackbar('Product updated successfully!');
      } else {
        const error = await response.json();
        showSnackbar(error.error || 'Failed to update product', 'error');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      showSnackbar('Failed to update product', 'error');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/seller/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setProducts(products.filter(p => p._id !== productId));
        showSnackbar('Product deleted successfully!');
      } else {
        const error = await response.json();
        showSnackbar(error.error || 'Failed to delete product', 'error');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      showSnackbar('Failed to delete product', 'error');
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/seller/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        setOrders(orders.map(order =>
          order._id === orderId ? { ...order, status } : order
        ));
        showSnackbar('Order status updated successfully!');
      } else {
        const error = await response.json();
        showSnackbar(error.error || 'Failed to update order status', 'error');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      showSnackbar('Failed to update order status', 'error');
    }
  };

  const openEditDialog = (product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      inStock: product.inStock.toString(),
      description: product.description,
      image: product.image,
      uses: product.uses || [],
      quality: product.quality || 'Standard'
    });
    setOpenProductDialog(true);
  };

  const resetProductForm = () => {
    setEditingProduct(null);
    setNewProduct({ name: '', category: '', price: '', inStock: '', description: '', image: '', uses: [], quality: 'Standard' });
    setOpenProductDialog(false);
  };

  const handleUpdateProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/seller/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: profileForm.name,
          phone: profileForm.phone,
          profilePic: profileForm.profilePic
        })
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setSellerProfile(updatedProfile);
        setEditingProfile(false);
        showSnackbar('Profile updated successfully!');
      } else {
        const error = await response.json();
        showSnackbar(error.error || 'Failed to update profile', 'error');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showSnackbar('Failed to update profile', 'error');
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      showSnackbar('Please fill in all password fields', 'error');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showSnackbar('New passwords do not match', 'error');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showSnackbar('New password must be at least 6 characters long', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      if (response.ok) {
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordSection(false);
        showSnackbar('Password changed successfully!');
      } else {
        const error = await response.json();
        showSnackbar(error.error || 'Failed to change password', 'error');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showSnackbar('Failed to change password', 'error');
    }
  };

  // Filter and sort products
  const filteredProducts = products
    .filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterCategory === '' || product.category === filterCategory)
    )
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (stock <= 5) return { text: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {sellerProfile?.name || 'Seller'}!
              </h1>
              <p className="text-gray-600">Manage your products and track your business performance</p>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <div className="relative">
                <Bell className="w-6 h-6 text-gray-600" />
                {stats.pendingOrders > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {stats.pendingOrders}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <img
                  src={sellerProfile?.profilePic || `https://ui-avatars.com/api/?name=${sellerProfile?.name}&background=10b981&color=fff`}
                  alt="Profile"
                  className="w-10 h-10 rounded-full"
                />
                <span className="text-sm font-medium text-gray-700">{sellerProfile?.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold">${stats.totalSales || '0'}</p>
                <p className="text-emerald-100 text-sm">from all sales</p>
              </div>
              <DollarSign className="w-12 h-12 text-emerald-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Products Listed</p>
                <p className="text-3xl font-bold">{stats.totalProducts || products.length}</p>
                <p className="text-blue-100 text-sm">{stats.activeProducts || 0} in stock</p>
              </div>
              <Package className="w-12 h-12 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Total Orders</p>
                <p className="text-3xl font-bold">{stats.totalOrders || orders.length}</p>
                <p className="text-yellow-100 text-sm">{stats.pendingOrders || 0} pending</p>
              </div>
              <ShoppingCart className="w-12 h-12 text-yellow-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Active Products</p>
                <p className="text-3xl font-bold">{stats.activeProducts || 0}</p>
                <p className="text-purple-100 text-sm">{stats.outOfStockProducts || 0} out of stock</p>
              </div>
              <Store className="w-12 h-12 text-purple-200" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'products', label: 'Products', icon: Package },
                { id: 'orders', label: 'Orders', icon: ShoppingCart },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                { id: 'profile', label: 'Profile', icon: User }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setOpenProductDialog(true)}
                  className="flex items-center space-x-3 p-4 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
                >
                  <Plus className="w-6 h-6 text-emerald-600" />
                  <span className="font-medium text-emerald-700">Add New Product</span>
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                >
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                  <span className="font-medium text-blue-700">View Orders</span>
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className="flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors"
                >
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                  <span className="font-medium text-purple-700">View Analytics</span>
                </button>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div key={order._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">#{order._id.slice(-6)}</p>
                        <p className="text-sm text-gray-600">{order.user?.name || 'Unknown Customer'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">${order.totalAmount || order.amount}</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No orders yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="bg-white rounded-2xl shadow-lg">
            {/* Products Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                <h2 className="text-xl font-bold text-gray-900">My Products ({filteredProducts.length})</h2>
                <button
                  onClick={() => setOpenProductDialog(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Product</span>
                </button>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-full"
                  />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">All Categories</option>
                  <option value="Herbs">Herbs</option>
                  <option value="Spices">Spices</option>
                  <option value="Medicinal">Medicinal</option>
                  <option value="Organic">Organic</option>
                  <option value="Essential Oils">Essential Oils</option>
                </select>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                  <option value="price-asc">Price Low-High</option>
                  <option value="price-desc">Price High-Low</option>
                  <option value="inStock-desc">Stock High-Low</option>
                </select>
              </div>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        No products found
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => {
                      const stockStatus = getStockStatus(product.inStock || product.stock || 0);
                      return (
                        <tr key={product._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                src={product.image || '/api/placeholder/40/40'}
                                alt={product.name}
                                className="w-10 h-10 rounded-lg object-cover mr-3"
                              />
                              <div>
                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                <div className="text-sm text-gray-500">{product.description?.substring(0, 50)}...</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                              {product.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ${product.price}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {product.inStock || product.stock || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${stockStatus.color}`}>
                              {stockStatus.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => openEditDialog(product)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product._id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Orders Management ({orders.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        No orders found yet
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order._id.slice(-6)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {order.user?.name || order.customerName || 'Unknown'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.user?.email || 'No email'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {order.items?.map((item, index) => (
                              <div key={index} className="text-sm text-gray-900">
                                {item.product?.name || item.productName} (x{item.quantity})
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${order.totalAmount || order.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            {order.status === 'pending' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order._id, 'confirmed')}
                                className="text-green-600 hover:text-green-900"
                                title="Confirm Order"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            {order.status === 'confirmed' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order._id, 'shipped')}
                                className="text-blue-600 hover:text-blue-900"
                                title="Mark as Shipped"
                              >
                                <Truck className="w-4 h-4" />
                              </button>
                            )}
                            {order.status === 'shipped' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order._id, 'delivered')}
                                className="text-green-600 hover:text-green-900"
                                title="Mark as Delivered"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            {['pending', 'confirmed'].includes(order.status) && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order._id, 'cancelled')}
                                className="text-red-600 hover:text-red-900"
                                title="Cancel Order"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Analytics & Insights</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-emerald-800">Sales Performance</h3>
                    <TrendingUp className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="text-3xl font-bold text-emerald-700 mb-2">
                    ${stats.totalSales || '0'}
                  </div>
                  <p className="text-emerald-600">Total revenue from {stats.totalOrders || 0} orders</p>
                  <div className="mt-4 bg-emerald-200 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-blue-800">Product Performance</h3>
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-blue-700 mb-2">
                    {stats.activeProducts || 0}
                  </div>
                  <p className="text-blue-600">Active products out of {stats.totalProducts || 0} total</p>
                  <div className="mt-4 bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${((stats.activeProducts || 0) / (stats.totalProducts || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Seller Profile</h2>
              <button
                onClick={() => setEditingProfile(!editingProfile)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>{editingProfile ? 'Cancel' : 'Edit Profile'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <img
                  src={sellerProfile?.profilePic || `https://ui-avatars.com/api/?name=${sellerProfile?.name}&background=10b981&color=fff&size=120`}
                  alt="Profile"
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-lg font-semibold text-gray-900">{sellerProfile?.name || 'Seller Name'}</h3>
                <p className="text-gray-600">{sellerProfile?.email || 'seller@example.com'}</p>
                <p className="text-sm text-emerald-600 font-medium mt-2 capitalize">
                  {sellerProfile?.role || 'Seller'}
                </p>
              </div>

              <div className="md:col-span-2">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    {editingProfile ? (
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    ) : (
                      <p className="text-gray-900">{sellerProfile?.name || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-gray-900">{sellerProfile?.email || 'Not provided'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    {editingProfile ? (
                      <input
                        type="text"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    ) : (
                      <p className="text-gray-900">{sellerProfile?.phone || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture URL</label>
                    {editingProfile ? (
                      <input
                        type="url"
                        value={profileForm.profilePic}
                        onChange={(e) => setProfileForm({ ...profileForm, profilePic: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    ) : (
                      <p className="text-gray-900">{sellerProfile?.profilePic || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <p className="text-gray-900 capitalize">{sellerProfile?.role || 'seller'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <p className="text-gray-900">{sellerProfile?.department || 'General'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Status</label>
                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                      sellerProfile?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {sellerProfile?.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                    <p className="text-gray-900">
                      {sellerProfile?.createdAt ? new Date(sellerProfile.createdAt).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>

                  {/* Seller Statistics */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 mt-4">
                    <div className="text-center p-3 bg-emerald-50 rounded-lg">
                      <div className="text-2xl font-bold text-emerald-600">{products.length}</div>
                      <div className="text-sm text-gray-600">Products Listed</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{orders.length}</div>
                      <div className="text-sm text-gray-600">Total Orders</div>
                    </div>
                  </div>

                  {/* Password Change Section */}
                  <div className="border-t border-gray-200 pt-6 mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Lock className="w-5 h-5 mr-2 text-emerald-600" />
                        Change Password
                      </h4>
                      <button
                        onClick={() => setShowPasswordSection(!showPasswordSection)}
                        className="text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors"
                      >
                        {showPasswordSection ? 'Cancel' : 'Change Password'}
                      </button>
                    </div>

                    {showPasswordSection && (
                      <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                          <input
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="Enter current password"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                          <input
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="Enter new password (min 6 characters)"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                          <input
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="Confirm new password"
                          />
                        </div>

                        <div className="flex space-x-3 pt-2">
                          <button
                            onClick={handleChangePassword}
                            disabled={!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                          >
                            <Lock className="w-4 h-4" />
                            <span>Change Password</span>
                          </button>
                          <button
                            onClick={() => {
                              setShowPasswordSection(false);
                              setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                            }}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {editingProfile && (
                    <div className="flex space-x-4 pt-4">
                      <button
                        onClick={handleUpdateProfile}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition-colors"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setEditingProfile(false)}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Product Dialog */}
      {openProductDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-emerald-600 text-white p-6 rounded-t-2xl">
              <h3 className="text-xl font-bold">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="">Select Category</option>
                    <option value="Herbs">Herbs</option>
                    <option value="Spices">Spices</option>
                    <option value="Medicinal">Medicinal</option>
                    <option value="Organic">Organic</option>
                    <option value="Essential Oils">Essential Oils</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={newProduct.inStock}
                    onChange={(e) => setNewProduct({ ...newProduct, inStock: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quality</label>
                  <select
                    value={newProduct.quality}
                    onChange={(e) => setNewProduct({ ...newProduct, quality: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                    <option value="Organic">Organic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    type="url"
                    value={newProduct.image}
                    onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Enter product description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Uses (comma separated)</label>
                <input
                  type="text"
                  value={Array.isArray(newProduct.uses) ? newProduct.uses.join(', ') : newProduct.uses}
                  onChange={(e) => setNewProduct({
                    ...newProduct,
                    uses: e.target.value.split(',').map(use => use.trim()).filter(use => use)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Digestive, Anti-inflammatory, Antioxidant"
                />
                <p className="text-sm text-gray-500 mt-1">Enter uses separated by commas</p>
              </div>
            </div>

            <div className="flex justify-end space-x-4 p-6 bg-gray-50 rounded-b-2xl">
              <button
                onClick={resetProductForm}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingProduct ? handleEditProduct : handleAddProduct}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                {editingProduct ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar */}
      {snackbar.open && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
          snackbar.severity === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center justify-between">
            <span>{snackbar.message}</span>
            <button
              onClick={handleCloseSnackbar}
              className="ml-4 text-white hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;