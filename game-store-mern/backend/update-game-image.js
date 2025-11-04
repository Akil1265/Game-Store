// Update game with real Steam image
require('dotenv').config();
const mongoose = require('mongoose');
const Game = require('./src/models/Game');

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

async function updateGameImage() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find Stardew Valley or any game
    const game = await Game.findOne({ title: /stardew/i });
    
    if (!game) {
      console.log('❌ Game not found, updating first game instead');
      const firstGame = await Game.findOne();
      if (firstGame) {
        firstGame.coverImage = 'https://cdn.cloudflare.steamstatic.com/steam/apps/413150/header.jpg';
        firstGame.title = 'Stardew Valley'; // Update title too
        firstGame.description = 'You\'ve inherited your grandfather\'s old farm plot in Stardew Valley. Armed with hand-me-down tools and a few coins, you set out to begin your new life.';
        firstGame.genre = ['Simulation', 'RPG', 'Indie'];
        firstGame.price = 399;
        await firstGame.save();
        console.log('✅ Updated first game with Stardew Valley data and Steam image!');
        console.log(`Game ID: ${firstGame._id}`);
        console.log(`Title: ${firstGame.title}`);
        console.log(`Image: ${firstGame.coverImage}`);
      }
    } else {
      game.coverImage = 'https://cdn.cloudflare.steamstatic.com/steam/apps/413150/header.jpg';
      game.images = [
        'https://cdn.cloudflare.steamstatic.com/steam/apps/413150/header.jpg',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/413150/ss_d779039b6dd1e0c6c76898924c555ec8b53f6433.1920x1080.jpg'
      ];
      await game.save();
      console.log('✅ Updated Stardew Valley with real Steam image!');
      console.log(`Game ID: ${game._id}`);
      console.log(`Image: ${game.coverImage}`);
    }

    await mongoose.disconnect();
    console.log('✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateGameImage();
