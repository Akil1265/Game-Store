// Seed real games with actual images
require('dotenv').config();
const mongoose = require('mongoose');
const Game = require('./src/models/Game');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

const realGames = [
  {
    title: "Stardew Valley",
    slug: "stardew-valley",
    description: "You've inherited your grandfather's old farm plot in Stardew Valley. Armed with hand-me-down tools and a few coins, you set out to begin your new life. Can you learn to live off the land and turn these overgrown fields into a thriving home?",
    price: 399,
    stock: 100,
    genre: ["Simulation", "RPG", "Indie"],
    platform: ["PC", "Nintendo Switch", "PS5", "Xbox", "Mobile"],
    releaseDate: new Date("2016-02-26"),
    publisher: "ConcernedApe",
    coverImage: "https://cdn.cloudflare.steamstatic.com/steam/apps/413150/header.jpg",
    images: [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/413150/ss_d779039b6dd1e0c6c76898924c555ec8b53f6433.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/413150/ss_623b9366c47d0b2e7214c54904ea5eec35e77dfd.1920x1080.jpg"
    ],
    screenshots: [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/413150/ss_d779039b6dd1e0c6c76898924c555ec8b53f6433.1920x1080.jpg"
    ]
  },
  {
    title: "The Witcher 3: Wild Hunt",
    slug: "the-witcher-3-wild-hunt",
    description: "As war rages on throughout the Northern Realms, you take on the greatest contract of your life — tracking down the Child of Prophecy, a living weapon that can alter the shape of the world.",
    price: 799,
    stock: 100,
    genre: ["RPG", "Action", "Adventure"],
    platform: ["PC", "PS5", "Xbox", "Nintendo Switch"],
    releaseDate: new Date("2015-05-18"),
    publisher: "CD PROJEKT RED",
    coverImage: "https://cdn.cloudflare.steamstatic.com/steam/apps/292030/header.jpg",
    images: [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/292030/ss_8da6155a72dd2e2c4be9097edff4b858b6c2ccf9.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/292030/ss_cd9066e6d09dc8e8ae41908fb3f63d7f33d55e05.1920x1080.jpg"
    ],
    screenshots: [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/292030/ss_8da6155a72dd2e2c4be9097edff4b858b6c2ccf9.1920x1080.jpg"
    ]
  },
  {
    title: "Hollow Knight",
    slug: "hollow-knight",
    description: "Forge your own path in Hollow Knight! An epic action adventure through a vast ruined kingdom of insects and heroes. Explore twisting caverns, battle tainted creatures and befriend bizarre bugs, all in a classic, hand-drawn 2D style.",
    price: 349,
    stock: 100,
    genre: ["Action", "Adventure", "Indie", "Platformer"],
    platform: ["PC", "Nintendo Switch", "PS5", "Xbox"],
    releaseDate: new Date("2017-02-24"),
    publisher: "Team Cherry",
    coverImage: "https://cdn.cloudflare.steamstatic.com/steam/apps/367520/header.jpg",
    images: [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/367520/ss_9df10dc8a1e7c9d5e5c0d5c74ae89cfb0e24a595.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/367520/ss_9c3937e5c1cbf5a8ef4f5d285fc0c2b5d6c9d07a.1920x1080.jpg"
    ],
    screenshots: [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/367520/ss_9df10dc8a1e7c9d5e5c0d5c74ae89cfb0e24a595.1920x1080.jpg"
    ]
  },
  {
    title: "Hades",
    slug: "hades",
    description: "Defy the god of the dead as you hack and slash out of the Underworld in this rogue-like dungeon crawler from the creators of Bastion, Transistor, and Pyre.",
    price: 599,
    stock: 100,
    genre: ["Action", "Indie", "RPG"],
    platform: ["PC", "Nintendo Switch", "PS5", "Xbox"],
    releaseDate: new Date("2020-09-17"),
    publisher: "Supergiant Games",
    coverImage: "https://cdn.cloudflare.steamstatic.com/steam/apps/1145360/header.jpg",
    images: [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1145360/ss_5b4143c94520aea50444bc02c24471ccce5635cd.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1145360/ss_5399b1ed3c276a2d8e81d6e664f2a05e95328fd0.1920x1080.jpg"
    ],
    screenshots: [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1145360/ss_5b4143c94520aea50444bc02c24471ccce5635cd.1920x1080.jpg"
    ]
  },
  {
    title: "Red Dead Redemption 2",
    slug: "red-dead-redemption-2",
    description: "America, 1899. Arthur Morgan and the Van der Linde gang are outlaws on the run. With federal agents and the best bounty hunters in the nation massing on their heels, the gang must rob, steal and fight their way across the rugged heartland of America.",
    price: 1999,
    stock: 100,
    genre: ["Action", "Adventure"],
    platform: ["PC", "PS5", "Xbox"],
    releaseDate: new Date("2019-11-05"),
    publisher: "Rockstar Games",
    coverImage: "https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/header.jpg",
    images: [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/ss_d1a8f5a69155c3186c65d1da90491fcfd43663d9.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/ss_668dafe477743f8b50b818d5bbfcec669e9ba93e.1920x1080.jpg"
    ],
    screenshots: [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/ss_d1a8f5a69155c3186c65d1da90491fcfd43663d9.1920x1080.jpg"
    ]
  },
  {
    title: "Elden Ring",
    slug: "elden-ring",
    description: "THE NEW FANTASY ACTION RPG. Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between.",
    price: 2499,
    stock: 100,
    genre: ["Action", "RPG", "Adventure"],
    platform: ["PC", "PS5", "Xbox"],
    releaseDate: new Date("2022-02-25"),
    publisher: "Bandai Namco",
    coverImage: "https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg",
    images: [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/ss_6d5e45ddb38c5672e96c0425fa19a34cfc591cae.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/ss_2863704c8bf9f5cbbd0f71248ae1b7a6c96a5e0e.1920x1080.jpg"
    ],
    screenshots: [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/ss_6d5e45ddb38c5672e96c0425fa19a34cfc591cae.1920x1080.jpg"
    ]
  },
  {
    title: "Cyberpunk 2077",
    slug: "cyberpunk-2077",
    description: "Cyberpunk 2077 is an open-world, action-adventure RPG set in the dark future of Night City — a dangerous megalopolis obsessed with power, glamor, and ceaseless body modification.",
    price: 1499,
    stock: 100,
    genre: ["RPG", "Action", "Adventure"],
    platform: ["PC", "PS5", "Xbox"],
    releaseDate: new Date("2020-12-10"),
    publisher: "CD PROJEKT RED",
    coverImage: "https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg",
    images: [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/ss_ffbfc5bb6c97303f8d9d0127f941a18c6b6f99c6.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/ss_814c4e3e3c6c069e8ad255ddc77f26d7be8ffc2d.1920x1080.jpg"
    ],
    screenshots: [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/ss_ffbfc5bb6c97303f8d9d0127f941a18c6b6f99c6.1920x1080.jpg"
    ]
  },
  {
    title: "God of War",
    slug: "god-of-war",
    description: "His vengeance against the Gods of Olympus years behind him, Kratos now lives as a man in the realm of Norse Gods and monsters. It is in this harsh, unforgiving world that he must fight to survive... and teach his son to do the same.",
    price: 1799,
    stock: 100,
    genre: ["Action", "Adventure"],
    platform: ["PC", "PS5"],
    releaseDate: new Date("2022-01-14"),
    publisher: "PlayStation PC LLC",
    coverImage: "https://cdn.cloudflare.steamstatic.com/steam/apps/1593500/header.jpg",
    images: [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1593500/ss_7eb7d1e4c0dd0f85dd50b0f90c25da68d9822a23.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1593500/ss_442136f6d84f1ce5ece66c6df9e9a0c5e1ffc93e.1920x1080.jpg"
    ],
    screenshots: [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1593500/ss_7eb7d1e4c0dd0f85dd50b0f90c25da68d9822a23.1920x1080.jpg"
    ]
  },
  {
    title: "Baldur's Gate 3",
    slug: "baldurs-gate-3",
    description: "Gather your party and return to the Forgotten Realms in a tale of fellowship and betrayal, sacrifice and survival, and the lure of absolute power.",
    price: 2999,
    stock: 100,
    genre: ["RPG", "Strategy", "Adventure"],
    platform: ["PC", "PS5", "Xbox"],
    releaseDate: new Date("2023-08-03"),
    publisher: "Larian Studios",
    coverImage: "https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/header.jpg",
    images: [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/ss_95f7cdfa00cfe3db6b154f2e8dc44c53ffd70f85.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/ss_baa27172cac1a8ccb9bbf2f67b98e588c8cf0c53.1920x1080.jpg"
    ],
    screenshots: [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/ss_95f7cdfa00cfe3db6b154f2e8dc44c53ffd70f85.1920x1080.jpg"
    ]
  },
  {
    title: "Spider-Man Remastered",
    slug: "spider-man-remastered",
    description: "In Marvel's Spider-Man Remastered, the worlds of Peter Parker and Spider-Man collide in an original action-packed story. Play as an experienced Peter Parker, fighting big crime and iconic villains in Marvel's New York.",
    price: 1999,
    stock: 100,
    genre: ["Action", "Adventure"],
    platform: ["PC", "PS5"],
    releaseDate: new Date("2022-08-12"),
    publisher: "PlayStation PC LLC",
    coverImage: "https://cdn.cloudflare.steamstatic.com/steam/apps/1817070/header.jpg",
    images: [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1817070/ss_ab6178275a9796e32dd817de452509e62dd654f2.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1817070/ss_d0934e5d880e07e4e347f7f4e8a5c7f9107d7b87.1920x1080.jpg"
    ],
    screenshots: [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1817070/ss_ab6178275a9796e32dd817de452509e62dd654f2.1920x1080.jpg"
    ]
  },
  {
    title: "Minecraft",
    slug: "minecraft",
    description: "Explore randomly generated worlds and build amazing things from the simplest of homes to the grandest of castles. Play in creative mode with unlimited resources or mine deep into the world in survival mode.",
    price: 799,
    stock: 100,
    genre: ["Simulation", "Adventure"],
    platform: ["PC", "Nintendo Switch", "PS5", "Xbox", "Mobile"],
    releaseDate: new Date("2011-11-18"),
    publisher: "Mojang Studios",
    coverImage: "https://cdn.cloudflare.steamstatic.com/steam/apps/1794680/header.jpg",
    images: [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1794680/ss_7bf23c4f5e66b26c3b20f62ebe521bf87441b8ac.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1794680/ss_2e36bfbfc36e1e6e3f8c9e9cccadf3e90f4fb45d.1920x1080.jpg"
    ],
    screenshots: [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1794680/ss_7bf23c4f5e66b26c3b20f62ebe521bf87441b8ac.1920x1080.jpg"
    ]
  },
  {
    title: "Celeste",
    slug: "celeste",
    description: "Help Madeline survive her inner demons on her journey to the top of Celeste Mountain, in this super-tight, hand-crafted platformer from the creators of multiplayer classic TowerFall.",
    price: 499,
    stock: 100,
    genre: ["Platformer", "Indie", "Adventure"],
    platform: ["PC", "Nintendo Switch", "PS5", "Xbox"],
    releaseDate: new Date("2018-01-25"),
    publisher: "Maddy Makes Games",
    coverImage: "https://cdn.cloudflare.steamstatic.com/steam/apps/504230/header.jpg",
    images: [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/504230/ss_8d6f6bbbf98c288e964d0b484757a0a25e19e2b1.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/504230/ss_b5e16d00da1f3f68c988dd7bf8c3073e8e8837fa.1920x1080.jpg"
    ],
    screenshots: [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/504230/ss_8d6f6bbbf98c288e964d0b484757a0a25e19e2b1.1920x1080.jpg"
    ]
  },
  {
    title: "Portal 2",
    slug: "portal-2",
    description: "The sequel to the acclaimed Portal, Portal 2 pits the protagonist of the original game against more mind-bending puzzles conceived by GLaDOS, an A.I. with a sardonic personality.",
    price: 199,
    stock: 100,
    genre: ["Puzzle", "Adventure"],
    platform: ["PC", "PS5", "Xbox"],
    releaseDate: new Date("2011-04-18"),
    publisher: "Valve",
    coverImage: "https://cdn.cloudflare.steamstatic.com/steam/apps/620/header.jpg",
    images: [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/620/ss_63c26a5f5bb9a822285ec1b6ddaf21c91f4c97b5.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/620/ss_c94e04f2c0c0af3b8eef4f8cf26d141d9260965c.1920x1080.jpg"
    ],
    screenshots: [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/620/ss_63c26a5f5bb9a822285ec1b6ddaf21c91f4c97b5.1920x1080.jpg"
    ]
  },
  {
    title: "Terraria",
    slug: "terraria",
    description: "Dig, fight, explore, build! Nothing is impossible in this action-packed adventure game. The world is your canvas and the ground itself is your paint.",
    price: 249,
    stock: 100,
    genre: ["Adventure", "Action"],
    platform: ["PC", "Nintendo Switch", "PS5", "Xbox", "Mobile"],
    releaseDate: new Date("2011-05-16"),
    publisher: "Re-Logic",
    coverImage: "https://cdn.cloudflare.steamstatic.com/steam/apps/105600/header.jpg",
    images: [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/105600/ss_d5267f822f6276be6e11a0ede2797c7f60e0c07f.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/105600/ss_e4d2a87a90f5bb8e04ce8dbf1c51e35be3b8badc.1920x1080.jpg"
    ],
    screenshots: [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/105600/ss_d5267f822f6276be6e11a0ede2797c7f60e0c07f.1920x1080.jpg"
    ]
  },
  {
    title: "Dark Souls III",
    slug: "dark-souls-3",
    description: "Dark Souls continues to push the boundaries with the latest, ambitious chapter in the critically-acclaimed and genre-defining series. Prepare yourself and Embrace The Darkness!",
    price: 1299,
    stock: 100,
    genre: ["Action", "RPG", "Adventure"],
    platform: ["PC", "PS5", "Xbox"],
    releaseDate: new Date("2016-04-11"),
    publisher: "Bandai Namco",
    coverImage: "https://cdn.cloudflare.steamstatic.com/steam/apps/374320/header.jpg",
    images: [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/374320/ss_0f81c61f7526064ced620dd1a83c1d2dcdcc5a1f.1920x1080.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/374320/ss_ef16f3f4a309f591cf4a8c1eeb4f8bb80472b64d.1920x1080.jpg"
    ],
    screenshots: [
      "https://cdn.cloudflare.steamstatic.com/steam/apps/374320/ss_0f81c61f7526064ced620dd1a83c1d2dcdcc5a1f.1920x1080.jpg"
    ]
  }
];

async function seedGames() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing games
    console.log('🗑️  Clearing existing games...');
    await Game.deleteMany({});
    console.log('✅ Cleared existing games');

    // Insert new games
    console.log('📦 Inserting real games with images...');
    const inserted = await Game.insertMany(realGames);
    console.log(`✅ Successfully inserted ${inserted.length} games!`);

    // Display summary
    console.log('\n📊 Games Added:');
    inserted.forEach((game, index) => {
      console.log(`${index + 1}. ${game.title} - ₹${game.price}`);
      console.log(`   Image: ${game.coverImage}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Seeding completed successfully!');
    console.log('🚀 Visit your website to see the games with real images!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedGames();
