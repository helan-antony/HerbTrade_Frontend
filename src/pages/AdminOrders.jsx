import { useEffect, useState } from 'react';
import { API_ENDPOINTS, apiCall } from '../config/api';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const [assignSel, setAssignSel] = useState({});
  const [nearestDeliveries, setNearestDeliveries] = useState({});

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [oRes, dRes] = await Promise.all([
        apiCall(API_ENDPOINTS.ADMIN.ORDERS),
        apiCall(API_ENDPOINTS.ADMIN.DELIVERIES)
      ]);
      const [oData, dData] = await Promise.all([oRes.json(), dRes.json()]);
      if (!oRes.ok) throw new Error(oData.error || 'Failed to load orders');
      if (!dRes.ok) throw new Error(dData.error || 'Failed to load deliveries');
      setOrders(oData);
      setDeliveries(dData);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function approve(orderId) {
    try {
      setBusyId(orderId);
      const res = await apiCall(API_ENDPOINTS.ADMIN.ORDER_APPROVE(orderId), { method: 'PATCH' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to approve');
      setOrders(prev => prev.map(o => o._id === orderId ? data.order : o));
    } catch (e) { setError(e.message); } finally { setBusyId(''); }
  }


  async function loadNearestDeliveries(orderId) {
    try {
      const res = await apiCall(API_ENDPOINTS.ADMIN.ORDER_NEAREST_DELIVERIES(orderId));
      const data = await res.json();
      if (res.ok) {
        setNearestDeliveries(prev => ({ ...prev, [orderId]: data }));
      }
    } catch (e) {
      console.error('Failed to load nearest deliveries:', e.message);
    }
  }

  async function autoAssign(orderId) {
    try {
      setBusyId(orderId);
      const res = await apiCall(API_ENDPOINTS.ADMIN.ORDER_AUTO_ASSIGN(orderId), { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to auto-assign');
      setOrders(prev => prev.map(o => o._id === orderId ? data.order : o));
      alert(`Order auto-assigned to ${data.delivery.name} (${data.distance.toFixed(2)} km away)`);
    } catch (e) { 
      setError(e.message); 
    } finally { 
      setBusyId(''); 
    }
  }

  async function assign(orderId, deliveryId) {
    try {
      setBusyId(orderId);
      const res = await apiCall(API_ENDPOINTS.ADMIN.ORDER_ASSIGN(orderId), { method: 'POST', body: JSON.stringify({ deliveryId }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to assign');
      setOrders(prev => prev.map(o => o._id === orderId ? data.order : o));
      alert(`Order assigned to delivery agent successfully!`);
    } catch (e) { setError(e.message); } finally { setBusyId(''); }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8">
      <h1 className="text-3xl font-playfair font-bold text-slate-900 mb-6">Orders</h1>
      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order._id} className={`bg-white rounded-2xl border border-slate-100 shadow p-4 ${order.status === 'cancelled' ? 'bg-red-50' : ''}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="font-semibold">#{String(order._id).slice(-6).toUpperCase()} — {order.user?.name || 'User'}</div>
                <div className="text-sm text-slate-600">{new Date(order.orderDate || order.createdAt).toLocaleString()}</div>
              </div>
              <div className="mt-2 text-sm text-slate-700 flex flex-wrap gap-3 items-center">
                <span>Status: 
                  <span className={`ml-1 px-2 py-1 rounded text-xs font-medium ${
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
                </span>
                <span>Total: <b>₹{Number(order.totalAmount).toFixed(2)}</b></span>
                <span>Delivery: <b>{order.deliveryAssignee?.name || 'Unassigned'}</b></span>
              </div>
              <div className="mt-2">
                <div className="text-sm font-medium text-slate-700 mb-1">Items</div>
                <ul className="text-sm text-slate-700 space-y-1">
                  {order.items?.map((it, idx) => (
                    <li key={idx} className="flex justify-between">
                      <span>{it.product?.name || 'Item'} x {it.quantity}</span>
                      <span>{Number(it.price).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {order.status === 'pending' && (
                  <button disabled={busyId === order._id} onClick={() => approve(order._id)} className={`px-3 py-1 rounded text-white ${busyId === order._id ? 'bg-gray-400' : 'bg-emerald-600 hover:bg-emerald-700'}`}>Approve</button>
                )}
                {order.status !== 'cancelled' && (
                  <>
                    {/* Auto-assign button */}
                    <button
                      disabled={busyId === order._id}
                      onClick={() => autoAssign(order._id)}
                      className={`px-3 py-1 rounded text-white ${busyId === order._id ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                      Auto-Assign Nearest
                    </button>
                    
                    {/* Manual assignment */}
                    <div className="flex items-center gap-2">
                      <select
                        disabled={busyId === order._id}
                        onChange={(e) => setAssignSel(prev => ({ ...prev, [order._id]: e.target.value }))}
                        value={assignSel[order._id] || ''}
                        className="px-3 py-1 rounded border"
                      >
                        <option value="" disabled>Assign delivery</option>
                        {deliveries.map(d => (
                          <option key={d._id} value={d._id}>
                            {d.name} ({d.email}) {d.isAvailable ? '✓' : '✗'}
                          </option>
                        ))}
                      </select>
                      <button
                        disabled={busyId === order._id}
                        onClick={() => {
                          const selected = assignSel[order._id];
                          if (!selected) return alert('Please select a delivery user');
                          assign(order._id, selected);
                        }}
                        className={`px-3 py-1 rounded ${busyId === order._id ? 'bg-slate-100 text-slate-500' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                      >Assign</button>
                    </div>
                    
                    {/* Nearest deliveries info */}
                    {nearestDeliveries[order._id] && (
                      <div className="text-xs text-blue-600">
                        Nearest: {nearestDeliveries[order._id].slice(0, 3).map(d => 
                          `${d.name} (${d.distance}km)`
                        ).join(', ')}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


