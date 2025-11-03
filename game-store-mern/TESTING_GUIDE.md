# 🎮 Game Listing & RAWG Integration - Testing Guide

## ✅ What's Ready to Test

### 1. **RAWG API Game Import** (Admin Feature)
- Import games from RAWG API to your database
- Preview games before importing
- View import statistics
- Search RAWG games by keyword

### 2. **Game Listing Page** (Public Feature)
- Browse all games in your database
- Search by name/description
- Filter by genre, platform, price range
- Sort by newest, price, rating
- Grid/List view modes
- Pagination

### 3. **Game Detail Pages**
- View individual game details
- See reviews and ratings
- Add to cart functionality

---

## 🚀 Step-by-Step Testing Instructions

### **STEP 1: Get Your RAWG API Key** (Required!)

1. **Go to**: https://rawg.io/apidocs
2. **Sign up** for a free account (takes 2 minutes)
3. **Get your API key** from the dashboard
4. **Update** your `backend/.env` file:
   ```env
   RAWG_API_KEY=your_actual_api_key_here
   ```
5. **Restart backend server**:
   ```bash
   cd backend
   npm run dev
   ```

---

### **STEP 2: Login as Admin**

1. Open browser: http://localhost:5173/login
2. Login with:
   - **Email**: `admin@example.com`
   - **Password**: `AdminPass123!`

---

### **STEP 3: Import Games from RAWG**

1. **Navigate to**: http://localhost:5173/admin/import
   - Or click "Admin Panel" in navbar → "Import Games"

2. **Preview Games**:
   - Leave search empty and click "Preview" to see popular games
   - Or enter a search term (e.g., "zelda", "mario", "gta")
   - Click "Preview" again

3. **Import Games**:
   - Click "Import All" to import all games on current page (up to 20)
   - Or click "Import This" on individual games
   - Watch the success message showing how many were imported

4. **Try Different Searches**:
   - Search for "action" → Preview → Import All
   - Search for "rpg" → Preview → Import All
   - Search for "adventure" → Preview → Import All
   - Change page number to 2, 3, etc. for more games

5. **View Statistics**:
   - Check the stat cards at top:
     - Total Games
     - Imported from RAWG
     - Manually Added
     - Import Percentage

---

### **STEP 4: Browse Games (Public Page)**

1. **Navigate to**: http://localhost:5173/games
   - Or click "Browse Games" in navbar

2. **Test Search**:
   - Type a game name in the search box
   - Click "Apply Filters"
   - Results should update

3. **Test Filters**:
   - Select a **Genre** (Action, RPG, etc.)
   - Select a **Platform** (PC, PS5, etc.)
   - Set **Price Range** (Min: 0, Max: 50)
   - Click "Apply Filters"

4. **Test Sorting**:
   - Try different sort options:
     - Newest First
     - Price: Low to High
     - Price: High to Low
     - Highest Rated

5. **Test View Modes**:
   - Click Grid icon (⊞) for grid view
   - Click List icon (☰) for list view

6. **Test Pagination**:
   - If you have more than 12 games, page numbers will appear
   - Click different pages to navigate

---

### **STEP 5: View Game Details**

1. Click on any game card
2. You'll see:
   - Game images
   - Full description
   - Price and stock
   - Platforms and genres
   - Reviews (if any)
   - Add to Cart button

---

## 📊 Expected Results

### After Importing Games:

✅ **Import Stats Should Show**:
- Total games count increases
- "Imported from RAWG" number goes up
- Import percentage updates

✅ **Games Page Should Show**:
- All imported games with images
- Proper titles and descriptions
- Correct prices (calculated from metacritic scores)
- Platform and genre tags
- Ratings

✅ **Search Should Work**:
- Type "zelda" → Shows Zelda games
- Type "action" → Shows action games
- Type "mario" → Shows Mario games

✅ **Filters Should Work**:
- Genre filter shows only selected genre
- Platform filter shows only selected platform
- Price range filters by min/max price

---

## 🐛 Troubleshooting

### Problem: "No games found from RAWG API"
**Solution**: 
1. Check your RAWG_API_KEY in backend/.env
2. Make sure backend server restarted after adding key
3. Check backend terminal for errors

### Problem: "Already Imported" message
**Solution**: 
- This is normal! RAWG ID prevents duplicates
- Try different search terms or page numbers

### Problem: Games page shows "No games found"
**Solution**: 
1. Import some games first from admin panel
2. Check if backend server is running
3. Clear filters on games page

### Problem: Backend server not starting
**Solution**:
```bash
# Kill the process on port 3001
netstat -ano | findstr :3001
taskkill /PID <pid_number> /F

# Then restart
cd backend
npm run dev
```

---

## 🎯 Sample Test Scenarios

### **Scenario 1: Import Top Action Games**
1. Login as admin
2. Go to Import Games
3. Search: "action"
4. Click Preview
5. Click Import All
6. Go to Browse Games
7. Filter by Genre: Action
8. Verify all action games are listed

### **Scenario 2: Import and Browse Zelda Games**
1. Login as admin
2. Go to Import Games
3. Search: "zelda"
4. Click Preview (you should see multiple Zelda games)
5. Click Import All
6. Go to Browse Games
7. Search: "zelda"
8. Click Apply Filters
9. Verify Zelda games appear

### **Scenario 3: Import Games and Check Prices**
1. Login as admin
2. Go to Import Games
3. Click Preview (no search)
4. Import 10-20 games
5. Go to Browse Games
6. Set Price Range: Min=0, Max=40
7. Apply Filters
8. Verify only games under ₹40 show

---

## 📝 What to Test Next

Once game listing is working:

✅ Game listings display correctly
✅ Search works
✅ Filters work
✅ Import from RAWG works
✅ Admin can manage games

🔜 **Next: Payment Gateway**
- Stripe payment (already implemented)
- Razorpay dummy payment (ready to test)

---

## 💡 Quick Tips

- **Import 20-50 games** for best testing experience
- **Try different search terms**: "mario", "zelda", "gta", "minecraft", "fortnite"
- **Use page numbers** to get more variety
- **Genres available**: Action, Adventure, RPG, Strategy, Shooter, Puzzle, Racing, Sports, etc.
- **Free RAWG API** allows 20,000 requests/month (plenty for development!)

---

## 🎉 Success Checklist

- [ ] RAWG API key added to .env
- [ ] Backend server restarted
- [ ] Logged in as admin
- [ ] Can access Import Games page
- [ ] Can preview RAWG games
- [ ] Can import games successfully
- [ ] Games appear on Browse Games page
- [ ] Search functionality works
- [ ] Filters work properly
- [ ] Can view individual game details
- [ ] Images display correctly
- [ ] Prices show properly

**Once all checkboxes are complete, you're ready to move to payment gateway testing!** 🚀
