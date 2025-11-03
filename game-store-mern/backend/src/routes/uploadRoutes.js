const express = require('express');
const { upload, uploadSingleImage, uploadMultipleImages } = require('../utils/imageUpload');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

// POST /api/upload/single - upload a single image (admin only)
router.post('/single', authenticate, authorizeAdmin, upload.single('image'), uploadSingleImage);

// POST /api/upload/multiple - upload multiple images (admin only)
router.post('/multiple', authenticate, authorizeAdmin, upload.array('images', 6), uploadMultipleImages);

// POST /api/upload/avatar - upload avatar image for authenticated users
// This endpoint intentionally allows any authenticated user to upload their own avatar.
router.post('/avatar', authenticate, upload.single('image'), uploadSingleImage);

module.exports = router;
