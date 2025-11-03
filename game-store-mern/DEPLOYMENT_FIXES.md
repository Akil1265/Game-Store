# 🔧 Deployment Issues & Fixes

## 🚨 Issues Identified

### Issue 1: URL Mismatches
Your deployment has **three different backend URLs** configured:

1. **Frontend vercel.json proxy:** `https://game-store-orcin.vercel.app`
2. **Frontend .env.production:** `https://game-store-tau-topaz.vercel.app`
3. **Backend .env FRONTEND_URL:** `https://gamestore-frontend-9lqdnafbi-akils-projects-18747810.vercel.app`

**❌ This causes:** CORS errors, API calls failing, data not loading

### Issue 2: Environment Variables Not Synced
Production environment variables need to match actual deployed URLs.

## ✅ How to Fix

### Step 1: Find Your Actual Vercel URLs

1. Go to https://vercel.com/dashboard
2. Find your backend project (probably named "game-store-backend" or similar)
3. Copy the **Production URL** (e.g., `https://game-store-backend-abc123.vercel.app`)
4. Find your frontend project (probably named "game-store-frontend")
5. Copy the **Production URL** (e.g., `https://game-store-frontend-xyz789.vercel.app`)

### Step 2: Update Backend Environment Variables

1. Go to your **backend** project in Vercel Dashboard
2. Click **Settings** → **Environment Variables**
3. Update or add these variables:

```env
FRONTEND_URL=<YOUR_ACTUAL_FRONTEND_URL>
NODE_ENV=production
MONGO_URI=mongodb+srv://akil20052622_db_user:Akil_1265@cluster0.hlc3cx5.mongodb.net/gamestore?retryWrites=true&w=majority&connectTimeoutMS=30000&socketTimeoutMS=30000
JWT_ACCESS_SECRET=super_strong_jwt_access_secret_key_2024_game_store_development
JWT_REFRESH_SECRET=super_strong_jwt_refresh_secret_key_2024_game_store_development
CLOUDINARY_CLOUD_NAME=cloud-roomie
CLOUDINARY_API_KEY=774648154719727
CLOUDINARY_API_SECRET=eLAXja_2qZm--R93DNcQB5bbvRA
```

4. Click **Save**
5. Go to **Deployments** tab
6. Click **⋯** on latest deployment → **Redeploy**

### Step 3: Update Frontend Configuration Files

Update `frontend/.env.production`:
```bash
VITE_API_URL=<YOUR_ACTUAL_BACKEND_URL>
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

Update `frontend/vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "<YOUR_ACTUAL_BACKEND_URL>/api/:path*"
    }
  ]
}
```

### Step 4: Update Frontend Environment Variables in Vercel

1. Go to your **frontend** project in Vercel Dashboard
2. Click **Settings** → **Environment Variables**
3. Update or add:

```env
VITE_API_URL=<YOUR_ACTUAL_BACKEND_URL>
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

4. Click **Save**
5. **Redeploy** the frontend

### Step 5: Push Changes to GitHub (Optional but Recommended)

```powershell
cd C:\Users\akil2\OneDrive\Desktop\game-web\game-store-mern
git add .
git commit -m "Fix: Update deployment URLs for production"
git push origin main
```

This will trigger automatic redeployment in Vercel.

## 🧪 Testing Your Deployment

After fixing, test these URLs (replace with your actual URLs):

### Backend Tests:
```bash
# Health check
curl https://your-backend.vercel.app/api/health

# Games API
curl https://your-backend.vercel.app/api/games

# Should return: {"games": [...], "pagination": {...}}
```

### Frontend Tests:
1. Visit: `https://your-frontend.vercel.app`
2. Go to: `https://your-frontend.vercel.app/games`
3. Open browser console (F12) → Check for errors
4. Games should load and display

## 🐛 Common Deployment Issues & Solutions

### Problem: "Failed to fetch" or "Network Error"
**Cause:** CORS configuration issue
**Fix:** 
- Ensure `FRONTEND_URL` in backend matches your actual frontend URL
- Check there are no trailing slashes
- Redeploy backend after changing

### Problem: Images not loading
**Cause:** Image URLs might be localhost URLs
**Fix:** 
- Ensure Cloudinary credentials are in backend environment variables
- Check image URLs in database use Cloudinary URLs, not `/uploads/`
- Run migration script if needed

### Problem: Authentication not working
**Cause:** JWT secrets not set or cookies not working
**Fix:**
- Verify `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are set in backend
- Check browser allows third-party cookies
- Verify `credentials: true` in CORS config (already set in your code)

### Problem: Database connection timeout
**Cause:** MongoDB connection string issues
**Fix:**
- Verify `MONGO_URI` is correct in Vercel environment variables
- Check MongoDB Atlas allows connections from `0.0.0.0/0` (all IPs)
- Ensure database user has read/write permissions

### Problem: 404 on page refresh
**Cause:** Frontend routing not configured properly
**Fix:** Already configured in your `vercel.json` ✅

### Problem: Function timeout / 504 errors
**Cause:** Serverless function taking too long
**Fix:**
- Optimize database queries
- Add indexes to MongoDB collections
- Consider upgrading Vercel plan (Hobby = 10s timeout)

## 📋 Deployment Checklist

Use this checklist to verify everything is working:

- [ ] Backend deployed to Vercel
- [ ] Frontend deployed to Vercel
- [ ] Backend URL matches in all configs
- [ ] Frontend URL matches in all configs
- [ ] Backend environment variables set in Vercel
- [ ] Frontend environment variables set in Vercel
- [ ] Backend health check returns 200 OK
- [ ] Games API returns data
- [ ] Frontend loads without errors
- [ ] Games display on /games page
- [ ] Can click and view game details
- [ ] Images load correctly
- [ ] Can register new account
- [ ] Can login
- [ ] Can add items to cart
- [ ] No CORS errors in console

## 🔗 Quick Fix Commands

If you want to update and redeploy quickly:

```powershell
# Go to project root
cd C:\Users\akil2\OneDrive\Desktop\game-web\game-store-mern

# Get your deployed URLs from Vercel, then update files
# Then commit and push
git add frontend/.env.production frontend/vercel.json
git commit -m "Fix: Sync deployment URLs"
git push origin main
```

## 📞 Need Help?

Common error messages and what they mean:

- **"CORS policy"** → Backend FRONTEND_URL doesn't match your actual frontend URL
- **"Failed to fetch"** → Backend not responding or wrong API URL
- **"401 Unauthorized"** → JWT secrets mismatch or not set
- **"500 Internal Server Error"** → Check Vercel backend logs
- **"Cannot read property"** → Frontend trying to access undefined API response

### How to Check Vercel Logs:
1. Go to Vercel Dashboard
2. Select your project
3. Click on latest deployment
4. Click **View Function Logs**
5. Look for error messages

## 💡 Pro Tips

1. **Always test backend API directly** before testing through frontend
2. **Use browser DevTools Network tab** to see actual API calls
3. **Check Vercel deployment logs** for detailed error messages
4. **Keep URLs consistent** across all configuration files
5. **Use environment variables** instead of hardcoding URLs

---

Need more specific help? Share:
- Your actual Vercel URLs (backend & frontend)
- Any error messages from browser console
- Vercel deployment logs
