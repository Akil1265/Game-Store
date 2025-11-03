const Game = require('../models/Game');
const rawgService = require('../services/rawgService');
const { AppError } = require('../utils/errors');

/**
 * Import games from RAWG API
 * @route POST /api/admin/import/rawg
 * @access Admin
 */
exports.importFromRawg = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, search = '', ordering = '-rating' } = req.body;

    // Fetch games from RAWG
    const rawgData = await rawgService.fetchGames({ page, pageSize, search, ordering });

    if (!rawgData.results || rawgData.results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No games found from RAWG API'
      });
    }

    const importResults = {
      total: rawgData.results.length,
      imported: 0,
      skipped: 0,
      errors: 0,
      games: []
    };

    // Process each game
    for (const rawgGame of rawgData.results) {
      try {
        // Check if game already exists by RAWG ID
        const existingGame = await Game.findOne({ rawgId: rawgGame.id });
        
        if (existingGame) {
          importResults.skipped++;
          continue;
        }

        // Fetch detailed game info (includes description)
        const mappedGame = await rawgService.fetchAndMapGame(rawgGame.id);

        // Create new game
        const newGame = await Game.create(mappedGame);
        
        importResults.imported++;
        importResults.games.push({
          id: newGame._id,
          title: newGame.title,
          slug: newGame.slug,
          rawgId: newGame.rawgId
        });

      } catch (error) {
        console.error(`Error importing game ${rawgGame.name}:`, error.message);
        importResults.errors++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Import completed: ${importResults.imported} imported, ${importResults.skipped} skipped, ${importResults.errors} errors`,
      data: importResults,
      pagination: {
        currentPage: page,
        totalResults: rawgData.count,
        hasNext: !!rawgData.next
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Import a single game by RAWG ID
 * @route POST /api/admin/import/rawg/:rawgId
 * @access Admin
 */
exports.importSingleGame = async (req, res, next) => {
  try {
    const { rawgId } = req.params;

    // Check if game already exists
    const existingGame = await Game.findOne({ rawgId: parseInt(rawgId) });
    
    if (existingGame) {
      return res.status(400).json({
        success: false,
        message: 'Game already imported',
        data: existingGame
      });
    }

    // Fetch and map game data
    const mappedGame = await rawgService.fetchAndMapGame(rawgId);

    // Create new game
    const newGame = await Game.create(mappedGame);

    res.status(201).json({
      success: true,
      message: 'Game imported successfully',
      data: newGame
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Get preview of games from RAWG (without importing)
 * @route POST /api/admin/import/rawg/preview
 * @access Admin
 */
exports.previewRawgGames = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, search = '', ordering = '-rating' } = req.body;

    // Fetch games from RAWG
    const rawgData = await rawgService.fetchGames({ page, pageSize, search, ordering });

    if (!rawgData.results || rawgData.results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No games found from RAWG API'
      });
    }

    // Map games without importing
    const mappedGames = await Promise.all(
      rawgData.results.slice(0, 5).map(async (game) => {
        try {
          const mapped = await rawgService.fetchAndMapGame(game.id);
          // Check if already exists
          const exists = await Game.findOne({ rawgId: game.id });
          return {
            ...mapped,
            alreadyImported: !!exists
          };
        } catch (error) {
          return null;
        }
      })
    );

    res.status(200).json({
      success: true,
      message: 'Preview fetched successfully',
      data: {
        games: mappedGames.filter(g => g !== null),
        totalAvailable: rawgData.count,
        currentPage: page,
        hasNext: !!rawgData.next
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Get import statistics
 * @route GET /api/admin/import/stats
 * @access Admin
 */
exports.getImportStats = async (req, res, next) => {
  try {
    const totalGames = await Game.countDocuments();
    const importedFromRawg = await Game.countDocuments({ rawgId: { $exists: true, $ne: null } });
    const manuallyAdded = totalGames - importedFromRawg;

    res.status(200).json({
      success: true,
      data: {
        totalGames,
        importedFromRawg,
        manuallyAdded,
        importPercentage: totalGames > 0 ? Math.round((importedFromRawg / totalGames) * 100) : 0
      }
    });

  } catch (error) {
    next(error);
  }
};
