# Vercel Deployment Guide

This guide will help you deploy the Game Store MERN application to Vercel.

## Prerequisites

1. Install Vercel CLI globally:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

## Deployment Steps

### Step 1: Deploy the Backend

1. Navigate to the backend directory:
```bash
cd backend
```

2. Deploy to Vercel:
```bash
vercel
```

3. Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - What's your project's name? `game-store-backend`
   - In which directory is your code located? `./`
   - Want to override the settings? **N**

4. After deployment, note the production URL (e.g., `https://game-store-backend.vercel.app`)

5. Add environment variables in Vercel Dashboard:
   - Go to https://vercel.com/dashboard
   - Select your backend project
   - Go to Settings → Environment Variables
   - Add all variables from your `.env` file:
     - `MONGODB_URI`
     - `JWT_SECRET`
     - `STRIPE_SECRET_KEY`
     - `STRIPE_WEBHOOK_SECRET`
     - `CLOUDINARY_CLOUD_NAME`
     - `CLOUDINARY_API_KEY`
     - `CLOUDINARY_API_SECRET`
     - `RAZORPAY_KEY_ID`
     - `RAZORPAY_KEY_SECRET`
     - `CLIENT_URL` (will be your frontend URL)
     - `NODE_ENV=production`

6. Redeploy to apply environment variables:
```bash
vercel --prod
```

### Step 2: Deploy the Frontend

1. Navigate to the frontend directory:
```bash
cd ../frontend
```

2. Update `vercel.json` with your actual backend URL:
   - Replace `https://your-backend-url.vercel.app` with your actual backend URL

3. Create a `.env.production` file:
```env
VITE_API_URL=https://your-backend-url.vercel.app
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

4. Deploy to Vercel:
```bash
vercel
```

5. Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - What's your project's name? `game-store-frontend`
   - In which directory is your code located? `./`
   - Want to override the settings? **N**

6. Add environment variables in Vercel Dashboard:
   - Go to your frontend project settings
   - Add:
     - `VITE_API_URL` → Your backend URL
     - `VITE_STRIPE_PUBLIC_KEY` → Your Stripe public key

7. Deploy to production:
```bash
vercel --prod
```

### Step 3: Update Backend CORS Settings

1. Update `CLIENT_URL` environment variable in backend with your frontend production URL
2. Redeploy backend:
```bash
cd ../backend
vercel --prod
```

## Alternative: Deploy via GitHub

You can also connect your GitHub repository to Vercel:

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Create two separate projects:
   - **Backend**: Set root directory to `backend`
   - **Frontend**: Set root directory to `frontend`
4. Add environment variables for each project
5. Deploy!

## Post-Deployment Checklist

✅ Backend is accessible (test: `https://your-backend.vercel.app/api/health`)
✅ Frontend is accessible
✅ Environment variables are set correctly
✅ CORS is configured to allow frontend domain
✅ Database connection is working
✅ Stripe webhooks updated with new backend URL
✅ Test payment flow
✅ Test user authentication

## Troubleshooting

### Backend not responding
- Check Vercel logs in the dashboard
- Verify environment variables are set
- Check MongoDB connection string

### Frontend can't connect to backend
- Verify `VITE_API_URL` is correct
- Check CORS settings in backend
- Verify API proxy in `vercel.json`

### Payment not working
- Update Stripe webhook URL in Stripe Dashboard
- Verify Stripe keys are correct
- Check backend logs for errors

## Useful Commands

```bash
# Check deployment status
vercel list

# View logs
vercel logs [deployment-url]

# Remove a deployment
vercel remove [project-name]

# Set environment variable
vercel env add [variable-name]
```

## Notes

- Vercel serverless functions have a 10-second timeout on Hobby plan
- Upload functionality may need adjustment for serverless environment
- Consider using Vercel Blob Storage for file uploads
- MongoDB Atlas is recommended for database hosting

## Support

If you encounter issues, check:
- Vercel Documentation: https://vercel.com/docs
- Vercel Community: https://github.com/vercel/vercel/discussions
