import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  ShoppingCart,
  Package,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Plus,
  Download,
  RefreshCw,
  Heart,
  Calendar,
  Bell,
  Search,
  Filter,
  MoreVertical,
  Activity,
  DollarSign,
  Star,
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  Shield,
  Settings,
  LogOut,
  X
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    // Check if user is admin
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'admin') {
      navigate('/login');
      return;
    }

    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch all data in parallel
      const [usersRes, ordersRes, productsRes, hospitalBookingsRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/admin/orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/products', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/admin/hospital-bookings', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData);
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData);
      }

      console.log('Hospital bookings response status:', hospitalBookingsRes.status);

      if (hospitalBookingsRes.ok) {
        const hospitalBookingsData = await hospitalBookingsRes.json();
        console.log('Hospital bookings response:', hospitalBookingsData);
        console.log('Hospital bookings array:', hospitalBookingsData.data || hospitalBookingsData);
        setAppointments(hospitalBookingsData.data || hospitalBookingsData || []);
      } else {
        console.error('Failed to fetch hospital bookings:', hospitalBookingsRes.status, hospitalBookingsRes.statusText);

        // Try to get error details
        const contentType = hospitalBookingsRes.headers.get('content-type');
        console.log('Response content type:', contentType);

        if (contentType && contentType.includes('application/json')) {
          const errorData = await hospitalBookingsRes.json();
          console.error('JSON Error response:', errorData);
        } else {
          const errorText = await hospitalBookingsRes.text();
          console.error('Text Error response:', errorText.substring(0, 200) + '...');
        }

        // Set empty array on error
        setAppointments([]);
      }

      // Calculate stats
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      const pendingOrders = orders.filter(order => order.status === 'pending').length;
      const activeUsers = users.filter(user => user.isActive !== false).length;

      setStats({
        totalUsers: users.length,
        totalOrders: orders.length,
        totalProducts: products.length,
        totalRevenue,
        pendingOrders,
        activeUsers
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };



  const handleUserAction = async (userId, action) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/${action}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success(`User ${action} successfully`);
        fetchDashboardData();
      } else {
        throw new Error(`Failed to ${action} user`);
      }
    } catch (error) {
      console.error(`Error ${action} user:`, error);
      toast.error(`Failed to ${action} user`);
    }
  };

  const handleBookingStatusUpdate = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/hospital-bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bookingStatus: newStatus })
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message || `Booking ${newStatus.toLowerCase()} successfully`);

        // Update local state
        setAppointments(prev =>
          prev.map(booking =>
            booking._id === bookingId
              ? { ...booking, bookingStatus: newStatus, updatedAt: new Date() }
              : booking
          )
        );

        // Refresh notifications
        fetchNotifications();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update booking status');
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, change }) => (
    <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/60 p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group overflow-hidden">
      {/* Herbal pattern overlay */}
      <div className="absolute top-0 right-0 w-20 h-20 opacity-5">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-emerald-400">
          <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z"/>
        </svg>
      </div>
      
      <div className="flex items-center justify-between relative z-10">
        <div className="flex-1">
          <p className="text-slate-600 text-sm font-semibold mb-2 uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mb-1 font-playfair">{value}</p>
          {change && (
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
              change > 0 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              <TrendingUp className={`w-3 h-3 mr-1 ${change < 0 ? 'rotate-180' : ''}`} />
              {change > 0 ? '+' : ''}{change}%
            </div>
          )}
        </div>
        <div className={`relative p-4 rounded-2xl ${color} group-hover:scale-110 transition-all duration-300 shadow-lg`}>
          <Icon className="w-8 h-8 text-white relative z-10" />
          <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      </div>
      
      {/* Subtle gradient border */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  );

  const TabButton = ({ id, label, icon: Icon, isActive, onClick, badge }) => (
    <button
      onClick={() => onClick(id)}
      className={`relative flex items-center space-x-3 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 group ${
        isActive
          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg transform scale-105'
          : 'text-slate-600 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 hover:text-emerald-600 hover:shadow-md'
      }`}
    >
      <div className={`p-1 rounded-lg transition-all duration-300 ${
        isActive 
          ? 'bg-white/20' 
          : 'group-hover:bg-emerald-100'
      }`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="font-medium">{label}</span>
      {badge > 0 && (
        <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-pulse shadow-lg">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
      
      {/* Herbal accent */}
      {isActive && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white/50 rounded-full"></div>
      )}
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center pt-24">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mx-auto"></div>
          <p className="text-xl text-slate-600 font-medium">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 pt-24 pb-12 relative overflow-hidden">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Enhanced Background with Herbal Pattern */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-3"
        style={{ backgroundImage: 'url(/assets/bg.png)' }}
      />
      
      {/* Animated Herbal Leaf Decorations */}
      <div className="absolute top-10 left-5 w-20 h-20 opacity-10 animate-leaf-sway">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-emerald-400">
          <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z"/>
        </svg>
      </div>
      <div className="absolute top-32 right-10 w-16 h-16 opacity-10 rotate-45 animate-leaf-sway" style={{ animationDelay: '1s' }}>
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-teal-400">
          <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z"/>
        </svg>
      </div>
      <div className="absolute bottom-20 left-20 w-24 h-24 opacity-10 -rotate-12 animate-leaf-sway" style={{ animationDelay: '2s' }}>
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-green-400">
          <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z"/>
        </svg>
      </div>

      {/* Floating decorative elements with enhanced animation */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-emerald-200/20 to-green-200/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-teal-200/15 to-cyan-200/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-lime-200/10 to-emerald-200/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 animate-slide-up">
        {/* Enhanced Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-3">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl shadow-xl">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-playfair font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent tracking-tight">
                  Admin Dashboard
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-lg text-slate-600 font-medium">
                    🌿 Managing HerbTrade Platform
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm text-slate-500">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <span>System Status: Online</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Last Updated: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchDashboardData}
              className="p-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl border border-white/50 transition-all duration-300 hover:-translate-y-1 group"
              title="Refresh Dashboard"
            >
              <RefreshCw className="w-6 h-6 text-emerald-600 group-hover:rotate-180 transition-transform duration-500" />
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl border border-white/50 transition-all duration-300 hover:-translate-y-1 group"
                title="Notifications"
              >
                <Bell className="w-6 h-6 text-slate-600 group-hover:text-emerald-600 transition-colors duration-300" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 max-h-96 overflow-hidden">
                  <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-900">Notifications</h3>
                    <div className="flex items-center space-x-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllNotificationsAsRead}
                          className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                          Mark all read
                        </button>
                      )}
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-500">
                        <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p>No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification._id}
                          className={`p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors duration-200 ${
                            !notification.read ? 'bg-emerald-50/50' : ''
                          }`}
                          onClick={() => markNotificationAsRead(notification._id)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${!notification.read ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                            <div className="flex-1">
                              <p className="font-medium text-slate-900">{notification.title}</p>
                              <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                              <p className="text-xs text-slate-400 mt-2">
                                {new Date(notification.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                localStorage.clear();
                navigate('/login');
                window.location.reload();
              }}
              className="flex items-center space-x-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            color="bg-gradient-to-r from-emerald-500 to-green-600"
            change={12}
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={ShoppingCart}
            color="bg-gradient-to-r from-teal-500 to-cyan-600"
            change={8}
          />
          <StatCard
            title="Herbal Products"
            value={stats.totalProducts}
            icon={Package}
            color="bg-gradient-to-r from-lime-500 to-green-600"
            change={-2}
          />
          <StatCard
            title="Revenue"
            value={`₹${stats.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            color="bg-gradient-to-r from-amber-500 to-orange-600"
            change={15}
          />
        </div>

        {/* Enhanced Navigation Tabs */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/60 p-6 mb-8 relative overflow-hidden">
          {/* Herbal pattern background */}
          <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-emerald-400">
              <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z"/>
            </svg>
          </div>
          
          <div className="relative z-10">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-emerald-600" />
              Dashboard Navigation
            </h3>
            <div className="flex flex-wrap gap-4">
            <TabButton
              id="overview"
              label="Overview"
              icon={Activity}
              isActive={activeTab === 'overview'}
              onClick={setActiveTab}
            />
            <TabButton
              id="users"
              label="Users"
              icon={Users}
              isActive={activeTab === 'users'}
              onClick={setActiveTab}
            />
            <TabButton
              id="orders"
              label="Orders"
              icon={ShoppingCart}
              isActive={activeTab === 'orders'}
              onClick={setActiveTab}
            />
            <TabButton
              id="products"
              label="Products"
              icon={Package}
              isActive={activeTab === 'products'}
              onClick={setActiveTab}
            />
            <TabButton
              id="appointments"
              label="Appointments"
              icon={Calendar}
              isActive={activeTab === 'appointments'}
              onClick={setActiveTab}
              badge={appointments.filter(apt => apt.bookingStatus === 'Pending').length}
            />
            </div>
          </div>
        </div>

        {/* Enhanced Tab Content */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/60 p-8 relative overflow-hidden">
          {/* Subtle herbal background pattern */}
          <div className="absolute inset-0 opacity-3">
            <div className="absolute top-10 right-10 w-16 h-16">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-emerald-400">
                <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z"/>
              </svg>
            </div>
            <div className="absolute bottom-10 left-10 w-20 h-20 rotate-180">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-teal-400">
                <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z"/>
              </svg>
            </div>
          </div>
          
          <div className="relative z-10">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-playfair font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                  Platform Overview
                </h2>
              </div>
              
              {/* Enhanced Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <UserCheck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-emerald-700 font-semibold text-sm uppercase tracking-wide">Active Users</p>
                      <p className="text-2xl font-bold text-slate-900 font-playfair">{stats.activeUsers}</p>
                      <p className="text-xs text-emerald-600 mt-1">🌱 Growing community</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-amber-700 font-semibold text-sm uppercase tracking-wide">Pending Orders</p>
                      <p className="text-2xl font-bold text-slate-900 font-playfair">{stats.pendingOrders}</p>
                      <p className="text-xs text-amber-600 mt-1">⏳ Awaiting processing</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl border border-teal-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-teal-700 font-semibold text-sm uppercase tracking-wide">Appointments</p>
                      <p className="text-2xl font-bold text-slate-900 font-playfair">{appointments.length}</p>
                      <p className="text-xs text-teal-600 mt-1">🏥 Health consultations</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="text-xl font-playfair font-bold text-slate-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                          <ShoppingCart className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">New Order #{order.id || index + 1}</p>
                          <p className="text-sm text-slate-600">₹{order.total || 0}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'completed' ? 'bg-green-100 text-green-700' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {order.status || 'pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-playfair font-bold text-slate-900">User Management</h2>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto bg-white/50 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-200/50">
                      <th className="text-left py-6 px-6 font-bold text-emerald-800 uppercase tracking-wide text-sm">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>User</span>
                        </div>
                      </th>
                      <th className="text-left py-6 px-6 font-bold text-emerald-800 uppercase tracking-wide text-sm">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4" />
                          <span>Email</span>
                        </div>
                      </th>
                      <th className="text-left py-6 px-6 font-bold text-emerald-800 uppercase tracking-wide text-sm">
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4" />
                          <span>Role</span>
                        </div>
                      </th>
                      <th className="text-left py-6 px-6 font-bold text-emerald-800 uppercase tracking-wide text-sm">
                        <div className="flex items-center space-x-2">
                          <Activity className="w-4 h-4" />
                          <span>Status</span>
                        </div>
                      </th>
                      <th className="text-left py-6 px-6 font-bold text-emerald-800 uppercase tracking-wide text-sm">
                        <div className="flex items-center space-x-2">
                          <Settings className="w-4 h-4" />
                          <span>Actions</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter(user => 
                      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((user, index) => (
                      <tr key={user._id || index} className="border-b border-slate-100/50 hover:bg-gradient-to-r hover:from-emerald-50/30 hover:to-teal-50/30 transition-all duration-300 group">
                        <td className="py-6 px-6">
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                                {user.name?.charAt(0) || 'U'}
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-lg">{user.name || 'Unknown'}</p>
                              <p className="text-sm text-slate-500 font-mono">ID: {user._id?.slice(-6) || 'N/A'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-6 px-6">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-700 font-medium">{user.email || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="py-6 px-6">
                          <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-sm ${
                            user.role === 'admin' ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-300' :
                            user.role === 'seller' ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300' :
                            'bg-gradient-to-r from-emerald-100 to-green-200 text-emerald-800 border border-emerald-300'
                          }`}>
                            {user.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                            {user.role === 'seller' && <ShoppingCart className="w-3 h-3 mr-1" />}
                            {user.role === 'user' && <Users className="w-3 h-3 mr-1" />}
                            {user.role || 'user'}
                          </span>
                        </td>
                        <td className="py-6 px-6">
                          <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-sm ${
                            user.isActive !== false 
                              ? 'bg-gradient-to-r from-green-100 to-emerald-200 text-green-800 border border-green-300' 
                              : 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300'
                          }`}>
                            {user.isActive !== false ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Inactive
                              </>
                            )}
                          </span>
                        </td>
                        <td className="py-6 px-6">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowUserModal(true);
                              }}
                              className="group relative p-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-110"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                              <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </button>
                            <button
                              onClick={() => handleUserAction(user._id, user.isActive !== false ? 'deactivate' : 'activate')}
                              className={`group relative p-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-110 ${
                                user.isActive !== false 
                                  ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' 
                                  : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                              }`}
                              title={user.isActive !== false ? 'Deactivate User' : 'Activate User'}
                            >
                              {user.isActive !== false ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                              <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-8">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-playfair font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                  Order Management
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {orders.map((order, index) => (
                  <div key={order._id || index} className="group p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
                    {/* Herbal pattern overlay */}
                    <div className="absolute top-0 right-0 w-16 h-16 opacity-5">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-emerald-400">
                        <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z"/>
                      </svg>
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                            <ShoppingCart className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-lg">Order #{order.id || index + 1}</p>
                            <p className="text-sm text-slate-500 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {order.date || 'Recent'}
                            </p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                          order.status === 'completed' ? 'bg-gradient-to-r from-green-100 to-emerald-200 text-green-800 border border-green-300' :
                          order.status === 'pending' ? 'bg-gradient-to-r from-amber-100 to-yellow-200 text-amber-800 border border-amber-300' :
                          'bg-gradient-to-r from-blue-100 to-indigo-200 text-blue-800 border border-blue-300'
                        }`}>
                          {order.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {order.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                          {order.status || 'pending'}
                        </span>
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-700 font-medium">Customer: {order.customerName || 'N/A'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Package className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-700 font-medium">Items: {order.items?.length || 0}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-slate-400" />
                          <span className="text-lg font-bold text-slate-900 font-playfair">₹{order.total || 0}</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="flex-1 py-2 px-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                          View Details
                        </button>
                        <button className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-playfair font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                    Herbal Product Management
                  </h2>
                </div>
                <button className="group flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-105">
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                  <span className="font-semibold">Add New Product</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product, index) => (
                  <div key={product._id || index} className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                    <img 
                      src={product.image || '/api/placeholder/300/200'} 
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-6">
                      <h3 className="font-semibold text-slate-900 mb-2">{product.name || 'Unnamed Product'}</h3>
                      <p className="text-slate-600 text-sm mb-4">{product.description || 'No description'}</p>
                      <div className="flex justify-between items-center">
                        <p className="font-bold text-emerald-600">₹{product.price || 0}</p>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-playfair font-bold text-slate-900">Hospital Booking Management</h2>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-slate-600">
                    Total: {appointments.length} | Pending: {appointments.filter(apt => apt.bookingStatus === 'Pending').length}
                  </span>
                  <button
                    onClick={fetchDashboardData}
                    className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors duration-200"
                    title="Refresh bookings"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {/* Debug Information */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>Debug Info:</strong> Found {appointments.length} bookings
                  </p>
                  {appointments.length > 0 && (
                    <details className="mt-2">
                      <summary className="text-sm text-blue-600 cursor-pointer">View raw data</summary>
                      <pre className="text-xs bg-white p-2 mt-2 rounded border overflow-auto max-h-40">
                        {JSON.stringify(appointments, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>

                {appointments.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl">
                    <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 text-lg">No hospital bookings found</p>
                    <p className="text-slate-400 text-sm">Bookings will appear here when users make appointments</p>
                    <div className="mt-4 space-y-2">
                      <button
                        onClick={async () => {
                          console.log('Testing database connection...');
                          try {
                            // First test basic API
                            const testResponse = await fetch('http://localhost:5000/api/test');
                            console.log('Basic API test status:', testResponse.status);

                            if (!testResponse.ok) {
                              throw new Error(`API test failed: ${testResponse.status}`);
                            }

                            const testData = await testResponse.json();
                            console.log('Basic API test response:', testData);

                            // Then test database
                            const dbResponse = await fetch('http://localhost:5000/api/debug/bookings');
                            console.log('Database test status:', dbResponse.status);

                            if (!dbResponse.ok) {
                              const errorText = await dbResponse.text();
                              throw new Error(`Database test failed: ${dbResponse.status} - ${errorText}`);
                            }

                            const dbData = await dbResponse.json();
                            console.log('Database test response:', dbData);
                            alert(`Database test: Found ${dbData.count} bookings. Check console for details.`);
                          } catch (err) {
                            console.error('Database test error:', err);
                            alert(`Database test failed: ${err.message}`);
                          }
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mr-2"
                      >
                        Test Database
                      </button>

                      <button
                        onClick={async () => {
                          console.log('Testing admin API endpoint...');
                          const token = localStorage.getItem('token');
                          console.log('Using token:', token ? 'Token exists' : 'No token');

                          try {
                            const response = await fetch('http://localhost:5000/api/admin/hospital-bookings', {
                              headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                              }
                            });

                            console.log('Response status:', response.status);
                            console.log('Response headers:', response.headers);

                            if (!response.ok) {
                              const errorText = await response.text();
                              console.error('API Error Response:', errorText);
                              alert(`API Error: ${response.status} - ${errorText}`);
                              return;
                            }

                            const data = await response.json();
                            console.log('Admin API response:', data);
                            alert(`Admin API: Found ${data.count || 0} bookings. Check console for details.`);
                          } catch (err) {
                            console.error('Admin API error:', err);
                            alert(`Admin API failed: ${err.message}`);
                          }
                        }}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Test Admin API
                      </button>

                      <button
                        onClick={async () => {
                          console.log('Testing backend health...');
                          try {
                            const response = await fetch('http://localhost:5000/api/health');
                            const data = await response.json();
                            console.log('Health check response:', data);
                            alert(`Backend Status: ${data.status}, Database: ${data.database}`);
                          } catch (err) {
                            console.error('Health check error:', err);
                            alert(`Backend not responding: ${err.message}`);
                          }
                        }}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors ml-2"
                      >
                        Test Backend
                      </button>
                    </div>
                  </div>
                ) : (
                  appointments.map((booking, index) => (
                    <div key={booking._id || index} className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 space-y-3">
                          {/* Patient Information */}
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 text-lg">
                                {booking.patientDetails?.name || booking.userId?.name || 'Unknown Patient'}
                              </p>
                              <p className="text-sm text-slate-500">
                                {booking.patientDetails?.email || booking.userId?.email || 'No email'}
                              </p>
                            </div>
                          </div>

                          {/* Appointment Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-600">
                                  <strong>Date:</strong> {booking.appointmentDetails?.appointmentDate ?
                                    new Date(booking.appointmentDetails.appointmentDate).toLocaleDateString() : 'N/A'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-600">
                                  <strong>Time:</strong> {booking.appointmentDetails?.appointmentTime || 'N/A'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Users className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-600">
                                  <strong>Doctor:</strong> {booking.appointmentDetails?.doctorName || 'N/A'}
                                </span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-600">
                                  <strong>Hospital:</strong> {booking.hospitalDetails?.name || booking.hospitalId?.name || 'N/A'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Phone className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-600">
                                  <strong>Phone:</strong> {booking.patientDetails?.phone || 'N/A'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <DollarSign className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-600">
                                  <strong>Fee:</strong> ₹{booking.paymentDetails?.consultationFee || 500}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Medical Information */}
                          {booking.medicalInfo?.symptoms && (
                            <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                              <p className="text-sm text-slate-600">
                                <strong>Symptoms:</strong> {booking.medicalInfo.symptoms}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Status and Actions */}
                        <div className="flex flex-col items-end space-y-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            booking.bookingStatus === 'Confirmed' ? 'bg-green-100 text-green-700' :
                            booking.bookingStatus === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                            booking.bookingStatus === 'Cancelled' ? 'bg-red-100 text-red-700' :
                            booking.bookingStatus === 'Completed' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {booking.bookingStatus || 'Pending'}
                          </span>

                          {/* Action Buttons */}
                          {booking.bookingStatus === 'Pending' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleBookingStatusUpdate(booking._id, 'Confirmed')}
                                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-xs rounded-lg transition-colors duration-200 flex items-center space-x-1"
                              >
                                <CheckCircle className="w-3 h-3" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => handleBookingStatusUpdate(booking._id, 'Cancelled')}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg transition-colors duration-200 flex items-center space-x-1"
                              >
                                <X className="w-3 h-3" />
                                <span>Reject</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Booking Date */}
                      <div className="text-xs text-slate-400 border-t border-slate-100 pt-3">
                        Booked on: {new Date(booking.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-playfair font-bold text-slate-900">User Details</h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {selectedUser.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="text-xl font-semibold text-slate-900">{selectedUser.name || 'Unknown'}</p>
                  <p className="text-slate-600">{selectedUser.email || 'N/A'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Role</p>
                  <p className="font-semibold text-slate-900">{selectedUser.role || 'user'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Status</p>
                  <p className="font-semibold text-slate-900">
                    {selectedUser.isActive !== false ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Phone</p>
                  <p className="font-semibold text-slate-900">{selectedUser.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Joined</p>
                  <p className="font-semibold text-slate-900">
                    {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
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
      />
    </div>
  );
}

export default AdminDashboard;