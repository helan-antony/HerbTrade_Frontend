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
  const [leaves, setLeaves] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    activeUsers: 0,
    totalLeaves: 0,
    pendingLeaves: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveComment, setLeaveComment] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Validation states
  const [leaveErrors, setLeaveErrors] = useState({});

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
      const [usersRes, ordersRes, productsRes, hospitalBookingsRes, leavesRes, leaveStatsRes] = await Promise.all([
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
        }),
        fetch('http://localhost:5000/api/admin/leaves', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/admin/leaves/stats', {
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

      if (leavesRes.ok) {
        const leavesData = await leavesRes.json();
        setLeaves(leavesData);
        
        // Create notifications for pending leaves
        const pendingLeaves = leavesData.filter(leave => leave.status === 'pending');
        const leaveNotifications = pendingLeaves.map(leave => ({
          id: leave._id,
          type: 'leave',
          title: 'New Leave Application',
          message: `${leave.seller.name} has applied for ${leave.type} leave`,
          timestamp: new Date(leave.createdAt),
          data: leave
        }));
        setNotifications(leaveNotifications);
      }

      let leaveStats = { totalLeaves: 0, pendingLeaves: 0 };
      if (leaveStatsRes.ok) {
        leaveStats = await leaveStatsRes.json();
      }

      // Calculate stats
      const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.totalAmount || order.total) || 0), 0);
      const pendingOrders = orders.filter(order => order.status === 'pending').length;
      const activeUsers = users.filter(user => user.isActive !== false).length;

      setStats({
        totalUsers: users.length,
        totalOrders: orders.length,
        totalProducts: products.length,
        totalRevenue,
        pendingOrders,
        activeUsers,
        totalLeaves: leaveStats.totalLeaves,
        pendingLeaves: leaveStats.pendingLeaves
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Validation functions
  const validateLeaveAction = (comment, action) => {
    const errors = {};
    
    // For rejection, comment is required
    if (action === 'rejected' && !comment.trim()) {
      errors.comment = 'Comment is required when rejecting a leave application';
    } else if (comment.trim().length > 500) {
      errors.comment = 'Comment must be less than 500 characters';
    }
    
    setLeaveErrors(errors);
    return Object.keys(errors).length === 0;
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
        toast.error(error.error || error.message || 'Failed to update booking status');
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
    }
  };

  // Leave management functions
  const handleLeaveAction = async (leaveId, status, comment = '') => {
    // Validate form
    if (!validateLeaveAction(comment, status)) {
      toast.error('Please fix the validation errors');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/leaves/${leaveId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, adminComment: comment })
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message || `Leave application ${status} successfully`);
        
        // Update local state
        setLeaves(prev =>
          prev.map(leave =>
            leave._id === leaveId
              ? { ...leave, status, adminComment: comment, reviewedAt: new Date() }
              : leave
          )
        );

        // Remove from notifications
        setNotifications(prev => prev.filter(notif => notif.id !== leaveId));
        
        // Close modal
        setShowLeaveModal(false);
        setSelectedLeave(null);
        setLeaveComment('');
        setLeaveErrors({});
        
        // Refresh data
        fetchDashboardData();
      } else {
        const error = await response.json();
        toast.error(error.error || `Failed to ${status} leave application`);
      }
    } catch (error) {
      console.error(`Error ${status} leave:`, error);
      toast.error(`Failed to ${status} leave application`);
    }
  };

  const openLeaveModal = (leave) => {
    setSelectedLeave(leave);
    setLeaveComment(leave.adminComment || '');
    setLeaveErrors({});
    setShowLeaveModal(true);
  };

  const closeLeaveModal = () => {
    setSelectedLeave(null);
    setLeaveComment('');
    setLeaveErrors({});
    setShowLeaveModal(false);
  };

  // Notification functions
  const unreadCount = notifications.length;
  
  const markAllNotificationsAsRead = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (notification) => {
    if (notification.type === 'leave') {
      setActiveTab('leaves');
      openLeaveModal(notification.data);
    }
    setShowNotifications(false);
  };

  const StatCard = ({ title, value, icon: Icon, color, change }) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-600 text-sm font-medium mb-2">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mb-1">{value}</p>
          {change && (
            <p className={`text-sm font-medium flex items-center ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className="w-4 h-4 mr-1" />
              {change > 0 ? '+' : ''}{change}%
            </p>
          )}
        </div>
        <div className={`p-4 rounded-2xl ${color} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  );

  const TabButton = ({ id, label, icon: Icon, isActive, onClick, badge }) => (
    <button
      onClick={() => onClick(id)}
      className={`relative flex items-center space-x-3 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 ${
        isActive
          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
          : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-600'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
      {badge > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-pulse">
          {badge > 99 ? '99+' : badge}
        </span>
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 pt-24 pb-12 relative">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-5"
        style={{ backgroundImage: 'url(/assets/bg.png)' }}
      />

      {/* Floating decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-playfair font-bold text-slate-900 tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-lg text-slate-600 font-medium">
              🛡️ Manage your HerbTrade platform
            </p>
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
                          key={notification.id}
                          className="p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors duration-200 bg-emerald-50/50"
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 rounded-full mt-2 bg-emerald-500" />
                            <div className="flex-1">
                              <p className="font-medium text-slate-900">{notification.title}</p>
                              <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                              <p className="text-xs text-slate-400 mt-2">
                                {notification.timestamp.toLocaleString()}
                              </p>
                            </div>
                            {notification.type === 'leave' && (
                              <Clock className="w-4 h-4 text-emerald-600 mt-1" />
                            )}
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            color="bg-gradient-to-r from-blue-500 to-blue-600"
            change={12}
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={ShoppingCart}
            color="bg-gradient-to-r from-emerald-500 to-emerald-600"
            change={8}
          />
          <StatCard
            title="Products"
            value={stats.totalProducts}
            icon={Package}
            color="bg-gradient-to-r from-purple-500 to-purple-600"
            change={-2}
          />
          <StatCard
            title="Revenue"
            value={`₹${stats.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            color="bg-gradient-to-r from-orange-500 to-orange-600"
            change={15}
          />
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 mb-8">
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
            <TabButton
              id="leaves"
              label="Leave Management"
              icon={Clock}
              isActive={activeTab === 'leaves'}
              onClick={setActiveTab}
              badge={stats.pendingLeaves}
            />
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-playfair font-bold text-slate-900 mb-6">Platform Overview</h2>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-emerald-500 rounded-xl">
                      <UserCheck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-emerald-600 font-semibold">Active Users</p>
                      <p className="text-2xl font-bold text-slate-900">{stats.activeUsers}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border border-orange-200">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-orange-500 rounded-xl">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-orange-600 font-semibold">Pending Orders</p>
                      <p className="text-2xl font-bold text-slate-900">{stats.pendingOrders}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-purple-500 rounded-xl">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-purple-600 font-semibold">Appointments</p>
                      <p className="text-2xl font-bold text-slate-900">{appointments.length}</p>
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

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-4 px-4 font-semibold text-slate-700">User</th>
                      <th className="text-left py-4 px-4 font-semibold text-slate-700">Email</th>
                      <th className="text-left py-4 px-4 font-semibold text-slate-700">Role</th>
                      <th className="text-left py-4 px-4 font-semibold text-slate-700">Status</th>
                      <th className="text-left py-4 px-4 font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter(user => 
                      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((user, index) => (
                      <tr key={user._id || index} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {user.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{user.name || 'Unknown'}</p>
                              <p className="text-sm text-slate-600">ID: {user._id?.slice(-6) || 'N/A'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-slate-600">{user.email || 'N/A'}</td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                            user.role === 'seller' ? 'bg-blue-100 text-blue-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {user.role || 'user'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {user.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowUserModal(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleUserAction(user._id, user.isActive !== false ? 'deactivate' : 'activate')}
                              className={`p-2 rounded-lg transition-colors ${
                                user.isActive !== false 
                                  ? 'text-red-600 hover:bg-red-50' 
                                  : 'text-green-600 hover:bg-green-50'
                              }`}
                            >
                              {user.isActive !== false ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
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
            <div className="space-y-6">
              <h2 className="text-2xl font-playfair font-bold text-slate-900">Order Management</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {orders.map((order, index) => (
                  <div key={order._id || index} className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-semibold text-slate-900">Order #{order.id || index + 1}</p>
                        <p className="text-sm text-slate-600">{order.date || 'Recent'}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'completed' ? 'bg-green-100 text-green-700' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {order.status || 'pending'}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-slate-600">Customer: {order.customerName || 'N/A'}</p>
                      <p className="text-slate-600">Items: {order.items?.length || 0}</p>
                      <p className="font-semibold text-slate-900">Total: ₹{order.total || 0}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-playfair font-bold text-slate-900">Product Management</h2>
                <button className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors">
                  <Plus className="w-5 h-5" />
                  <span>Add Product</span>
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

          {/* Leave Management Tab */}
          {activeTab === 'leaves' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-playfair font-bold text-slate-900">Leave Management</h2>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-slate-600">
                    Total: {stats.totalLeaves} | Pending: {stats.pendingLeaves}
                  </span>
                  <button
                    onClick={fetchDashboardData}
                    className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors duration-200"
                    title="Refresh leaves"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Leave Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-blue-600 font-semibold">Total Leaves</p>
                      <p className="text-2xl font-bold text-blue-800">{stats.totalLeaves}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yellow-500 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-yellow-600 font-semibold">Pending</p>
                      <p className="text-2xl font-bold text-yellow-800">{stats.pendingLeaves}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-green-600 font-semibold">Approved</p>
                      <p className="text-2xl font-bold text-green-800">
                        {leaves.filter(leave => leave.status === 'approved').length}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-xl border border-red-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-500 rounded-lg">
                      <X className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-red-600 font-semibold">Rejected</p>
                      <p className="text-2xl font-bold text-red-800">
                        {leaves.filter(leave => leave.status === 'rejected').length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Leave Applications List */}
              <div className="space-y-4">
                {leaves.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl">
                    <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 text-lg">No leave applications found</p>
                    <p className="text-slate-400 text-sm">Leave applications will appear here when sellers submit them</p>
                  </div>
                ) : (
                  leaves.map((leave) => (
                    <div key={leave._id} className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 space-y-3">
                          {/* Seller Information */}
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 text-lg">
                                {leave.seller?.name || 'Unknown Seller'}
                              </p>
                              <p className="text-sm text-slate-500">
                                {leave.seller?.email || 'No email'}
                              </p>
                            </div>
                          </div>

                          {/* Leave Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-600">
                                  <strong>Type:</strong> {leave.type.charAt(0).toUpperCase() + leave.type.slice(1)}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-600">
                                  <strong>Duration:</strong> {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <AlertCircle className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-600">
                                  <strong>Reason:</strong> {leave.reason}
                                </span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  leave.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  leave.status === 'approved' ? 'bg-green-100 text-green-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                                </span>
                              </div>
                              {leave.reviewedBy && (
                                <div className="text-sm text-slate-500">
                                  <strong>Reviewed:</strong> {new Date(leave.reviewedAt).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Description */}
                          <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                            <p className="text-sm text-slate-700">
                              <strong>Description:</strong> {leave.description}
                            </p>
                          </div>

                          {/* Admin Comment */}
                          {leave.adminComment && (
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <p className="text-sm text-blue-700">
                                <strong>Admin Comment:</strong> {leave.adminComment}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        {leave.status === 'pending' && (
                          <div className="flex flex-col space-y-2 ml-4">
                            <button
                              onClick={() => openLeaveModal(leave)}
                              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span>Review</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Application Date */}
                      <div className="text-xs text-slate-400 border-t border-slate-100 pt-3">
                        Applied on: {new Date(leave.createdAt).toLocaleString()}
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-amber-50/95 via-stone-50/95 to-slate-100/95 rounded-3xl shadow-2xl max-w-5xl w-full p-0 relative overflow-hidden border border-stone-200/50">
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
              style={{ backgroundImage: 'url(/assets/bg.png)' }}
            />
            {/* Background decorative elements */}
            <div className="absolute top-10 right-10 w-32 h-32 bg-emerald-200/20 rounded-full blur-2xl" />
            <div className="absolute bottom-10 left-10 w-24 h-24 bg-teal-200/20 rounded-full blur-2xl" />

            <div className="relative z-10">
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-800/5 via-stone-100/50 to-emerald-50/30 px-8 py-6 border-b border-stone-200/50">
                <div className="flex justify-between items-center">
                  <h3 className="text-3xl font-playfair font-bold text-slate-800">User Details</h3>
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="p-2 text-slate-500 hover:text-slate-700 rounded-xl hover:bg-white/50 transition-all duration-200"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Personal Information */}
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-md border border-stone-200/50 p-6">
                    <h4 className="text-xl font-playfair font-bold text-slate-800 mb-6 pb-3 border-b border-stone-200/50">
                      Personal Information
                    </h4>

                    <div className="space-y-5">
                      <div>
                        <p className="text-sm font-medium text-stone-600 mb-2">Name</p>
                        <p className="text-lg font-semibold text-slate-800">{selectedUser.name || 'Liji Antony'}</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-stone-600 mb-2">Email</p>
                        <p className="text-lg font-semibold text-slate-800">{selectedUser.email || 'lijiantony20@gmail.com'}</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-stone-600 mb-2">Phone</p>
                        <p className="text-lg font-semibold text-slate-800">{selectedUser.phone || '8606187314'}</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-stone-600 mb-2">Status</p>
                        <span className={`inline-block px-4 py-2 text-sm font-semibold rounded-full ${
                          selectedUser.isActive !== false ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
                        }`}>
                          {selectedUser.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Activity Summary */}
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-md border border-stone-200/50 p-6">
                    <h4 className="text-xl font-playfair font-bold text-slate-800 mb-6 pb-3 border-b border-stone-200/50">
                      Activity Summary
                    </h4>

                    <div className="space-y-5">
                      <div>
                        <p className="text-sm font-medium text-stone-600 mb-2">Cart Items</p>
                        <p className="text-4xl font-playfair font-bold text-slate-800">
                          {selectedUser.stats?.cartItems || 0}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-stone-600 mb-2">Wishlist Items</p>
                        <p className="text-4xl font-playfair font-bold text-slate-800">
                          {selectedUser.stats?.wishlistItems || 0}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-stone-600 mb-2">Total Bookings</p>
                        <p className="text-4xl font-playfair font-bold text-slate-800">
                          {selectedUser.stats?.totalBookings || 0}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-stone-600 mb-2">Cart Value</p>
                        <p className="text-4xl font-playfair font-bold text-emerald-600">
                          ₹{selectedUser.stats?.cartValue || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-stone-200/50">
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="px-8 py-3 bg-stone-200/80 hover:bg-stone-300/80 text-stone-700 font-bold rounded-xl transition-all duration-300 border border-stone-300/50 hover:border-stone-400/50"
                  >
                    CLOSE
                  </button>
                  <button
                    onClick={() => handleUserAction(selectedUser._id, selectedUser.isActive !== false ? 'disable' : 'enable')}
                    className={`px-8 py-3 font-bold rounded-xl transition-all duration-300 border-2 ${
                      selectedUser.isActive !== false
                        ? 'bg-red-600 hover:bg-red-700 text-white border-red-700 hover:border-red-800 shadow-lg hover:shadow-red-200'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 hover:border-emerald-800 shadow-lg hover:shadow-emerald-200'
                    }`}
                  >
                    {selectedUser.isActive !== false ? 'DISABLE USER' : 'ENABLE USER'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leave Review Modal */}
      {showLeaveModal && selectedLeave && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-amber-50/95 via-stone-50/95 to-slate-100/95 rounded-3xl shadow-2xl max-w-2xl w-full p-0 relative overflow-hidden border border-stone-200/50">
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
              style={{ backgroundImage: 'url(/assets/bg.png)' }}
            />
            {/* Background decorative elements */}
            <div className="absolute top-10 right-10 w-32 h-32 bg-emerald-200/20 rounded-full blur-2xl" />
            <div className="absolute bottom-10 left-10 w-24 h-24 bg-teal-200/20 rounded-full blur-2xl" />

            <div className="relative z-10">
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-800/5 via-stone-100/50 to-emerald-50/30 px-8 py-6 border-b border-stone-200/50">
                <div className="flex justify-between items-center">
                  <h3 className="text-3xl font-playfair font-bold text-slate-800">Review Leave Application</h3>
                  <button
                    onClick={closeLeaveModal}
                    className="p-2 text-slate-500 hover:text-slate-700 rounded-xl hover:bg-white/50 transition-all duration-200"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                {/* Leave Details */}
                <div className="space-y-6">
                  {/* Seller Info */}
                  <div className="flex items-center space-x-4 p-4 bg-white/60 rounded-xl border border-stone-200/50">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-lg">{selectedLeave.seller?.name}</p>
                      <p className="text-sm text-slate-600">{selectedLeave.seller?.email}</p>
                    </div>
                  </div>

                  {/* Leave Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-white/60 rounded-xl border border-stone-200/50">
                        <p className="text-sm text-slate-600 mb-1">Leave Type</p>
                        <p className="font-semibold text-slate-900 capitalize">{selectedLeave.type}</p>
                      </div>
                      <div className="p-4 bg-white/60 rounded-xl border border-stone-200/50">
                        <p className="text-sm text-slate-600 mb-1">Duration</p>
                        <p className="font-semibold text-slate-900">
                          {new Date(selectedLeave.startDate).toLocaleDateString()} - {new Date(selectedLeave.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="p-4 bg-white/60 rounded-xl border border-stone-200/50">
                        <p className="text-sm text-slate-600 mb-1">Reason</p>
                        <p className="font-semibold text-slate-900">{selectedLeave.reason}</p>
                      </div>
                      <div className="p-4 bg-white/60 rounded-xl border border-stone-200/50">
                        <p className="text-sm text-slate-600 mb-1">Applied On</p>
                        <p className="font-semibold text-slate-900">
                          {new Date(selectedLeave.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="p-4 bg-white/60 rounded-xl border border-stone-200/50">
                    <p className="text-sm text-slate-600 mb-2">Description</p>
                    <p className="text-slate-900">{selectedLeave.description}</p>
                  </div>

                  {/* Admin Comment */}
                  <div className="p-4 bg-white/60 rounded-xl border border-stone-200/50">
                    <label className="block text-sm text-slate-600 mb-2">Admin Comment (Optional)</label>
                    <div>
                      <textarea
                        value={leaveComment}
                        onChange={(e) => {
                          setLeaveComment(e.target.value);
                          if (leaveErrors.comment && e.target.value.trim().length <= 500) {
                            setLeaveErrors({ ...leaveErrors, comment: '' });
                          }
                        }}
                        className={`w-full px-4 py-3 border ${leaveErrors.comment ? 'border-red-500' : 'border-stone-300/50'} rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 backdrop-blur-sm`}
                        rows="3"
                        placeholder="Add a comment about your decision..."
                      />
                      {leaveErrors.comment && (
                        <p className="mt-1 text-sm text-red-600">{leaveErrors.comment}</p>
                      )}
                      <p className="text-xs text-stone-500 mt-1">Required when rejecting. Max 500 characters.</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-stone-200/50">
                  <button
                    onClick={closeLeaveModal}
                    className="px-8 py-3 bg-stone-200/80 hover:bg-stone-300/80 text-stone-700 font-bold rounded-xl transition-all duration-300 border border-stone-300/50 hover:border-stone-400/50"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={() => handleLeaveAction(selectedLeave._id, 'rejected', leaveComment)}
                    className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all duration-300 border-2 border-red-700 hover:border-red-800 shadow-lg hover:shadow-red-200"
                  >
                    REJECT
                  </button>
                  <button
                    onClick={() => handleLeaveAction(selectedLeave._id, 'approved', leaveComment)}
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all duration-300 border-2 border-emerald-700 hover:border-emerald-800 shadow-lg hover:shadow-emerald-200"
                  >
                    APPROVE
                  </button>
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