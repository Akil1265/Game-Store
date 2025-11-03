import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../services/gameStoreService';
import { Package, Calendar, CreditCard, CheckCircle, ArrowLeft, Download } from 'lucide-react';
import { pickGameImage } from '../utils/image';
import LoadingSpinner from '../components/LoadingSpinner';

function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrder(id);
      setOrder(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Please log in to view this order.');
      } else {
        setError(err.response?.data?.error || 'Failed to load order details');
      }
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED':
      case 'PAID':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <LoadingSpinner message="Loading order details..." />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/orders" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error || 'Order not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/orders" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Orders
      </Link>

      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Order #{order._id.slice(-8).toUpperCase()}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {formatDate(order.createdAt)}
              </div>
              <div className="flex items-center">
                <Package className="w-4 h-4 mr-1" />
                {order.items.length} item(s)
              </div>
            </div>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
        </div>

        {order.status === 'PAID' || order.status === 'CONFIRMED' ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900">Payment Successful!</h3>
                <p className="text-sm text-green-700">Your order has been confirmed and is being processed.</p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-lg font-semibold mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                {item.game && (
                  <>
                    <img
                      src={pickGameImage(item.game) || '/placeholder-game.svg'}
                      alt={item.game.title}
                      className="w-20 h-20 object-cover rounded"
                      onError={(e) => {
                        e.target.src = '/placeholder-game.svg';
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.game.title}</h3>
                      <p className="text-sm text-gray-600">Quantity: {item.qty}</p>
                      <p className="text-sm text-gray-600">Price: ₹{item.price.toLocaleString()} each</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">
                        ₹{(item.price * item.qty).toLocaleString()}
                      </p>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 mt-6">
          <h2 className="text-lg font-semibold mb-4">Payment Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{order.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span className="text-green-600">Free</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax</span>
              <span>₹0</span>
            </div>
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total Paid</span>
                <span className="text-2xl font-bold text-blue-600">
                  ₹{order.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 mt-6">
          <h2 className="text-lg font-semibold mb-4">Payment Information</h2>
          <div className="flex items-center space-x-3 text-gray-700">
            <CreditCard className="w-5 h-5" />
            <span>Razorpay (Dummy Mode)</span>
          </div>
          {order.razorpayPaymentId && (
            <p className="text-sm text-gray-600 mt-2">
              Payment ID: {order.razorpayPaymentId}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;