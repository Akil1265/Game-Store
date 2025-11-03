# 🎮 Quick Start Guide - Game Import System

## ✅ Your New Workflow is Ready!

### What We Built:
**Admin can now:**
1. Search games from RAWG API
2. See game details (name, rating, genres, images)
3. **Edit Price & Stock manually**
4. Click "Add to Store" 
5. Game immediately appears on your website!

---

## 🚀 How to Use (Step by Step)

### Step 1: Get RAWG API Key (2 minutes)
1. Go to https://rawg.io/apidocs
2. Sign up (free account)
3. Copy your API key
4. Add to `backend/.env`:
   ```
   RAWG_API_KEY=your_key_here
   ```

### Step 2: Start Servers
```bash
# Backend (already running on port 3001)
cd backend
npm run dev

# Frontend (running on port 5174)
cd frontend
npm run dev
```

### Step 3: Import Games
1. **Login as Admin**:
   - Email: `admin@example.com`
   - Password: `AdminPass123!`

2. **Go to Import Page**:
   - Visit: http://localhost:5174/admin/import

3. **Load Games**:
   - Click "Load Popular" - Gets trending games
   - OR Search: Type "GTA", "Minecraft", "Cyberpunk" etc.

4. **Edit Price & Stock**:
   - Each game shows auto-calculated price
   - **Edit the price** (in Rupees ₹)
   - **Edit stock** quantity
   - Click "Add to Store"

5. **Game Added**!
   - Instantly available on your website
   - Check http://localhost:5174/games

---

## 📱 Current URLs:
- **Frontend**: http://localhost:5174
- **Backend**: http://localhost:3001
- **Admin Dashboard**: http://localhost:5174/admin
- **Import Games**: http://localhost:5174/admin/import
- **All Games**: http://localhost:5174/games

---

## 🎯 Features:
✅ Direct RAWG API integration
✅ Real game data (images, ratings, genres)
✅ **Manual price control**
✅ **Stock management**
✅ One-click import
✅ Bulk import option
✅ Statistics dashboard
✅ Search functionality
✅ Pagination (20 games per page)

---

## 💡 Price Suggestions:
The system auto-calculates based on Metacritic score:
- **High rated (90+)**: ₹540-600
- **Good (70-89)**: ₹420-539
- **Average (50-69)**: ₹300-419
- **No rating**: ₹200-600 (random)

**But YOU control final price!** Edit before adding.

---

## 🎮 Example Workflow:
```
1. Search "Grand Theft Auto"
2. See GTA V with rating 4.5 ⭐
3. Auto-price: ₹2999
4. YOU edit: ₹1499 (better for customers!)
5. Set stock: 100
6. Click "Add to Store"
7. Done! GTA V now live on website
```

---

## ⚡ Pro Tips:
1. **Popular Games**: Click "Load Popular" for trending titles
2. **Search Smart**: Use exact game names for better results
3. **Bulk Import**: Import all visible games at once
4. **Stats Dashboard**: Track your total games count
5. **Remove Duplicates**: Already imported games won't be added again

---

## 🛠️ Next: Payment Integration
Once you're happy with game listings, we'll add:
- ✅ Stripe payment (already done)
- ✅ Razorpay dummy payment (already done)

Both payment methods are ready in Checkout page!

---

## 📞 Need Help?
1. **API Key Error**: Check backend/.env has RAWG_API_KEY
2. **No Games Loading**: Restart backend after adding API key
3. **Price Not Saving**: Make sure value is number, not text
4. **Import Failed**: Game might already exist (check stats)

---

**🎉 Ready to go! Open http://localhost:5174/admin/import and start adding games!**
