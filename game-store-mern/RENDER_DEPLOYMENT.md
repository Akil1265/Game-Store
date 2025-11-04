# 🚀 Deploy Backend to Render

## Why Render?
- ✅ Better for Node.js/Express apps (no serverless limitations)
- ✅ Free tier with 750 hours/month
- ✅ No cold starts on paid plans
- ✅ Automatic deploys from GitHub
- ✅ Better logs and monitoring

## 📋 Step-by-Step Deployment

### Step 1: Create Render Account (2 min)

1. Go to https://render.com
2. Sign up with GitHub (recommended)
3. Authorize Render to access your repositories

### Step 2: Create New Web Service (3 min)

1. Click **"New +"** → **"Web Service"**
2. Connect your **Game-Store** repository
3. Configure:
   ```
   Name: game-store-backend
   Region: Singapore (or closest to you)
   Branch: main
   Root Directory: backend
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```
4. Select **Free** plan (or paid if you want)

### Step 3: Add Environment Variables (5 min)

Click **"Advanced"** and add these environment variables:

```env
NODE_ENV=production
PORT=10000
MONGO_URI=mongodb+srv://akil20052622_db_user:Akil_1265@cluster0.hlc3cx5.mongodb.net/gamestore?retryWrites=true&w=majority&connectTimeoutMS=30000&socketTimeoutMS=30000
JWT_ACCESS_SECRET=super_strong_jwt_access_secret_key_2024_game_store_development
JWT_REFRESH_SECRET=super_strong_jwt_refresh_secret_key_2024_game_store_development
CLOUDINARY_CLOUD_NAME=cloud-roomie
CLOUDINARY_API_KEY=774648154719727
CLOUDINARY_API_SECRET=eLAXja_2qZm--R93DNcQB5bbvRA
FRONTEND_URL=https://gamestore-frontend-six.vercel.app
```

**Important:** 
- Render automatically sets `PORT` environment variable
- Your app should use `process.env.PORT` (already configured in your code)

### Step 4: Deploy! (5-10 min)

1. Click **"Create Web Service"**
2. Render will:
   - Clone your repository
   - Install dependencies
   - Start your server
3. Wait for deployment to complete
4. You'll get a URL like: `https://game-store-backend-xxxx.onrender.com`

### Step 5: Test Your Backend

After deployment, test:

```powershell
# Health check
curl https://your-app-name.onrender.com/api/health

# Games API
curl https://your-app-name.onrender.com/api/games
```

Should return your 45 games! 🎉

### Step 6: Update Frontend Configuration

Now update your frontend to use the Render backend URL.

**Local development (.env.local):**
```bash
VITE_API_URL=http://localhost:3001/api
```

**Production (.env.production):**
```bash
VITE_API_URL=https://your-app-name.onrender.com
```

**Update vercel.json (optional - for proxy):**
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-app-name.onrender.com/api/:path*"
    }
  ]
}
```

### Step 7: Update Render Environment Variable

Go back to Render dashboard:
1. Select your backend service
2. Go to **Environment** tab
3. Update `FRONTEND_URL` to your actual Vercel frontend URL
4. Click **Save Changes** (will auto-redeploy)

### Step 8: Deploy Frontend to Vercel

```powershell
cd C:\Users\akil2\OneDrive\Desktop\game-web\game-store-mern\frontend
git add .
git commit -m "Update API URL to Render backend"
git push origin main
```

Or manually in Vercel:
1. Go to your frontend project
2. Settings → Environment Variables
3. Update `VITE_API_URL` to Render backend URL
4. Redeploy

## 🔧 Configuration Files

### backend/render.yaml (Already created!)
This file tells Render how to build and run your app. It's committed to your repo.

### backend/package.json
Make sure you have:
```json
"scripts": {
  "start": "node src/server.js",
  "build": "echo 'No build step required'"
}
```

## 🎯 After Deployment - URLs

**Backend (Render):**
- URL: `https://your-app-name.onrender.com`
- API: `https://your-app-name.onrender.com/api`
- Health: `https://your-app-name.onrender.com/api/health`

**Frontend (Vercel):**
- URL: `https://gamestore-frontend-six.vercel.app`

## 🐛 Troubleshooting

### Build Fails
**Check:**
- Root Directory is set to `backend`
- Build command is `npm install`
- Start command is `npm start`

### Health Check Fails
**Check:**
- `/api/health` endpoint exists (it does in your code)
- Server is actually starting (check logs)
- PORT environment variable is being used

### Database Connection Issues
**Check:**
- MongoDB Atlas allows connections from `0.0.0.0/0` (all IPs)
- MONGO_URI is correct in environment variables
- Database user has correct permissions

### CORS Errors
**Check:**
- `FRONTEND_URL` matches your Vercel frontend URL exactly
- No trailing slashes
- Redeploy after changing environment variables

## 📊 Render Free Tier Limits

- ✅ 750 hours/month (enough for one service running 24/7)
- ✅ Automatic sleep after 15 min of inactivity
- ⚠️ First request after sleep takes 30-50 seconds (cold start)
- ✅ 512 MB RAM
- ✅ 0.1 CPU

**To avoid cold starts:** Upgrade to $7/month paid plan

## 💡 Pro Tips

### Keep Your Service Awake (Optional)
Add a cron job to ping your backend every 10 minutes:

**Use a service like:**
- https://cron-job.org (free)
- https://uptimerobot.com (free)

**Ping URL:** `https://your-app-name.onrender.com/api/health`
**Interval:** Every 10 minutes

### Monitor Your Service
- Render Dashboard shows logs in real-time
- Set up email alerts for failures
- Monitor response times

### Automatic Deploys
- Render auto-deploys on push to `main` branch
- Can configure deploy hooks
- Can preview deployments for pull requests

## ✅ Deployment Checklist

After deploying to Render:
- [ ] Backend deployed successfully
- [ ] Health check returns 200 OK
- [ ] Games API returns data
- [ ] Frontend updated with Render URL
- [ ] Frontend environment variables updated in Vercel
- [ ] CORS working (no errors in browser)
- [ ] Can create account/login
- [ ] Can browse games
- [ ] Images loading
- [ ] Cart functionality works

## 🆘 Need Help?

**Render Docs:** https://render.com/docs
**Render Status:** https://status.render.com
**Render Community:** https://community.render.com

## 🔄 Rollback

If something goes wrong:
1. Go to Render Dashboard
2. Click on your service
3. Go to **Events** tab
4. Find previous successful deploy
5. Click **Redeploy**

---

**Your backend will be much more stable on Render!** 🚀
No more serverless timeouts or cold starts!
