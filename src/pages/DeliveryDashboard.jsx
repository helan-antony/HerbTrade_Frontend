import { useEffect, useState } from 'react';
import { API_ENDPOINTS, apiCall } from '../config/api';

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

  async function loadOrders() {
    setLoading(true);
    setError('');
    try {
      const res = await apiCall(API_ENDPOINTS.DELIVERY.ORDERS);
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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load available orders');
      setAvailable(data);
    } catch (e) {
      // Non-fatal
    }
  }

  async function loadProfile() {
    try {
      const res = await apiCall(API_ENDPOINTS.DELIVERY.PROFILE);
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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to toggle availability');
      setAvailabilityDialog(false);
      loadProfile();
      alert(data.message);
    } catch (e) {
      alert('Failed to toggle availability: ' + e.message);
    }
  }

  useEffect(() => { loadOrders(); loadAvailable(); loadProfile(); }, []);

  async function updateStatus(orderId, status) {
    try {
      setUpdatingId(orderId);
      const res = await apiCall(API_ENDPOINTS.DELIVERY.UPDATE_STATUS(orderId), {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
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
    return (
      <div className="bg-white rounded-3xl shadow p-4 border border-slate-100">
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
                  (!order.deliveryAssignee ? (
                    <button
                      disabled={updatingId === order._id}
                      onClick={() => claim(order._id)}
                      className={`px-3 py-1 rounded text-white ${updatingId === order._id ? 'bg-gray-400' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                    >
                      Claim Order
                    </button>
                  ) : (
                    <span className="inline-block px-3 py-1 rounded bg-slate-100 text-slate-600 text-sm">Assigned</span>
                  ))
                }
              />
            ))}
            {available.length === 0 && (
              <div className="col-span-full text-gray-600">No available orders right now.</div>
            )}
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
    </div>
  );
}

export default DeliveryDashboard;