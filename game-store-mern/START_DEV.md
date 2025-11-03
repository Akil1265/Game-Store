# 🚀 Quick Start - Local Development

## Start Both Servers

### Option 1: Using PowerShell (Two Terminals)

**Terminal 1 - Start Backend:**
```powershell
cd C:\Users\akil2\OneDrive\Desktop\game-web\game-store-mern\backend
npm start
```
✅ Backend will run on: http://localhost:3001

**Terminal 2 - Start Frontend:**
```powershell
cd C:\Users\akil2\OneDrive\Desktop\game-web\game-store-mern\frontend
npm run dev
```
✅ Frontend will run on: http://localhost:5173

### Option 2: One Command (Opens two terminal windows)

```powershell
# From project root
cd C:\Users\akil2\OneDrive\Desktop\game-web\game-store-mern

# Start backend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm start"

# Start frontend in new window  
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
```

## 🌐 Access Your Application

After starting both servers:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001/api
- **API Health Check:** http://localhost:3001/api/health
- **View Games:** http://localhost:5173/games

## 📊 Current Database Status

✅ **45 games** in your database!

Sample games:
- Retro Platformer - ₹399
- VR Adventure - ₹1599
- And 43 more...

## ✅ Configuration Status

Your local environment is correctly configured:

**Backend (.env):**
- PORT: 3001
- NODE_ENV: development
- FRONTEND_URL: http://localhost:5173
- MongoDB: Connected ✅
- Games in DB: 45 ✅

**Frontend (.env.local):**
- VITE_API_URL: http://localhost:3001/api ✅

## 🎯 What You Can Do Now

1. **Browse Games:** http://localhost:5173/games
2. **Search & Filter:** Use the search and filter options
3. **View Details:** Click on any game card
4. **Create Account:** Register a new user
5. **Add to Cart:** Start shopping!

## 🛑 Stop Servers

Press `Ctrl + C` in each terminal window to stop the servers.

## 🐛 Troubleshooting

### Backend won't start?
```powershell
# Check if port 3001 is in use
Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue

# Kill the process if needed
Stop-Process -Id <ProcessId> -Force
```

### Frontend won't start?
```powershell
# Clear node modules and reinstall
cd frontend
Remove-Item -Recurse -Force node_modules
npm install
npm run dev
```

### Data not showing?
1. Check backend is running: `curl http://localhost:3001/api/games`
2. Open browser console (F12) for errors
3. Verify `.env.local` file exists in frontend folder
4. Try hard refresh: `Ctrl + Shift + R`

### CORS errors?
Make sure backend `.env` has:
```
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

## 📝 Next Steps

1. **Deploy to Production:** See `DEPLOYMENT_STEPS.md`
2. **Add More Games:** Use the admin panel (after creating admin user)
3. **Customize:** Modify styles, add features, etc.

Happy coding! 🎮
