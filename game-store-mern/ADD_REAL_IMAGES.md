# 🎮 Add Real Steam Images to Your Games

## ✅ Quick Method - Using MongoDB Atlas Dashboard

### Step 1: Login to MongoDB Atlas
1. Go to: https://cloud.mongodb.com
2. Login with your account

### Step 2: Navigate to Your Database
1. Click "Browse Collections"
2. Select database: `gamestore`
3. Select collection: `games`

### Step 3: Update Games with Real Steam Images

#### For Stardew Valley:
1. Find any game in the list (or search for "Retro")
2. Click the **Edit** (pencil icon) button
3. Update these fields:

```json
{
  "title": "Stardew Valley",
  "coverImage": "https://cdn.cloudflare.steamstatic.com/steam/apps/413150/header.jpg",
  "images": [
    "https://cdn.cloudflare.steamstatic.com/steam/apps/413150/header.jpg",
    "https://cdn.cloudflare.steamstatic.com/steam/apps/413150/ss_d779039b6dd1e0c6c76898924c555ec8b53f6433.1920x1080.jpg"
  ],
  "description": "You've inherited your grandfather's old farm plot in Stardew Valley. Armed with hand-me-down tools and a few coins, you set out to begin your new life.",
  "genre": ["Simulation", "RPG", "Indie"],
  "price": 399,
  "platform": ["PC", "Switch", "PlayStation", "Xbox"]
}
```

4. Click **Update**
5. Go to your website and refresh!

---

## 🎯 More Steam Game Images

Here are real Steam CDN URLs you can use:

### Red Dead Redemption 2
```
https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/header.jpg
```

### The Witcher 3
```
https://cdn.cloudflare.steamstatic.com/steam/apps/292030/header.jpg
```

### Cyberpunk 2077
```
https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg
```

### Elden Ring
```
https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg
```

### Hollow Knight
```
https://cdn.cloudflare.steamstatic.com/steam/apps/367520/header.jpg
```

### Hades
```
https://cdn.cloudflare.steamstatic.com/steam/apps/1145360/header.jpg
```

### God of War
```
https://cdn.cloudflare.steamstatic.com/steam/apps/1593500/header.jpg
```

### Spider-Man Remastered
```
https://cdn.cloudflare.steamstatic.com/steam/apps/1817070/header.jpg
```

### Baldur's Gate 3
```
https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/header.jpg
```

### Minecraft
```
https://cdn.cloudflare.steamstatic.com/steam/apps/1794680/header.jpg
```

---

## 🚀 Alternative: Use Your Admin Panel

1. Go to: **https://gamestore-frontend-six.vercel.app/admin/games**
2. Login as admin
3. Click **Edit** on any game
4. Paste the Steam CDN URL in the **Cover Image** field
5. Click **Save**

The image will update immediately!

---

## 💡 Pro Tip: Find More Steam Images

To get any Steam game's image:
1. Go to Steam store: https://store.steampowered.com
2. Search for the game
3. Look at the URL - it will be like: `store.steampowered.com/app/413150/Stardew_Valley/`
4. The number `413150` is the App ID
5. Use this format: `https://cdn.cloudflare.steamstatic.com/steam/apps/413150/header.jpg`

Replace `413150` with any game's App ID!

---

## ✨ Result

After updating, your website will show **REAL game images** instead of placeholders! 🎮🖼️

Test with just ONE game first to see it working, then update the rest!
