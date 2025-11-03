import { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useCart } from '../contexts/CartContext';
import { orderService } from '../services/gameStoreService';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

function Checkout() {
  const stripe = useStripe();
  const elements = useElements();
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  
  // Razorpay states
  const [razorpayMethod, setRazorpayMethod] = useState('upi');
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [upiId, setUpiId] = useState('');

  const itemCount = items.reduce((sum, item) => sum + item.qty, 0);

  const handleStripePayment = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) return;
    
    setLoading(true);
    setError('');

    try {
      const orderData = {
        items: items.map(item => ({
          gameId: item.gameId,
          qty: item.qty
        })),
        currency: 'inr'
      };

      const response = await orderService.createOrder(orderData);
      const { clientSecret, orderId } = response.data;

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        }
      });

      if (result.error) {
        setError(result.error.message);
      } else {
        clearCart();
        navigate(`/orders/${orderId}`);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayCheckout = () => {
    setShowRazorpayModal(true);
  };

  const handleRazorpayPayment = async () => {
    setProcessingPayment(true);
    setError('');

    try {
      const orderData = {
        items: items.map(item => ({
          gameId: item.gameId,
          qty: item.qty
        })),
        currency: 'inr'
      };

      const orderResponse = await orderService.createOrder(orderData);
      const { orderId } = orderResponse.data;

      await api.post('/payments/razorpay/create-order', { orderId });

      await new Promise(resolve => setTimeout(resolve, 2000));

      const simulateResponse = await api.post('/payments/razorpay/simulate-success', { orderId });
      const paymentData = simulateResponse.data.data;

      await api.post('/payments/razorpay/verify', {
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature,
        orderId: orderId
      });

      setShowRazorpayModal(false);
      setProcessingPayment(false);
      clearCart();
      
      alert('✅ Payment Successful! Order placed.');
      navigate(`/orders/${orderId}`);

    } catch (error) {
      setProcessingPayment(false);
      setError(error.response?.data?.message || 'Razorpay payment failed');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No items to checkout</h1>
          <p className="text-gray-600">Your cart is empty.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Information</h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Payment Method
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('stripe')}
                  className={`flex-1 p-4 border-2 rounded-lg transition ${
                    paymentMethod === 'stripe'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-semibold">Stripe</div>
                    <div className="text-xs text-gray-600">Credit/Debit Card</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`flex-1 p-4 border-2 rounded-lg transition ${
                    paymentMethod === 'razorpay'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-semibold">Razorpay</div>
                    <div className="text-xs text-gray-600">UPI, Cards & More</div>
                  </div>
                </button>
              </div>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {paymentMethod === 'stripe' ? (
              <form onSubmit={handleStripePayment}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Details
                  </label>
                  <div className="border border-gray-300 rounded-md p-3">
                    <CardElement
                      options={{
                        style: {
                          base: {
                            fontSize: '16px',
                            color: '#424770',
                            '::placeholder': {
                              color: '#aab7c4',
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!stripe || loading}
                  className="btn btn-primary w-full"
                >
                  {loading ? 'Processing...' : `Pay ₹${total.toLocaleString()}`}
                </button>

                <div className="mt-4 text-sm text-gray-500">
                  <p>Test card: 4242 4242 4242 4242</p>
                  <p>Any future date, any CVC</p>
                </div>
              </form>
            ) : (
              <div>
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>🎭 Dummy Razorpay Mode</strong>
                    <br />
                    This is a simulated payment interface. No actual money will be charged.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleRazorpayCheckout}
                  disabled={loading}
                  className="btn btn-primary w-full"
                >
                  Pay ₹{total.toLocaleString()} with Razorpay
                </button>

                <div className="mt-4 text-sm text-gray-500 text-center">
                  <p>Supports UPI, Cards, Net Banking & Wallets</p>
                </div>
              </div>
            )}
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.gameId} className="flex items-center space-x-3">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded"
                    onError={(e) => {
                      e.target.src = '/placeholder-game.svg';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.title}</p>
                    <p className="text-sm text-gray-600">Qty: {item.qty} × ₹{item.price.toLocaleString()}</p>
                  </div>
                  <p className="font-semibold text-right">₹{(item.price * item.qty).toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({itemCount} items)</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between items-center text-lg font-semibold pt-2 border-t">
                <span>Total</span>
                <span className="text-blue-600">₹{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showRazorpayModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Payment Options</h2>
              <button
                onClick={() => !processingPayment && setShowRazorpayModal(false)}
                disabled={processingPayment}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              <div>
                <div className="space-y-3">
                  <button
                    onClick={() => setRazorpayMethod('upi')}
                    disabled={processingPayment}
                    className={`w-full p-4 border-2 rounded-lg text-left transition ${
                      razorpayMethod === 'upi'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">UPI</div>
                        <div className="text-xs text-gray-600">Pay via UPI ID or QR</div>
                      </div>
                      <div className="flex space-x-1">
                        <span className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center text-xs">📱</span>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setRazorpayMethod('cards')}
                    disabled={processingPayment}
                    className={`w-full p-4 border-2 rounded-lg text-left transition ${
                      razorpayMethod === 'cards'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">Cards</div>
                        <div className="text-xs text-gray-600">Debit & Credit Cards</div>
                      </div>
                      <div className="flex space-x-1">
                        <span className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center text-xs">💳</span>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setRazorpayMethod('netbanking')}
                    disabled={processingPayment}
                    className={`w-full p-4 border-2 rounded-lg text-left transition ${
                      razorpayMethod === 'netbanking'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">Netbanking</div>
                        <div className="text-xs text-gray-600">All Indian banks</div>
                      </div>
                      <div className="flex space-x-1">
                        <span className="w-8 h-8 bg-green-100 rounded flex items-center justify-center text-xs">🏦</span>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setRazorpayMethod('wallet')}
                    disabled={processingPayment}
                    className={`w-full p-4 border-2 rounded-lg text-left transition ${
                      razorpayMethod === 'wallet'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">Wallet</div>
                        <div className="text-xs text-gray-600">Paytm, PhonePe, etc.</div>
                      </div>
                      <div className="flex space-x-1">
                        <span className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center text-xs">👛</span>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="border-l pl-6">
                {razorpayMethod === 'upi' && (
                  <div>
                    <h3 className="font-semibold mb-3">UPI QR</h3>
                    <div className="bg-white border rounded-lg p-4 mb-4">
                      <div className="w-48 h-48 mx-auto bg-gray-100 rounded flex items-center justify-center mb-2">
                        <div className="text-center text-gray-500">
                          <div className="text-4xl mb-2">⬛⬜⬛</div>
                          <div className="text-xs">Scan with UPI App</div>
                        </div>
                      </div>
                      <div className="text-center text-sm text-gray-600">
                        <div className="flex justify-center space-x-2 mt-2">
                          <span className="px-2 py-1 bg-gray-100 rounded">GPay</span>
                          <span className="px-2 py-1 bg-gray-100 rounded">Paytm</span>
                          <span className="px-2 py-1 bg-gray-100 rounded">PhonePe</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-center text-sm text-gray-500 mb-4">OR</div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Enter UPI ID</label>
                      <input
                        type="text"
                        placeholder="example@upi"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        disabled={processingPayment}
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>
                  </div>
                )}

                {razorpayMethod === 'cards' && (
                  <div>
                    <h3 className="font-semibold mb-3">Card Details</h3>
                    <div className="space-y-3 mb-4">
                      <div>
                        <label className="block text-sm mb-1">Card Number</label>
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          disabled={processingPayment}
                          className="w-full px-4 py-2 border rounded-lg"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm mb-1">Expiry</label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            disabled={processingPayment}
                            className="w-full px-4 py-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm mb-1">CVV</label>
                          <input
                            type="text"
                            placeholder="123"
                            disabled={processingPayment}
                            className="w-full px-4 py-2 border rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {razorpayMethod === 'netbanking' && (
                  <div>
                    <h3 className="font-semibold mb-3">Select Bank</h3>
                    <select
                      disabled={processingPayment}
                      className="w-full px-4 py-2 border rounded-lg mb-4"
                    >
                      <option>HDFC Bank</option>
                      <option>ICICI Bank</option>
                      <option>SBI</option>
                      <option>Axis Bank</option>
                      <option>Kotak Bank</option>
                    </select>
                  </div>
                )}

                {razorpayMethod === 'wallet' && (
                  <div>
                    <h3 className="font-semibold mb-3">Select Wallet</h3>
                    <div className="space-y-2 mb-4">
                      <button className="w-full p-3 border rounded-lg text-left hover:border-blue-500" disabled={processingPayment}>
                        Paytm
                      </button>
                      <button className="w-full p-3 border rounded-lg text-left hover:border-blue-500" disabled={processingPayment}>
                        PhonePe
                      </button>
                      <button className="w-full p-3 border rounded-lg text-left hover:border-blue-500" disabled={processingPayment}>
                        Amazon Pay
                      </button>
                    </div>
                  </div>
                )}

                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Price Summary</span>
                    <span className="font-bold text-xl">₹{total.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={handleRazorpayPayment}
                  disabled={processingPayment}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  {processingPayment ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing Payment...
                    </span>
                  ) : (
                    `Pay ₹${total.toLocaleString()}`
                  )}
                </button>

                <div className="mt-4 text-center">
                  <div className="text-xs text-gray-500">Secured by Razorpay</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Checkout;
