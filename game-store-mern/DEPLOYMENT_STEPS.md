# 🚀 Quick Deployment Guide

## ✅ Your Current Status
- ✅ Backend running locally on port 3001
- ✅ Database connected with 45 games
- ✅ Frontend configured at http://localhost:3001/api
- ✅ Local development environment working

## 🎯 Deploy to Vercel (Recommended)

### Option 1: Deploy via Vercel Dashboard (Easiest)

#### Step 1: Deploy Backend
1. Go to https://vercel.com/new
2. Import your GitHub repository (Game-Store)
3. Configure:
   - **Framework Preset:** Other
   - **Root Directory:** `backend`
   - **Build Command:** Leave empty
   - **Output Directory:** Leave empty
4. Add Environment Variables (click "Environment Variables"):
   ```
   MONGO_URI=mongodb+srv://akil20052622_db_user:Akil_1265@cluster0.hlc3cx5.mongodb.net/gamestore?retryWrites=true&w=majority&connectTimeoutMS=30000&socketTimeoutMS=30000
   JWT_ACCESS_SECRET=super_strong_jwt_access_secret_key_2024_game_store_development
   JWT_REFRESH_SECRET=super_strong_jwt_refresh_secret_key_2024_game_store_development
   CLOUDINARY_CLOUD_NAME=cloud-roomie
   CLOUDINARY_API_KEY=774648154719727
   CLOUDINARY_API_SECRET=eLAXja_2qZm--R93DNcQB5bbvRA
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```
   (Note: You'll update FRONTEND_URL after deploying frontend)
5. Click **Deploy**
6. Copy your backend URL (e.g., `https://game-store-backend-xyz.vercel.app`)

#### Step 2: Deploy Frontend
1. Go to https://vercel.com/new again
2. Import the same repository
3. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add Environment Variables:
   ```
   VITE_API_URL=https://your-backend-url.vercel.app
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
   ```
   (Replace with your actual backend URL from Step 1)
5. Click **Deploy**
6. Copy your frontend URL

#### Step 3: Update Backend CORS
1. Go to your backend project in Vercel
2. Settings → Environment Variables
3. Update `FRONTEND_URL` with your actual frontend URL
4. Redeploy the backend (Deployments tab → click "⋯" → Redeploy)

### Option 2: Deploy via CLI

```powershell
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy Backend
cd C:\Users\akil2\OneDrive\Desktop\game-web\game-store-mern\backend
vercel --prod

# Deploy Frontend
cd C:\Users\akil2\OneDrive\Desktop\game-web\game-store-mern\frontend
vercel --prod
```

## 🔧 Local Development - Data Showing Now!

Your local setup is now working correctly:
- Backend: http://localhost:3001
- Frontend: http://localhost:5173 or http://localhost:5174
- API: http://localhost:3001/api/games

### To start development:

**Terminal 1 - Backend:**
```powershell
cd C:\Users\akil2\OneDrive\Desktop\game-web\game-store-mern\backend
npm start
```

**Terminal 2 - Frontend:**
```powershell
cd C:\Users\akil2\OneDrive\Desktop\game-web\game-store-mern\frontend
npm run dev
```

## 📝 Important Notes

### Environment Files
- **Local Development:** Uses `.env` and `.env.local` files
- **Production:** Uses `.env.production` files
- Never commit sensitive keys to Git!

### Current Configuration
- `.env` → Local development (NODE_ENV=development, FRONTEND_URL=http://localhost:5173)
- `.env.production` → Production deployment (NODE_ENV=production, Vercel URLs)

### Why Data Wasn't Showing
The issue was CORS! Your backend `.env` had:
- `NODE_ENV=production` 
- `FRONTEND_URL=https://gamestore-frontend-9lqdnafbi-akils-projects-18747810.vercel.app`

This made your local frontend (http://localhost:5173) unable to access the backend because of CORS restrictions. Now it's fixed for local development!

## 🐛 Troubleshooting

### Data still not showing?
1. Make sure backend is running: `curl http://localhost:3001/api/health`
2. Check frontend console for errors (F12 in browser)
3. Verify `.env.local` in frontend has: `VITE_API_URL=http://localhost:3001/api`
4. Restart frontend dev server: Ctrl+C then `npm run dev`

### After Deployment - Data not showing?
1. Check Vercel logs for backend errors
2. Verify environment variables are set correctly
3. Make sure CORS is configured (FRONTEND_URL in backend)
4. Test backend API: `https://your-backend.vercel.app/api/games`

## 📱 Test Your Deployment

After deployment, test these URLs:
- Backend Health: `https://your-backend.vercel.app/api/health`
- Games API: `https://your-backend.vercel.app/api/games`
- Frontend: `https://your-frontend.vercel.app/games`

## 🎉 Success Checklist
- [ ] Backend deployed to Vercel
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured
- [ ] CORS configured (FRONTEND_URL)
- [ ] Games showing on website
- [ ] Can view game details
- [ ] Authentication working
- [ ] Images loading correctly

Need help? Check the logs in Vercel dashboard or browser console!
