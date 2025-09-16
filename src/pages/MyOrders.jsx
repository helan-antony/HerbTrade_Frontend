import { useEffect, useState } from 'react';
import { API_ENDPOINTS, apiCall } from '../config/api';

function StatusBadge({ status }) {
  const map = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-indigo-100 text-indigo-800',
    shipped: 'bg-purple-100 text-purple-800',
    out_for_delivery: 'bg-teal-100 text-teal-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${map[status] || 'bg-slate-100 text-slate-700'}`}>{status.replaceAll('_',' ')}</span>
  );
}

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await apiCall(API_ENDPOINTS.ORDERS.MY_ORDERS);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load orders');
      setOrders(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function cancel(orderId) {
    try {
      setActionId(orderId);
      const res = await apiCall(API_ENDPOINTS.ORDERS.CANCEL(orderId), { method: 'PATCH' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to cancel order');
      setOrders(prev => prev.map(o => o._id === orderId ? data : o));
    } catch (e) {
      setError(e.message);
    } finally {
      setActionId('');
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8">
      <h1 className="text-3xl font-playfair font-bold text-slate-900 mb-6">My Orders</h1>
      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order._id} className="bg-white rounded-2xl shadow border border-slate-100 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="font-semibold">Order #{String(order._id).slice(-6).toUpperCase()}</div>
                <div className="text-sm text-slate-600">{new Date(order.orderDate || order.createdAt).toLocaleString()}</div>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <StatusBadge status={order.status} />
                {order.deliveryStatus && <StatusBadge status={order.deliveryStatus} />}
                {order.trackingNumber && (
                  <span className="text-xs text-slate-600">Tracking: {order.trackingNumber}</span>
                )}
              </div>
              {/* Actions for pending/confirmed */}
              {['pending','confirmed'].includes(order.status) && (
                <div className="mt-3">
                  <button
                    disabled={actionId === order._id}
                    onClick={() => cancel(order._id)}
                    className={`px-3 py-1 rounded text-white ${actionId === order._id ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'}`}
                  >
                    Cancel Order
                  </button>
                </div>
              )}
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-slate-700 mb-2">Items</div>
                  <ul className="text-sm space-y-1">
                    {order.items?.map((it, idx) => (
                      <li key={idx} className="flex items-center justify-between">
                        <span>{it.product?.name || 'Item'} x {it.quantity}</span>
                        <span className="text-slate-600">{Number(it.price).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-700 mb-2">Summary</div>
                  <div className="text-sm flex items-center justify-between">
                    <span>Total</span>
                    <span className="font-semibold">{Number(order.totalAmount).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <div className="text-slate-600">You have not placed any orders yet.</div>
          )}
        </div>
      )}
    </div>
  );
}


