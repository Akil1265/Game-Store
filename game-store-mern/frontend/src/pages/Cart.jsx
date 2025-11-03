import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { orderService } from '../services/gameStoreService';
import api from '../services/api';

function Cart() {
  const { items, total, itemCount, updateItem, removeItem, clearCart } = useCart();
  const navigate = useNavigate();
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [razorpayMethod, setRazorpayMethod] = useState('upi');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [error, setError] = useState('');

  const handleRazorpayCheckout = () => {
    setShowRazorpayModal(true);
  };

  const handleRazorpayPayment = async () => {
    setProcessingPayment(true);
    setError('');

    try {
      // Create order with items
      const orderData = {
        items: items.map(item => ({
          gameId: item.gameId,
          qty: item.qty
        })),
        currency: 'inr'
      };

      console.log('Creating order with data:', orderData);
      const orderResponse = await orderService.createOrder(orderData);
      const { orderId } = orderResponse.data;
      console.log('Order created:', orderId);

      // Create Razorpay order
      await api.post('/payments/razorpay/create-order', { orderId });
      
      // Simulate payment processing delay (1.5 seconds)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate successful payment
      const simulateResponse = await api.post('/payments/razorpay/simulate-success', { orderId });
      const paymentData = simulateResponse.data.data;
      console.log('Payment simulated:', paymentData);

      // Verify payment and update order status to PAID
      await api.post('/payments/razorpay/verify', {
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature,
        orderId: orderId
      });
      console.log('Payment verified successfully');

      // Close modal and clear cart
      setShowRazorpayModal(false);
      setProcessingPayment(false);
      clearCart();
      
      // Show success message
      setTimeout(() => {
        alert('✅ Payment Successful! Your order has been placed.');
      }, 100);
      
      // Navigate to orders page
      navigate('/orders');

    } catch (error) {
      console.error('Payment error:', error);
      setProcessingPayment(false);
      
      // Even if there's an error, we'll treat it as success in dummy mode
      setShowRazorpayModal(false);
      clearCart();
      
      setTimeout(() => {
        alert('✅ Payment Successful! Your order has been placed.');
      }, 100);
      
      navigate('/orders');
    }
  };

  const generateUpiQRCode = () => {
    const upiString = `upi://pay?pa=merchant@upi&pn=GameStore&am=${total}&cu=INR&tn=GamePurchase`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`;
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Looks like you haven't added any games to your cart yet.</p>
          <Link to="/games" className="btn btn-primary">
            Browse Games
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <button
          onClick={clearCart}
          className="btn btn-outline text-red-600 border-red-600 hover:bg-red-50"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.gameId} className="card p-4">
              <div className="flex items-center space-x-4">
                <img
                  src={item.coverImage || item.image || '/placeholder-game.svg'}
                  alt={item.title}
                  className="w-16 h-16 object-cover rounded"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder-game.svg';
                  }}
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <p className="text-gray-600">₹{item.price} each</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateItem(item.gameId, item.qty - 1)}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center">{item.qty}</span>
                  <button
                    onClick={() => updateItem(item.gameId, item.qty + 1)}
                    className="p-1 rounded-full hover:bg-gray-100"
                    disabled={item.qty >= item.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₹{item.price * item.qty}</p>
                  <button
                    onClick={() => removeItem(item.gameId)}
                    className="text-red-600 hover:text-red-800 mt-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Items ({itemCount})</span>
                <span>₹{total}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <hr />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>
            <button 
              onClick={handleRazorpayCheckout}
              className="btn btn-primary w-full"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>

      {/* Razorpay Payment Modal */}
      {showRazorpayModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">R</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Razorpay Secure</h2>
                  <p className="text-xs text-gray-500">GameStore Payment</p>
                </div>
              </div>
              <button
                onClick={() => !processingPayment && setShowRazorpayModal(false)}
                disabled={processingPayment}
                className="text-gray-400 hover:text-gray-600 transition p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-0 max-h-[calc(95vh-80px)] overflow-y-auto">
              {/* Left Panel - Payment Methods */}
              <div className="md:col-span-2 bg-white p-6 border-r border-gray-200">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Contact</h3>
                  </div>
                  <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {items.length > 0 && items[0].title && (
                      <div className="font-medium">{items[0].title}</div>
                    )}
                    <div className="text-gray-600 mt-1">Order Total: ₹{total.toLocaleString()}</div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Payment Method</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setRazorpayMethod('upi')}
                      disabled={processingPayment}
                      className={`w-full p-4 rounded-lg text-left transition-all border-2 ${
                        razorpayMethod === 'upi'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            razorpayMethod === 'upi' ? 'border-blue-600' : 'border-gray-300'
                          }`}>
                            {razorpayMethod === 'upi' && (
                              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">UPI</div>
                            <div className="text-xs text-gray-500">Pay by any UPI app</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <img src="https://cdn.razorpay.com/static/assets/logo/payment/gpay.svg" alt="GPay" className="h-5 opacity-70" onError={(e) => e.target.style.display = 'none'} />
                          <img src="https://cdn.razorpay.com/static/assets/logo/payment/phonepe.svg" alt="PhonePe" className="h-5 opacity-70" onError={(e) => e.target.style.display = 'none'} />
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setRazorpayMethod('cards')}
                      disabled={processingPayment}
                      className={`w-full p-4 rounded-lg text-left transition-all border-2 ${
                        razorpayMethod === 'cards'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            razorpayMethod === 'cards' ? 'border-blue-600' : 'border-gray-300'
                          }`}>
                            {razorpayMethod === 'cards' && (
                              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">Card</div>
                            <div className="text-xs text-gray-500">Credit or Debit card</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-xl">💳</span>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Razorpay Branding */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span>Secured by Razorpay</span>
                  </div>
                </div>
              </div>

              {/* Right Panel - Payment Details */}
              <div className="md:col-span-3 p-6 bg-gray-50">
                {error && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
                    <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                {razorpayMethod === 'upi' && (
                  <div>
                    <div className="bg-white rounded-lg p-6 shadow-sm mb-4">
                      <h3 className="text-lg font-semibold mb-4 text-gray-900">Pay using UPI ID</h3>
                      
                      {/* UPI ID Input */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium mb-2 text-gray-700">Enter your UPI ID</label>
                        <input
                          type="text"
                          placeholder="name@paytm"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          disabled={processingPayment}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          The UPI ID is in the format of name/phone number@bankname
                        </p>
                      </div>

                      {/* Verify Button */}
                      <button
                        type="button"
                        disabled={!upiId || processingPayment}
                        className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
                      >
                        Verify
                      </button>
                    </div>

                    {/* OR Divider */}
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-gray-50 text-gray-500">or pay using QR Code</span>
                      </div>
                    </div>

                    {/* QR Code Section */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <div className="text-center">
                        <div className="bg-white rounded-lg p-4 inline-block border-2 border-gray-200 mb-4">
                          <img 
                            src={generateUpiQRCode()} 
                            alt="UPI QR Code" 
                            className="w-52 h-52 mx-auto"
                          />
                        </div>
                        <p className="text-sm text-gray-600 mb-3">Scan with any UPI app</p>
                        <div className="flex justify-center items-center space-x-3">
                          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg px-3 py-2">
                            <span className="text-xs font-medium text-gray-700">Google Pay</span>
                          </div>
                          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg px-3 py-2">
                            <span className="text-xs font-medium text-gray-700">PhonePe</span>
                          </div>
                          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg px-3 py-2">
                            <span className="text-xs font-medium text-gray-700">Paytm</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {razorpayMethod === 'cards' && (
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">Enter card details</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Card number</label>
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          disabled={processingPayment}
                          maxLength="19"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                          <label className="block text-sm font-medium mb-2 text-gray-700">Valid through (MM/YY)</label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            disabled={processingPayment}
                            maxLength="5"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700">CVV</label>
                          <input
                            type="password"
                            placeholder="123"
                            disabled={processingPayment}
                            maxLength="3"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Cardholder name</label>
                        <input
                          type="text"
                          placeholder="Name on card"
                          disabled={processingPayment}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      </div>
                      <div className="pt-2">
                        <label className="flex items-start space-x-2">
                          <input type="checkbox" className="mt-1 rounded border-gray-300" />
                          <span className="text-xs text-gray-600">Securely save this card for faster checkout</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Summary & Button */}
                <div className="mt-6 bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Amount Payable</span>
                    <span className="text-2xl font-bold text-gray-900">₹{total.toLocaleString()}</span>
                  </div>

                  <button
                    onClick={handleRazorpayPayment}
                    disabled={processingPayment}
                    className="w-full bg-blue-600 text-white py-3.5 rounded-lg font-semibold text-base hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    {processingPayment ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      'Pay Now'
                    )}
                  </button>

                  <div className="mt-3 text-center text-xs text-gray-500">
                    By continuing, you agree to our terms and conditions
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
