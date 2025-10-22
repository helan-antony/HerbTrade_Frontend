import { useEffect, useState } from 'react';
import { API_ENDPOINTS, apiCall } from '../config/api';
import { Calendar, Clock, CheckCircle, X, AlertCircle, Info, FileText } from 'lucide-react';

function DeliveryDashboard() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));
  const [activeTab, setActiveTab] = useState('my');
  const [orders, setOrders] = useState([]);
  const [available, setAvailable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState('');
  const [profile, setProfile] = useState(null);
  const [locationDialog, setLocationDialog] = useState(false);
  const [locationData, setLocationData] = useState({ latitude: '', longitude: '' });
  const [availabilityDialog, setAvailabilityDialog] = useState(false);
  
  // Leave management states
  const [leaves, setLeaves] = useState([]);
  const [openLeaveDialog, setOpenLeaveDialog] = useState(false);
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    type: 'sick', // sick, personal, vacation, emergency
    description: ''
  });
  const [leaveErrors, setLeaveErrors] = useState({});

  async function loadOrders() {
    setLoading(true);
    setError('');
    try {
      const res = await apiCall(API_ENDPOINTS.DELIVERY.ORDERS);
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load orders');
      setOrders(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadAvailable() {
    try {
      const res = await apiCall(API_ENDPOINTS.DELIVERY.AVAILABLE);
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load available orders');
      setAvailable(data);
    } catch (e) {
      // Non-fatal
    }
  }

  // Leave management functions
  async function loadLeaves() {
    try {
      const res = await apiCall(API_ENDPOINTS.DELIVERY.LEAVES);
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }
      const data = await res.json();
      if (res.ok) {
        setLeaves(data);
      }
    } catch (e) {
      console.error('Failed to load leaves:', e.message);
    }
  }

  const validateLeaveForm = () => {
    const errors = {};
    
    if (!leaveForm.reason.trim()) {
      errors.reason = 'Reason is required';
    } else if (leaveForm.reason.trim().length < 3) {
      errors.reason = 'Reason must be at least 3 characters';
    }
    
    if (!leaveForm.startDate) {
      errors.startDate = 'Start date is required';
    } else {
      const startDate = new Date(leaveForm.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (startDate < today) {
        errors.startDate = 'Start date cannot be in the past';
      }
    }
    
    if (!leaveForm.endDate) {
      errors.endDate = 'End date is required';
    } else {
      const startDate = new Date(leaveForm.startDate);
      const endDate = new Date(leaveForm.endDate);
      
      if (endDate < startDate) {
        errors.endDate = 'End date cannot be before start date';
      }
    }
    
    if (!leaveForm.description.trim()) {
      errors.description = 'Description is required';
    } else if (leaveForm.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }
    
    setLeaveErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleApplyLeave = async () => {
    if (leaveSubmitting) return; // Prevent double submission
    
    // Validate form
    if (!validateLeaveForm()) {
      return;
    }
    
    setLeaveSubmitting(true);
    
    try {
      const res = await apiCall(API_ENDPOINTS.DELIVERY.LEAVES, {
        method: 'POST',
        body: JSON.stringify(leaveForm)
      });
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }
      
      const data = await res.json();
      
      if (res.ok) {
        const createdLeave = data.leave || data;
        setLeaves([createdLeave, ...leaves]);
        setLeaveForm({
          startDate: '',
          endDate: '',
          reason: '',
          type: 'sick',
          description: ''
        });
        setOpenLeaveDialog(false);
        alert('Leave application submitted successfully! Admin will review and send email notification.');
      } else {
        alert(data.error || 'Failed to apply for leave');
      }
    } catch (error) {
      console.error('Error applying for leave:', error);
      alert('Failed to apply for leave: ' + error.message);
    } finally {
      setLeaveSubmitting(false);
    }
  };

  const resetLeaveForm = () => {
    setLeaveForm({
      startDate: '',
      endDate: '',
      reason: '',
      type: 'sick',
      description: ''
    });
    setLeaveSubmitting(false);
    setOpenLeaveDialog(false);
    setLeaveErrors({});
  };

  const getLeaveStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-gray-200 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLeaveTypeColor = (type) => {
    switch (type) {
      case 'sick': return 'bg-red-100 text-red-800';
      case 'personal': return 'bg-blue-100 text-blue-800';
      case 'vacation': return 'bg-green-100 text-green-800';
      case 'emergency': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateLeaveDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  };

  const handleCancelLeave = async (leaveId) => {
    if (!leaveId) return;
    if (!window.confirm('Cancel this leave request?')) return;
    
    try {
      const res = await apiCall(`${API_ENDPOINTS.DELIVERY.LEAVES}/${leaveId}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        setLeaves(leaves.filter(leave => leave._id !== leaveId));
        alert('Leave cancelled successfully');
      } else {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          alert(data.error || 'Failed to cancel leave');
        } else {
          alert('Failed to cancel leave: Server returned invalid response');
        }
      }
    } catch (error) {
      console.error('Error cancelling leave:', error);
      alert('Failed to cancel leave: ' + error.message);
    }
  };

  async function loadProfile() {
    try {
      const res = await apiCall(API_ENDPOINTS.DELIVERY.PROFILE);
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }
      const data = await res.json();
      if (res.ok) {
        setProfile(data);
        if (data.currentLocation && data.currentLocation.coordinates) {
          setLocationData({
            latitude: data.currentLocation.coordinates[1],
            longitude: data.currentLocation.coordinates[0]
          });
        }
      }
    } catch (e) {
      console.error('Failed to load profile:', e.message);
    }
  }

  async function updateLocation() {
    try {
      const res = await apiCall(API_ENDPOINTS.DELIVERY.LOCATION, {
        method: 'PUT',
        body: JSON.stringify(locationData)
      });
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update location');
      setLocationDialog(false);
      loadProfile();
      alert('Location updated successfully!');
    } catch (e) {
      alert('Failed to update location: ' + e.message);
    }
  }

  async function toggleAvailability() {
    try {
      const res = await apiCall(API_ENDPOINTS.DELIVERY.AVAILABILITY, {
        method: 'PUT'
      });
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to toggle availability');
      setAvailabilityDialog(false);
      loadProfile();
      alert(data.message);
    } catch (e) {
      alert('Failed to toggle availability: ' + e.message);
    }
  }

  useEffect(() => { loadOrders(); loadAvailable(); loadProfile(); loadLeaves(); }, []);

  async function updateStatus(orderId, status) {
    try {
      setUpdatingId(orderId);
      const res = await apiCall(API_ENDPOINTS.DELIVERY.UPDATE_STATUS(orderId), {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update');
      setOrders(prev => prev.map(o => o._id === orderId ? data.order : o));
    } catch (e) {
      setError(e.message);
    } finally {
      setUpdatingId('');
    }
  }

  async function claim(orderId) {
    try {
      setUpdatingId(orderId);
      const res = await apiCall(API_ENDPOINTS.DELIVERY.CLAIM(orderId), { method: 'POST' });
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to claim');
      setAvailable(prev => prev.filter(o => o._id !== orderId));
      setOrders(prev => [...prev, data.order]);
    } catch (e) {
      setError(e.message);
    } finally {
      setUpdatingId('');
    }
  }

  function renderActions(order) {
    // Don't show actions for cancelled orders
    if (order.status === 'cancelled') {
      return <div className="text-sm text-red-600">Order Cancelled - No Actions Available</div>;
    }
    
    const disabled = updatingId === order._id;
    const btn = (label, st, color = 'emerald') => (
      <button
        key={st}
        disabled={disabled}
        onClick={() => updateStatus(order._id, st)}
        className={`px-3 py-1 rounded text-white mr-2 mb-2 ${disabled ? 'bg-gray-400' : `bg-${color}-600 hover:bg-${color}-700`}`}
      >{label}</button>
    );
    const actions = [];
    
    // E-commerce workflow status buttons
    if (order.deliveryStatus === 'assigned') {
      actions.push(btn('📦 Pick Up Order', 'picked_up', 'blue'));
    }
    if (order.deliveryStatus === 'picked_up') {
      actions.push(btn('🚚 Out for Delivery', 'out_for_delivery', 'orange'));
    }
    if (order.deliveryStatus === 'out_for_delivery') {
      actions.push(btn('✅ Mark as Delivered', 'delivered', 'green'));
      actions.push(btn('❌ Delivery Failed', 'failed', 'red'));
    }
    if (order.deliveryStatus === 'failed') {
      actions.push(btn('🔄 Retry Delivery', 'out_for_delivery', 'orange'));
    }
    
    return <div className="flex flex-wrap">{actions}</div>;
  }

  function Card({ order, actions }) {
    // Highlight cancelled orders
    const isCancelled = order.status === 'cancelled';
    
    return (
      <div className={`bg-white rounded-3xl shadow p-4 border border-slate-100 ${isCancelled ? 'bg-red-50' : ''}`}>
        <div className="flex justify-between mb-2">
          <div className="font-semibold">#{String(order._id).slice(-6).toUpperCase()}</div>
          <div className="text-sm text-gray-600">{new Date(order.orderDate || order.createdAt).toLocaleString()}</div>
        </div>
        <div className="text-sm mb-2"><span className="font-medium">Customer:</span> {order.user?.name || 'User'}</div>
        <div className="text-sm mb-2"><span className="font-medium">Total:</span> ₹{Number(order.totalAmount).toFixed(2)}</div>
        <div className="text-sm mb-2">
          <span className="font-medium">Order Status:</span> 
          <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
            order.status === 'processing' ? 'bg-purple-100 text-purple-800' :
            order.status === 'shipped' ? 'bg-orange-100 text-orange-800' :
            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
            {isCancelled && ' (CANCELLED)'}
          </span>
        </div>
        <div className="text-sm mb-2">
          <span className="font-medium">Delivery Status:</span> 
          <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
            order.deliveryStatus === 'unassigned' ? 'bg-gray-100 text-gray-800' :
            order.deliveryStatus === 'assigned' ? 'bg-blue-100 text-blue-800' :
            order.deliveryStatus === 'picked_up' ? 'bg-purple-100 text-purple-800' :
            order.deliveryStatus === 'out_for_delivery' ? 'bg-orange-100 text-orange-800' :
            order.deliveryStatus === 'delivered' ? 'bg-green-100 text-green-800' :
            order.deliveryStatus === 'failed' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {order.deliveryStatus ? order.deliveryStatus.charAt(0).toUpperCase() + order.deliveryStatus.slice(1).replace('_', ' ') : 'Unassigned'}
          </span>
        </div>
        {Array.isArray(order.items) && order.items.length > 0 && (
          <div className="mt-2 text-sm text-slate-600">
            <div className="font-medium mb-1">Items</div>
            <ul className="list-disc ml-5 space-y-1">
              {order.items.map((it, idx) => (
                <li key={idx}>
                  {(it.product?.name || 'Item')} x {it.quantity} — ₹{Number(it.price).toFixed(2)}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-3">{actions}</div>
        {isCancelled && (
          <div className="mt-2 text-sm text-red-600 font-medium">
            This order has been cancelled and cannot be delivered.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 relative overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15" style={{ backgroundImage: 'url(/assets/bg.png)' }} />
      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      
      <div className="p-6 md:p-8 relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-playfair font-bold text-slate-900">Delivery Dashboard</h1>
            <p className="text-slate-600 mt-1">Manage assigned deliveries and claim new orders</p>
          </div>
          <div />
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/80 rounded-2xl border border-white/50 shadow p-4">
            <div className="text-sm text-slate-500">Assigned</div>
            <div className="text-2xl font-bold text-slate-900">{orders.length}</div>
          </div>
          <div className="bg-white/80 rounded-2xl border border-white/50 shadow p-4">
            <div className="text-sm text-slate-500">Available</div>
            <div className="text-2xl font-bold text-slate-900">{available.length}</div>
          </div>
          <div className="bg-white/80 rounded-2xl border border-white/50 shadow p-4">
            <div className="text-sm text-slate-500">Refresh</div>
            <button
              onClick={() => { loadOrders(); loadAvailable(); }}
              className="mt-1 px-4 py-2 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700"
            >Reload</button>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => setLocationDialog(true)}
                className="px-3 py-1 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
              >
                📍 Update Location
              </button>
              <button
                onClick={() => setAvailabilityDialog(true)}
                className={`px-3 py-1 rounded-lg text-sm ${
                  profile?.isAvailable 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                } text-white`}
              >
                {profile?.isAvailable ? '✓ Available' : '✗ Unavailable'}
              </button>
            </div>
          </div>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">{error}</div>}

        {/* Toggle buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('my')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'my'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'bg-white/80 text-slate-700 hover:bg-white border border-slate-200'
            }`}
          >
            My Deliveries ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('available')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'available'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'bg-white/80 text-slate-700 hover:bg-white border border-slate-200'
            }`}
          >
            Available Orders ({available.length})
          </button>
          <button
            onClick={() => setActiveTab('leaves')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'leaves'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'bg-white/80 text-slate-700 hover:bg-white border border-slate-200'
            }`}
          >
            Leave Management ({leaves.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'my' && (
          loading ? <div>Loading...</div> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orders.map(order => (
                <Card key={order._id} order={order} actions={renderActions(order)} />
              ))}
              {orders.length === 0 && (
                <div className="col-span-full text-gray-600">
                  No orders assigned to you yet. Check the "Available Orders" tab and claim one.
                </div>
              )}
            </div>
          )
        )}

        {activeTab === 'available' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {available.map(order => (
              <Card
                key={order._id}
                order={order}
                actions={
                  order.status === 'cancelled' ? (
                    <span className="inline-block px-3 py-1 rounded bg-red-100 text-red-600 text-sm">Cancelled</span>
                  ) : !order.deliveryAssignee ? (
                    <button
                      disabled={updatingId === order._id}
                      onClick={() => claim(order._id)}
                      className={`px-3 py-1 rounded text-white ${updatingId === order._id ? 'bg-gray-400' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                    >
                      Claim Order
                    </button>
                  ) : (
                    <span className="inline-block px-3 py-1 rounded bg-slate-100 text-slate-600 text-sm">Assigned</span>
                  )
                }
              />
            ))}
            {available.length === 0 && (
              <div className="col-span-full text-gray-600">No available orders right now.</div>
            )}
          </div>
        )}

        {/* Leave Management Tab */}
        {activeTab === 'leaves' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center">
                <Calendar className="w-6 h-6 mr-2 text-emerald-600" />
                Leave Management
              </h2>
              <button
                onClick={() => setOpenLeaveDialog(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <span>Apply for Leave</span>
              </button>
            </div>

            {/* Leave Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">Total Applied</p>
                    <p className="text-2xl font-bold text-blue-700">{leaves.length}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Approved</p>
                    <p className="text-2xl font-bold text-green-700">
                      {leaves.filter(leave => leave.status === 'approved').length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-600 text-sm font-medium">Pending</p>
                    <p className="text-2xl font-bold text-yellow-700">
                      {leaves.filter(leave => leave.status === 'pending').length}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-600 text-sm font-medium">Rejected</p>
                    <p className="text-2xl font-bold text-red-700">
                      {leaves.filter(leave => leave.status === 'rejected').length}
                    </p>
                  </div>
                  <X className="w-8 h-8 text-red-500" />
                </div>
              </div>
            </div>

            {/* Leave Applications Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaves.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                        No leave applications found
                      </td>
                    </tr>
                  ) : (
                    leaves.map((leave) => (
                      <tr key={leave._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getLeaveTypeColor(leave.type)}`}>
                            {leave.type.charAt(0).toUpperCase() + leave.type.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {leave.reason}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {calculateLeaveDays(leave.startDate, leave.endDate)} days
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getLeaveStatusColor(leave.status)}`}>
                            {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {leave.status === 'pending' && (
                            <button
                              onClick={() => handleCancelLeave(leave._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      {/* Location Update Dialog */}
      {locationDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">Update Location</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={locationData.latitude}
                  onChange={(e) => setLocationData(prev => ({ ...prev, latitude: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 12.9716"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={locationData.longitude}
                  onChange={(e) => setLocationData(prev => ({ ...prev, longitude: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 77.5946"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setLocationDialog(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={updateLocation}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Availability Toggle Dialog */}
      {availabilityDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">Toggle Availability</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to {profile?.isAvailable ? 'mark yourself as unavailable' : 'mark yourself as available'} for deliveries?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setAvailabilityDialog(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={toggleAvailability}
                className={`flex-1 px-4 py-2 text-white rounded-lg ${
                  profile?.isAvailable 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {profile?.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Leave Application Dialog */}
      {openLeaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Apply for Leave</h3>
                <button
                  onClick={resetLeaveForm}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleApplyLeave(); }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Leave Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={leaveForm.type}
                      onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="sick">Sick Leave</option>
                      <option value="personal">Personal Leave</option>
                      <option value="vacation">Vacation</option>
                      <option value="emergency">Emergency Leave</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={leaveForm.reason}
                      onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                      className={`w-full px-3 py-2 border ${leaveErrors.reason ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                      placeholder="e.g., Medical appointment, Family event"
                    />
                    {leaveErrors.reason && (
                      <p className="mt-1 text-sm text-red-600">{leaveErrors.reason}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={leaveForm.startDate}
                      onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                      className={`w-full px-3 py-2 border ${leaveErrors.startDate ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    {leaveErrors.startDate && (
                      <p className="mt-1 text-sm text-red-600">{leaveErrors.startDate}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={leaveForm.endDate}
                      onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                      className={`w-full px-3 py-2 border ${leaveErrors.endDate ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                      min={leaveForm.startDate || new Date().toISOString().split('T')[0]}
                    />
                    {leaveErrors.endDate && (
                      <p className="mt-1 text-sm text-red-600">{leaveErrors.endDate}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Detailed Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={leaveForm.description}
                    onChange={(e) => setLeaveForm({ ...leaveForm, description: e.target.value })}
                    className={`w-full px-3 py-2 border ${leaveErrors.description ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                    rows={4}
                    placeholder="Provide detailed explanation for your leave request..."
                  />
                  {leaveErrors.description && (
                    <p className="mt-1 text-sm text-red-600">{leaveErrors.description}</p>
                  )}
                </div>
                
                {leaveForm.startDate && leaveForm.endDate && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <Info className="w-5 h-5 text-blue-600 mr-2" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium">Leave Duration: {calculateLeaveDays(leaveForm.startDate, leaveForm.endDate)} days</p>
                        <p className="text-blue-600">
                          From {new Date(leaveForm.startDate).toLocaleDateString()} to {new Date(leaveForm.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-1">Important Notes:</p>
                      <ul className="list-disc list-inside space-y-1 text-yellow-700">
                        <li>Leave applications must be submitted at least 24 hours in advance</li>
                        <li>Admin will review your application and send email notification</li>
                        <li>Emergency leaves may be approved with shorter notice</li>
                        <li>All fields marked with <span className="text-red-500">*</span> are required</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={resetLeaveForm}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={leaveSubmitting}
                    className={`px-6 py-2 ${leaveSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'} text-white rounded-lg transition-colors flex items-center space-x-2`}
                  >
                    {leaveSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Calendar className="w-4 h-4" />
                        <span>Submit Application</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeliveryDashboard;