import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../services/gameStoreService';
import { Package, Clock, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { pickGameImage } from '../utils/image';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getMyOrders();
      console.log('Fetched orders:', response.data);
      
      // Backend returns { orders: [...], pagination: {...} }
      const ordersData = response.data.orders || response.data || [];
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (error.response?.status === 401) {
        setError('Please log in to view your orders.');
      } else {
        setError(error.response?.data?.error || 'Failed to load orders');
      }
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'CONFIRMED':
      case 'PAID':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'CANCELLED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED':
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <LoadingSpinner message="Fetching your orders..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>
        <div className="text-center py-12 card">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
          <p className="text-gray-600 mb-6">Start shopping and your orders will appear here.</p>
          <Link to="/games" className="btn btn-primary">
            Browse Games
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="card p-6 hover:shadow-lg transition">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-semibold text-lg">Order #{order._id.slice(-8).toUpperCase()}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">₹{order.total.toLocaleString()}</p>
                <p className="text-sm text-gray-600">{order.items.length} item(s)</p>
              </div>
            </div>

            {/* Order Items */}
            <div className="border-t border-gray-200 pt-4 space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center space-x-4">
                  {item.game && (
                    <>
                      <img
                        src={pickGameImage(item.game) || '/placeholder-game.svg'}
                        alt={item.game.title}
                        className="w-16 h-16 object-cover rounded"
                        onError={(e) => {
                          e.target.src = '/placeholder-game.svg';
                        }}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.game.title}</h4>
                        <p className="text-sm text-gray-600">Qty: {item.qty}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₹{item.price.toLocaleString()}</p>
                        {item.qty > 1 && (
                          <p className="text-xs text-gray-500">₹{item.price} each</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* View Details Button */}
            <div className="border-t border-gray-200 mt-4 pt-4">
              <Link
                to={`/orders/${order._id}`}
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                View Order Details
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Orders;