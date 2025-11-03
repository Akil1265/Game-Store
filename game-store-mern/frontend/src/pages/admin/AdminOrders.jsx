import { useState, useEffect } from 'react';
import { orderService } from '../../services/gameStoreService';
import LoadingSpinner from '../../components/LoadingSpinner';

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0, limit: 20 });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await orderService.getAllOrders({
        page: currentPage,
        status: statusFilter || undefined
      });
      const data = response.data || {};
      setOrders(Array.isArray(data.orders) ? data.orders : []);
      if (data.pagination) {
        setPagination({
          current: data.pagination.current,
          pages: data.pagination.pages,
          total: data.pagination.total,
          limit: data.pagination.limit
        });
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError('You need admin access to view orders. Please log back in.');
      } else {
        setError(err.response?.data?.error || 'Failed to fetch orders');
      }
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, { orderStatus: newStatus });
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update order status');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <LoadingSpinner message="Fetching orders..." />
      </div>
    );
  }
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Orders</h1>
          <p className="text-gray-600">View and manage customer orders</p>
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setCurrentPage(1);
            setStatusFilter(e.target.value);
          }}
          className="input"
        >
          <option value="">All Orders</option>
          <option value="PROCESSING">Processing</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="card overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left">Order ID</th>
              <th className="px-4 py-2 text-left">Customer</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-right">Total</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="border-t">
                <td className="px-4 py-2">{order._id}</td>
                <td className="px-4 py-2">
                  {order.user?.name}
                  <div className="text-sm text-gray-500">{order.user?.email}</div>
                </td>
                <td className="px-4 py-2">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 text-right">₹{order.total.toFixed(2)}</td>
                <td className="px-4 py-2">
                  <select
                    value={order.orderStatus}
                    onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                    className="select select-sm"
                  >
                    <option value="PROCESSING">Processing</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="btn btn-sm btn-outline"
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            className="btn btn-outline"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {pagination.pages} • Total {pagination.total}
          </span>
          <button
            className="btn btn-outline"
            onClick={() => setCurrentPage((page) => Math.min(pagination.pages, page + 1))}
            disabled={currentPage === pagination.pages}
          >
            Next
          </button>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4">Order Details</h2>
            
            {/* Customer Info */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Customer Information</h3>
              <p>Name: {selectedOrder.user?.name}</p>
              <p>Email: {selectedOrder.user?.email}</p>
            </div>

            {/* Order Items */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Items</h3>
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="text-left">Game</th>
                    <th className="text-right">Quantity</th>
                    <th className="text-right">Price</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.title}</td>
                      <td className="text-right">{item.qty}</td>
                      <td className="text-right">₹{item.price}</td>
                      <td className="text-right">₹{item.price * item.qty}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t font-semibold">
                    <td colSpan={3}>Total</td>
                    <td className="text-right">₹{selectedOrder.total}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Order Status */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Order Status</h3>
              <p>Current Status: {selectedOrder.orderStatus}</p>
              <p>Payment Status: {selectedOrder.paymentStatus}</p>
              <p>Created: {new Date(selectedOrder.createdAt).toLocaleString()}</p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="btn btn-outline"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;