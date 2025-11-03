const express = require('express');
const router = express.Router();
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const importController = require('../controllers/importController');

// All routes require admin authentication
router.use(authenticate, authorizeAdmin);

// Preview games from RAWG without importing
router.post('/rawg/preview', importController.previewRawgGames);

// Import games from RAWG API
router.post('/rawg', importController.importFromRawg);

// Import single game by RAWG ID
router.post('/rawg/:rawgId', importController.importSingleGame);

// Get import statistics
router.get('/stats', importController.getImportStats);

module.exports = router;
