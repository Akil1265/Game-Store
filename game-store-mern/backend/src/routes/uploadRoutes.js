const express = require('express');
const { upload, uploadSingleImage, uploadMultipleImages } = require('../utils/imageUpload');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

// POST /api/upload/single - upload a single image
router.post('/single', authenticate, authorizeAdmin, upload.single('image'), uploadSingleImage);

// POST /api/upload/multiple - upload multiple images
router.post('/multiple', authenticate, authorizeAdmin, upload.array('images', 6), uploadMultipleImages);

module.exports = router;
