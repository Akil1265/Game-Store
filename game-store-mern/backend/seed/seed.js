const mongoose = require('mongoose');
const Game = require('../src/models/Game');
const User = require('../src/models/User');
require('dotenv').config();

async function seed() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');

    // Create admin user
    const adminEmail = 'admin@example.com';
    
    // Delete existing admin if exists to ensure correct password
    await User.deleteOne({ email: adminEmail });
    
    await User.create({
      name: 'Admin',
      email: adminEmail,
      password: 'AdminPass123!',
      role: 'ADMIN'
    });
    console.log('Admin user created:', adminEmail, 'password: AdminPass123!');

    // Sample games data
    const games = [
      {
        title: 'CyberRunner',
        slug: 'cyberrunner',
        description: 'Fast-paced cyberpunk runner game with stunning visuals and intense gameplay. Navigate through neon-lit cityscapes while avoiding obstacles and collecting power-ups.',
        price: 499,
        currency: 'INR',
        images: ['https://via.placeholder.com/800x600/0066cc/ffffff?text=CyberRunner'],
        platform: ['PC', 'PS5'],
        genre: ['Action', 'Runner'],
        publisher: 'Indie Studio',
        releaseDate: new Date('2024-01-15'),
        stock: 100
      },
      {
        title: 'Fantasy Quest',
        slug: 'fantasy-quest',
        description: 'Embark on an epic adventure in a magical world filled with dragons, wizards, and ancient mysteries. Features 50+ hours of gameplay with branching storylines.',
        price: 1299,
        currency: 'INR',
        images: ['https://via.placeholder.com/800x600/009900/ffffff?text=Fantasy+Quest'],
        platform: ['PC', 'Xbox', 'PS5'],
        genre: ['RPG', 'Adventure'],
        publisher: 'Epic Games Studio',
        releaseDate: new Date('2023-12-01'),
        stock: 75
      },
      {
        title: 'Space Warriors',
        slug: 'space-warriors',
        description: 'Command your fleet in this strategic space combat game. Build your empire, form alliances, and conquer the galaxy in epic real-time battles.',
        price: 899,
        currency: 'INR',
        images: ['https://via.placeholder.com/800x600/cc6600/ffffff?text=Space+Warriors'],
        platform: ['PC'],
        genre: ['Strategy', 'Simulation'],
        publisher: 'Galaxy Games',
        releaseDate: new Date('2024-03-10'),
        stock: 50
      },
      {
        title: 'Racing Thunder',
        slug: 'racing-thunder',
        description: 'Experience the thrill of high-speed racing with realistic physics and stunning graphics. Race on 20+ tracks with over 50 licensed vehicles.',
        price: 799,
        currency: 'INR',
        images: ['https://via.placeholder.com/800x600/cc0000/ffffff?text=Racing+Thunder'],
        platform: ['PC', 'PS5', 'Xbox'],
        genre: ['Racing', 'Sports'],
        publisher: 'Speed Demons',
        releaseDate: new Date('2024-02-20'),
        stock: 120
      },
      {
        title: 'Horror Mansion',
        slug: 'horror-mansion',
        description: 'Survive the night in this terrifying horror experience. Explore a haunted mansion, solve puzzles, and uncover dark secrets while avoiding supernatural threats.',
        price: 699,
        currency: 'INR',
        images: ['https://via.placeholder.com/800x600/330033/ffffff?text=Horror+Mansion'],
        platform: ['PC', 'PS5'],
        genre: ['Horror', 'Adventure'],
        publisher: 'Nightmare Studios',
        releaseDate: new Date('2023-10-31'),
        stock: 80
      },
      {
        title: 'Puzzle Master',
        slug: 'puzzle-master',
        description: 'Challenge your mind with over 200 unique puzzles. From simple brain teasers to complex logic challenges, this game will keep you entertained for hours.',
        price: 299,
        currency: 'INR',
        images: ['https://via.placeholder.com/800x600/9966cc/ffffff?text=Puzzle+Master'],
        platform: ['PC', 'Mobile', 'Nintendo Switch'],
        genre: ['Puzzle', 'Indie'],
        publisher: 'Brain Games Inc',
        releaseDate: new Date('2024-01-05'),
        stock: 200
      },
      {
        title: 'Battle Arena',
        slug: 'battle-arena',
        description: 'Enter the ultimate fighting tournament with 30+ unique fighters, each with their own fighting style and special moves. Master combos and become the champion.',
        price: 999,
        currency: 'INR',
        images: ['https://via.placeholder.com/800x600/ff6600/ffffff?text=Battle+Arena'],
        platform: ['PC', 'PS5', 'Xbox'],
        genre: ['Fighting', 'Action'],
        publisher: 'Combat Studios',
        releaseDate: new Date('2024-04-15'),
        stock: 90
      },
      {
        title: 'City Builder',
        slug: 'city-builder',
        description: 'Build and manage your dream city from the ground up. Design urban layouts, manage resources, and keep your citizens happy in this detailed simulation game.',
        price: 1099,
        currency: 'INR',
        images: ['https://via.placeholder.com/800x600/00cc99/ffffff?text=City+Builder'],
        platform: ['PC'],
        genre: ['Simulation', 'Strategy'],
        publisher: 'Urban Planning Games',
        releaseDate: new Date('2023-11-20'),
        stock: 60
      },
      {
        title: 'VR Adventure',
        slug: 'vr-adventure',
        description: 'Immerse yourself in virtual reality with this groundbreaking adventure game. Explore fantastic worlds, solve puzzles, and interact with the environment like never before.',
        price: 1599,
        currency: 'INR',
        images: ['https://via.placeholder.com/800x600/cc00cc/ffffff?text=VR+Adventure'],
        platform: ['VR'],
        genre: ['Adventure', 'VR'],
        publisher: 'Virtual Worlds Inc',
        releaseDate: new Date('2024-05-01'),
        stock: 40
      },
      {
        title: 'Retro Platformer',
        slug: 'retro-platformer',
        description: 'Experience classic platforming action with modern polish. Jump, run, and collect coins through beautifully crafted levels inspired by golden age gaming.',
        price: 399,
        currency: 'INR',
        images: ['https://via.placeholder.com/800x600/ffcc00/ffffff?text=Retro+Platformer'],
        platform: ['PC', 'Nintendo Switch'],
        genre: ['Platformer', 'Indie'],
        publisher: 'Pixel Perfect Games',
        releaseDate: new Date('2024-03-25'),
        stock: 150
      }
    ];

    // Insert games if they don't exist
    for (const gameData of games) {
      const existingGame = await Game.findOne({ slug: gameData.slug });
      if (!existingGame) {
        await Game.create(gameData);
        console.log(`Created game: ${gameData.title}`);
      } else {
        console.log(`Game already exists: ${gameData.title}`);
      }
    }

    console.log('Seed completed successfully!');
    console.log('\nQuick start:');
    console.log('1. Admin login: admin@example.com / AdminPass123!');
    console.log('2. Backend API: http://localhost:5000/api');
    console.log('3. Health check: http://localhost:5000/api/health');
    
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seed();
