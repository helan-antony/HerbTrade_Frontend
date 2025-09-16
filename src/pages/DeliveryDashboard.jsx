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

  useEffect(() => { loadOrders(); loadAvailable(); }, []);

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
      if (!res.ok) throw new Error(data.error || 'Failed to claim order');
      // Move from available to assigned list
      setOrders(prev => [data.order, ...prev]);
      setAvailable(prev => prev.filter(o => o._id !== orderId));
    } catch (e) {
      setError(e.message);
    } finally {
      setUpdatingId('');
    }
  }

  function renderActions(order) {
    const disabled = updatingId === order._id;
    const btn = (label, st) => (
      <button
        key={st}
        disabled={disabled}
        onClick={() => updateStatus(order._id, st)}
        className={`px-3 py-1 rounded text-white mr-2 mb-2 ${disabled ? 'bg-gray-400' : 'bg-emerald-600 hover:bg-emerald-700'}`}
      >{label}</button>
    );
    const actions = [];
    if (order.deliveryStatus === 'assigned') actions.push(btn('Pick Up', 'picked_up'));
    if (['picked_up'].includes(order.deliveryStatus)) actions.push(btn('Out for Delivery', 'out_for_delivery'));
    if (['out_for_delivery'].includes(order.deliveryStatus)) actions.push(btn('Delivered', 'delivered'), btn('Failed', 'failed'));
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
        <div className="text-sm mb-2"><span className="font-medium">Total:</span> {Number(order.totalAmount).toFixed(2)}</div>
        <div className="text-sm mb-2"><span className="font-medium">Order Status:</span> {order.status}</div>
        <div className="text-sm mb-2"><span className="font-medium">Delivery Status:</span> {order.deliveryStatus || 'unassigned'}</div>
        {Array.isArray(order.items) && order.items.length > 0 && (
          <div className="mt-2 text-sm text-slate-600">
            <div className="font-medium mb-1">Items</div>
            <ul className="list-disc ml-5 space-y-1">
              {order.items.map((it, idx) => (
                <li key={idx}>
                  {(it.product?.name || 'Item')} x {it.quantity} — {Number(it.price).toFixed(2)}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-3">{actions}</div>
      </div>
    );
  }

  const mainContent = (
    <div className="p-6 md:p-8 relative z-10 max-w-7xl mx-auto">
      {/* Header like EmployeeDashboard */}
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
            {activeTab === 'available' ? (
              <button
                onClick={() => setActiveTab('my')}
                className="px-3 py-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
              >Back to My Deliveries</button>
            ) : (
              <button
                onClick={() => setActiveTab('available')}
                className="px-3 py-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
              >View Available Orders</button>
            )}
          </div>
        </div>
      </div>


      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">{error}</div>}
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
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 relative overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15" style={{ backgroundImage: 'url(/assets/bg.png)' }} />
      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      {mainContent}
    </div>
  );
}

export default DeliveryDashboard;


