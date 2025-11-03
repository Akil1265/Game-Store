const mongoose = require('mongoose');
const Game = require('../src/models/Game');
require('dotenv').config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const uiGenres = [
      'Action','Adventure','RPG','Strategy','Sports','Racing','Simulation','Puzzle','Fighting','Horror','Indie'
    ];
    const uiPlatforms = ['PC','PS5','Xbox','Nintendo Switch','Mobile','VR'];

    const genreCounts = await Game.aggregate([
      { $unwind: '$genre' },
      { $group: { _id: '$genre', count: { $sum: 1 } } },
    ]);

    const platformCounts = await Game.aggregate([
      { $unwind: '$platform' },
      { $group: { _id: '$platform', count: { $sum: 1 } } },
    ]);

    // Map to objects keyed by name for easy lookup
    const gMap = Object.fromEntries(genreCounts.map(g => [g._id, g.count]));
    const pMap = Object.fromEntries(platformCounts.map(p => [p._id, p.count]));

    const report = {
      genres: uiGenres.map(name => ({ name, count: gMap[name] || 0 })),
      platforms: uiPlatforms.map(name => ({ name, count: pMap[name] || 0 })),
      totalGames: await Game.countDocuments(),
    };

    console.log('\nFilter coverage report');
    console.log('======================');
    console.table(report.genres);
    console.table(report.platforms);
    console.log('Total games:', report.totalGames);
  } catch (err) {
    console.error('Coverage check failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
})();
