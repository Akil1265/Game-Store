import { useMemo, useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { authService, orderService } from '../services/gameStoreService';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

function Checkout() {
	const stripe = useStripe();
	const elements = useElements();
	const { items, total, clearCart } = useCart();
	const { user, updateUser } = useAuth();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [paymentMethod, setPaymentMethod] = useState('razorpay');
	const [showRazorpayModal, setShowRazorpayModal] = useState(false);
	const [processingPayment, setProcessingPayment] = useState(false);
	const [upiId, setUpiId] = useState('');
	const [upiVerified, setUpiVerified] = useState(false);
	const [verifyingUpi, setVerifyingUpi] = useState(false);
	const [upiValidationState, setUpiValidationState] = useState(null);
	const [upiValidationMsg, setUpiValidationMsg] = useState('');
	const [razorpayOutcome, setRazorpayOutcome] = useState(null);

	const itemCount = items.reduce((sum, item) => sum + item.qty, 0);
	const savedProfileUpi = useMemo(() => (user?.upiId ? user.upiId.trim() : ''), [user?.upiId]);
	const hasUpiInput = useMemo(() => upiId.trim().length > 0, [upiId]);

	const persistUpiIdToProfile = async (nextUpi) => {
		if (!user) {
			return false;
		}

		try {
			const payload = {
				name: user.name || 'Player',
				upiId: nextUpi
			};

			const response = await authService.updateProfile(payload);
			const updatedUser = response.data?.user;
			if (updatedUser) {
				updateUser(updatedUser);
			}
			return true;
		} catch (persistError) {
			console.error('Failed to store UPI ID from checkout:', persistError);
			return false;
		}
	};

	const handleStripePayment = async (event) => {
		event.preventDefault();

		if (!stripe || !elements) return;

		setLoading(true);
		setError('');

		// Check if card element has any value
		const cardElement = elements.getElement(CardElement);
		if (!cardElement || cardElement._empty) {
			setError('Please fill in your card details');
			setLoading(false);
			return;
		}

		// Simulate processing
		await new Promise(resolve => setTimeout(resolve, 1500));

		// Always show success if fields are filled
		clearCart();
		setLoading(false);
		navigate('/orders');
	};

	const handleRazorpayCheckout = () => {
		setError('');
		const savedUpi = savedProfileUpi;
		const hasSavedUpi = Boolean(savedUpi);
		setUpiId(savedUpi || '');
		setUpiVerified(hasSavedUpi);
		setVerifyingUpi(false);
		setUpiValidationState(hasSavedUpi ? 'success' : null);
		setUpiValidationMsg(hasSavedUpi ? 'Using your saved UPI ID from profile' : '');
		setRazorpayOutcome(null);
		setShowRazorpayModal(true);
	};

	const handleCloseRazorpayModal = () => {
		if (processingPayment) return;
		setShowRazorpayModal(false);
		setVerifyingUpi(false);
		setUpiId('');
		setUpiVerified(false);
		setUpiValidationState(null);
		setUpiValidationMsg('');
		setRazorpayOutcome(null);
	};

	const handleVerifyUpiId = async () => {
		const trimmed = upiId.trim();
		setError('');
		setUpiValidationMsg('');
		setUpiValidationState(null);
		setUpiVerified(false);

		if (!trimmed) {
			setUpiValidationMsg('Enter a UPI ID to verify');
			setUpiValidationState('error');
			return;
		}

		const upiPattern = /^[\w.-]{2,}@[\w.-]{2,}$/i;
		if (!upiPattern.test(trimmed)) {
			setUpiValidationMsg('Enter a valid UPI ID like name@bank');
			setUpiValidationState('error');
			return;
		}

		setVerifyingUpi(true);
		try {
			await new Promise(resolve => setTimeout(resolve, 800));
			let savedToProfile = true;
			if (!savedProfileUpi || trimmed !== savedProfileUpi) {
				savedToProfile = await persistUpiIdToProfile(trimmed);
			}

			setUpiVerified(true);
			setUpiValidationMsg(
				savedToProfile
					? 'UPI ID verified and saved to your profile'
					: 'UPI ID verified. Unable to update your profile right now.'
			);
			setUpiValidationState('success');
		} catch (verificationError) {
			setUpiValidationMsg('Unable to verify UPI ID right now');
			setUpiValidationState('error');
		} finally {
			setVerifyingUpi(false);
		}
	};

	const handleRazorpayUPIPayment = async () => {
		setProcessingPayment(true);
		setError('');
		setRazorpayOutcome(null);

		const trimmedUpi = upiId.trim();
		
		// If UPI field has value but not verified, show error
		if (trimmedUpi && !upiVerified) {
			setUpiValidationMsg('Verify your UPI ID or leave it blank to use QR.');
			setUpiValidationState('error');
			setProcessingPayment(false);
			setError('Please verify your UPI ID or clear the field before continuing.');
			return;
		}

		// If UPI is verified OR no UPI (using QR), immediately show success
		await new Promise(resolve => setTimeout(resolve, 1500));
		
		const usedVerifiedUpi = Boolean(trimmedUpi && upiVerified);
		const successMessage = usedVerifiedUpi
			? 'Payment successful using your verified UPI ID. Redirecting to your orders…'
			: 'Payment successful via QR code. Redirecting to your orders…';

		setProcessingPayment(false);
		setError('');
		clearCart();
		setRazorpayOutcome({
			type: 'success',
			message: successMessage
		});

		setTimeout(() => {
			handleCloseRazorpayModal();
			navigate('/orders');
		}, 1200);
	};

	const qrAmountFormatted = useMemo(() => total.toLocaleString(), [total]);
	const upiPaymentIntent = useMemo(() => {
		const payableAmount = Math.max(total, 1).toFixed(2);
		return `upi://pay?pa=akil20052622@okaxis&pn=GameStore&am=${payableAmount}&cu=INR&tn=GameStore%20Order`;
	}, [total]);
	const qrImageUrl = useMemo(() => {
		const encodedPayload = encodeURIComponent(upiPaymentIntent);
		return `https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=0&data=${encodedPayload}&format=png`;
	}, [upiPaymentIntent]);

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
										<div className="text-xs text-gray-600">UPI/QR Code</div>
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
							</form>
						) : (
							<div>
								<button
									type="button"
									onClick={handleRazorpayCheckout}
									disabled={loading}
									className="btn btn-primary w-full"
								>
									Pay ₹{total.toLocaleString()} with Razorpay
								</button>
								<p className="mt-3 text-xs text-gray-500 text-center">
									UPI / QR code payment simulated via Razorpay
								</p>
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
										<p className="text-sm text-gray-600">
											Qty: {item.qty} × ₹{item.price.toLocaleString()}
										</p>
									</div>
									<p className="font-semibold text-right">
										₹{(item.price * item.qty).toLocaleString()}
									</p>
								</div>
							))}
						</div>

						<div className="border-t pt-4 space-y-2">
							<div className="flex justify-between text-gray-600">
								<span>Subtotal ({itemCount} items)</span>
								<span>₹{total.toLocaleString()}</span>
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
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<div className="absolute inset-0 bg-black/60" />
					<div className="relative bg-slate-50 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden">
						<button
							onClick={handleCloseRazorpayModal}
							disabled={processingPayment}
							className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl leading-none"
						>
							×
						</button>

						<div className="px-6 pt-6 pb-6 space-y-4">
							<div>
								<div className="text-xs font-semibold text-blue-600 uppercase tracking-widest">
									Razorpay Secure
								</div>
								<h2 className="mt-1 text-xl font-semibold text-gray-900">Pay using UPI ID</h2>
								<p className="mt-1 text-xs text-gray-500">Enter your UPI ID in the format name@bankname</p>
								<div className="mt-3 flex flex-col sm:flex-row gap-3">
									<input
										type="text"
										placeholder="name@upi"
										value={upiId}
										onChange={(e) => {
											setUpiId(e.target.value);
											setUpiVerified(false);
											setUpiValidationState(null);
											setUpiValidationMsg('');
										}}
										disabled={processingPayment}
										className="input sm:flex-1"
									/>
									<button
										type="button"
										onClick={handleVerifyUpiId}
										disabled={verifyingUpi || !hasUpiInput || processingPayment || upiVerified}
										className={`px-5 py-2 rounded-lg border text-sm font-medium transition ${
											upiVerified
												? 'border-green-500 bg-green-50 text-green-700'
												: 'border-gray-200 bg-gray-100 text-gray-500'
										} ${
											verifyingUpi || !hasUpiInput || processingPayment || upiVerified
												? 'cursor-not-allowed opacity-60'
												: 'cursor-pointer hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700'
										}`}
									>
										{upiVerified ? 'Verified' : verifyingUpi ? 'Verifying…' : 'Verify'}
									</button>
								</div>
								{upiValidationMsg && (
									<p
										className={`mt-2 text-xs ${
											upiValidationState === 'success' ? 'text-green-600' : 'text-red-500'
										}`}
									>
										{upiValidationMsg}
									</p>
								)}
							</div>

							<div className="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
								<span className="flex-1 border-t border-gray-200" />
								<span>or pay using QR Code</span>
								<span className="flex-1 border-t border-gray-200" />
							</div>

							<div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-md text-center">
								<div className="text-xs text-gray-500 mb-3">Amount ₹{qrAmountFormatted}</div>
								<div className="mx-auto overflow-hidden rounded-2xl border border-gray-200" style={{ width: '160px' }}>
									<img
										src={qrImageUrl}
										alt="Scan to pay with UPI"
										className="w-full h-auto"
										style={{ imageRendering: 'pixelated' }}
										loading="lazy"
									/>
								</div>
								<p className="mt-5 text-xs font-medium text-gray-600">Scan with any UPI app</p>
								<div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-gray-500">
									<span className="px-3 py-1 rounded-full bg-white border border-gray-200 shadow-sm">Google Pay</span>
									<span className="px-3 py-1 rounded-full bg-white border border-gray-200 shadow-sm">PhonePe</span>
									<span className="px-3 py-1 rounded-full bg-white border border-gray-200 shadow-sm">Paytm</span>
								</div>
							</div>

							<div className="border-t border-gray-200 pt-5">
								{razorpayOutcome && (
									<div
										className={`mb-4 rounded-lg px-4 py-3 text-sm font-medium ${
											razorpayOutcome.type === 'success'
												? 'bg-green-50 text-green-700 border border-green-200'
												: 'bg-red-50 text-red-700 border border-red-200'
										}`}
									>
										{razorpayOutcome.message}
									</div>
								)}
								<div className="flex justify-between text-sm text-gray-600 mb-3">
									<span>Amount Payable</span>
									<span className="font-semibold text-xl text-gray-900">₹{qrAmountFormatted}</span>
								</div>
								<button
									onClick={handleRazorpayUPIPayment}
									disabled={processingPayment || razorpayOutcome?.type === 'success'}
									className="w-full rounded-lg bg-blue-600 text-white py-3 font-semibold hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
								>
									{processingPayment
										? 'Processing…'
										: razorpayOutcome?.type === 'success'
											? 'Redirecting…'
											: 'Pay Now'}
								</button>
								<p className="mt-3 text-xs text-gray-400 text-center">
									By continuing, you agree to our terms and conditions
								</p>
								<p className="mt-2 text-xs text-gray-400 text-center flex items-center justify-center gap-1">
									<span role="img" aria-label="lock">🔒</span>
									Secured by Razorpay
								</p>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
export default Checkout;