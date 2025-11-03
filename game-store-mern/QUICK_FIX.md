# 🎯 QUICK FIX - Step by Step

## What's Wrong?
Your deployment has **mismatched URLs** causing data not to load. Here's how to fix it in 5 minutes:

## Step-by-Step Fix

### 1️⃣ Find Your Actual URLs (2 min)

Go to https://vercel.com/dashboard and find:

**Backend URL:** (click on your backend project)
- Example: `https://game-store-backend-xyz123.vercel.app`
- Write it here: `____________________________________`

**Frontend URL:** (click on your frontend project)
- Example: `https://game-store-frontend-abc456.vercel.app`
- Write it here: `____________________________________`

### 2️⃣ Update Backend in Vercel (1 min)

1. Open your **backend** project in Vercel
2. Go to: **Settings** → **Environment Variables**
3. Find `FRONTEND_URL` and click **Edit**
4. Change value to your actual frontend URL
5. Click **Save**
6. Go to **Deployments** tab
7. Click **⋯** menu → **Redeploy** → **Redeploy**

✅ Backend fixed!

### 3️⃣ Update Frontend in Vercel (1 min)

1. Open your **frontend** project in Vercel
2. Go to: **Settings** → **Environment Variables**
3. Find `VITE_API_URL` and click **Edit**
4. Change value to your actual backend URL (just the URL, no /api)
5. Click **Save**
6. Go to **Deployments** tab
7. Click **⋯** menu → **Redeploy** → **Redeploy**

✅ Frontend fixed!

### 4️⃣ Wait & Test (1 min)

Wait for both deployments to complete (watch the progress)

Then test:
1. Open your frontend URL
2. Click on "Games" or "Browse Games"
3. **You should see 45 games!** 🎉

## 🧪 Quick Test Commands

After fixing, run these in PowerShell:

```powershell
# Replace with YOUR actual backend URL
$BACKEND = "https://your-backend.vercel.app"

# Test 1: Health check
Invoke-RestMethod "$BACKEND/api/health"

# Test 2: Games count
$response = Invoke-RestMethod "$BACKEND/api/games"
Write-Host "Total games: $($response.pagination.total)"
```

## 🐛 Still Not Working?

### Check CORS Error
If you see CORS error in browser console (F12):

**Cause:** URLs still don't match
**Fix:** 
1. Double-check you entered the **full URL** including `https://`
2. Make sure there's **no trailing slash** (`/`) at the end
3. Wait 30 seconds after redeploy for changes to apply

### Check Network Error
If you see "Failed to fetch" or "Network error":

**Cause:** Wrong backend URL
**Fix:**
1. Make sure frontend `VITE_API_URL` is your backend URL
2. DON'T include `/api` at the end - the code adds it automatically
3. Test backend directly: visit `https://your-backend.vercel.app/api/health`

### Check 404 Error
If API returns 404:

**Cause:** Backend routes not deployed
**Fix:**
1. Check backend `vercel.json` exists
2. Make sure all files are committed to Git
3. Redeploy from Git (not from local)

## 📸 What It Should Look Like

### Backend Environment Variables:
```
FRONTEND_URL = https://game-store-frontend-abc456.vercel.app
NODE_ENV = production
MONGO_URI = mongodb+srv://...
JWT_ACCESS_SECRET = super_strong_jwt...
JWT_REFRESH_SECRET = super_strong_jwt...
CLOUDINARY_CLOUD_NAME = cloud-roomie
CLOUDINARY_API_KEY = 774648154719727
CLOUDINARY_API_SECRET = eLAXja_2qZm--R93DNcQB5bbvRA
```

### Frontend Environment Variables:
```
VITE_API_URL = https://game-store-backend-xyz123.vercel.app
VITE_STRIPE_PUBLISHABLE_KEY = pk_test_...
```

## ✅ Success Checklist

After fixing, verify:
- [ ] Can access frontend URL
- [ ] Can see /games page
- [ ] Games display with images
- [ ] Can click on a game to see details
- [ ] No red errors in browser console (F12)
- [ ] Can create account / login

## 🆘 Need More Help?

Run the diagnostic script:
```powershell
cd C:\Users\akil2\OneDrive\Desktop\game-web\game-store-mern
.\check-deployment.ps1
```

This will check everything and tell you exactly what's wrong!

---

## 💡 Pro Tip

**Save these URLs** somewhere for future reference:
- Backend: `____________________________________`
- Frontend: `____________________________________`

Every time you update environment variables in Vercel, you need to **redeploy**!

## 🎉 When It Works

You'll see your 45 games displayed beautifully with:
- Game titles
- Prices (₹)
- Images
- Ratings
- Platforms
- Genre tags

Good luck! 🚀
