# RAWG API & Razorpay Integration - Setup Guide

## ✅ Completed Features

### 1. RAWG API Integration
- **Backend Service**: `backend/src/services/rawgService.js`
  - Fetches games from RAWG API
  - Maps RAWG data to your Game schema
  - Handles game details and preview

- **Backend Controller**: `backend/src/controllers/importController.js`
  - `importFromRawg`: Import multiple games from RAWG
  - `importSingleGame`: Import one game by RAWG ID
  - `previewRawgGames`: Preview games before importing
  - `getImportStats`: Get statistics about imported games

- **Backend Routes**: `/api/import/*`
  - `POST /api/import/rawg/preview` - Preview games
  - `POST /api/import/rawg` - Import games
  - `POST /api/import/rawg/:rawgId` - Import single game
  - `GET /api/import/stats` - Get import statistics

- **Frontend Service**: `frontend/src/services/rawgApi.js`
  - Direct RAWG API calls from frontend
  - Fetches games and genres

- **Admin Page**: `frontend/src/pages/admin/AdminImport.jsx`
  - Search and preview RAWG games
  - Import games to database
  - View import statistics
  - Route: `/admin/import`

### 2. Dummy Razorpay Payment Integration
- **Backend Service**: `backend/src/services/razorpayService.js`
  - Creates dummy Razorpay orders
  - Verifies payment signatures
  - Simulates payment success (for testing)

- **Backend Controller**: `backend/src/controllers/razorpayController.js`
  - `createRazorpayOrder`: Create payment order
  - `verifyRazorpayPayment`: Verify payment
  - `simulateRazorpaySuccess`: Simulate successful payment
  - `getRazorpayKey`: Get Razorpay key for frontend

- **Backend Routes**: `/api/payments/razorpay/*`
  - `GET /api/payments/razorpay/key` - Get Razorpay key
  - `POST /api/payments/razorpay/create-order` - Create order
  - `POST /api/payments/razorpay/verify` - Verify payment
  - `POST /api/payments/razorpay/simulate-success` - Simulate payment

- **Frontend**: Updated `frontend/src/pages/Checkout.jsx`
  - Payment method selector (Stripe or Razorpay)
  - Dummy Razorpay payment flow
  - Automatic payment simulation

- **Database**: Updated `Order` model
  - Added `razorpayOrderId` field
  - Added `razorpayPaymentId` field
  - Added `paidAt` timestamp

## 🔧 Setup Instructions

### 1. Get RAWG API Key (Free)
1. Go to https://rawg.io/apidocs
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add to `backend/.env`:
   ```env
   RAWG_API_KEY=your_actual_rawg_api_key_here
   ```

### 2. Backend Environment Variables
Your `backend/.env` file should have:
```env
PORT=3001
MONGO_URI=mongodb+srv://...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
RAWG_API_KEY=your_rawg_api_key_here
RAZORPAY_KEY_ID=rzp_test_dummy_key
RAZORPAY_KEY_SECRET=dummy_secret_key_for_testing
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Start the Application
```bash
# Backend
cd backend
npm run dev

# Frontend (in another terminal)
cd frontend
npm run dev
```

## 🎮 How to Use

### Import Games from RAWG:
1. Login as admin (admin@example.com / AdminPass123!)
2. Navigate to http://localhost:5173/admin/import
3. Click "Preview" to see available games
4. Click "Import All" to import all games on the page
5. Or click "Import This" on individual games

### Test Dummy Razorpay Payment:
1. Add items to cart
2. Go to checkout
3. Select "Razorpay" payment method
4. Click "Pay with Razorpay (Dummy)"
5. Payment will be automatically simulated and verified
6. You'll be redirected to the order page

### Test Stripe Payment:
1. Add items to cart
2. Go to checkout
3. Select "Stripe" payment method
4. Use test card: `4242 4242 4242 4242`
5. Any future date, any CVC
6. Complete payment

## 📝 Notes

- **RAWG API**: Free tier allows 20,000 requests/month
- **Razorpay**: This is a DUMMY implementation - no real payment processing
- **Stripe**: Uses test mode - no real charges
- **Admin Access**: Only admins can import games
- **Stock Management**: Imported games get random stock (10-60 units)
- **Pricing**: Game prices calculated from metacritic scores or random (₹20-₹60)

## 🎯 API Endpoints Summary

### RAWG Import
- `POST /api/import/rawg/preview` - Preview games before importing
- `POST /api/import/rawg` - Import multiple games
- `POST /api/import/rawg/:rawgId` - Import single game
- `GET /api/import/stats` - Get import statistics

### Razorpay Payment
- `GET /api/payments/razorpay/key` - Get key for frontend
- `POST /api/payments/razorpay/create-order` - Create payment order
- `POST /api/payments/razorpay/verify` - Verify payment signature
- `POST /api/payments/razorpay/simulate-success` - Simulate payment (testing)

## ✨ Features

### RAWG Integration:
- ✅ Search RAWG games by query
- ✅ Preview games before importing
- ✅ Bulk import with pagination
- ✅ Single game import
- ✅ Automatic data mapping
- ✅ Duplicate prevention (by RAWG ID)
- ✅ Import statistics dashboard

### Razorpay Dummy:
- ✅ Dummy order creation
- ✅ Signature generation & verification
- ✅ Automatic payment simulation
- ✅ Order status updates
- ✅ No real payment processing
- ✅ Perfect for development/testing

## 🚀 Ready to Use!

Your project now has:
1. ✅ External game data integration via RAWG API
2. ✅ Dummy Razorpay payment alongside Stripe
3. ✅ Admin interface to import games
4. ✅ Dual payment method support
5. ✅ Complete order management

**Next Steps:**
1. Get your RAWG API key
2. Update the `.env` file
3. Restart the backend server
4. Test the import feature
5. Test the payment flows
