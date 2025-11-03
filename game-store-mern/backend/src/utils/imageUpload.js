const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const streamifier = require('streamifier');

// Configure Cloudinary
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// Local storage configuration
// When running on Vercel (serverless), the project folder is read-only.
// Use the system temporary directory instead for uploads in serverless
const isServerless = Boolean(process.env.VERCEL);
const uploadDir = isServerless
  ? path.join(os.tmpdir(), 'game-store-uploads')
  : path.join(__dirname, '../../uploads');
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (err) {
  // If the environment is read-only (e.g., some serverless setups), fallback
  // to using the OS temp dir without failing startup. We will rely on Cloudinary
  // for real uploads in production environments.
  console.warn('Could not create upload directory:', uploadDir, err.message);
}

// Multer configuration for local storage
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

// Multer middleware
const upload = multer({
  storage: localStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter
});

// Upload to Cloudinary
const uploadToCloudinary = async (filePath, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'game-store',
      resource_type: 'image',
      ...options
    });
    return result.secure_url;
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

const uploadBufferToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'game-store',
        resource_type: 'image',
        ...options
      },
      (error, result) => {
        if (error) {
          return reject(new Error(`Cloudinary upload failed: ${error.message}`));
        }
        resolve(result.secure_url);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// Upload single image
const uploadSingleImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    let imageUrl;
    
    // Try Cloudinary first, fallback to local
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
      try {
        imageUrl = await uploadToCloudinary(req.file.path);
        // Delete local file after successful Cloudinary upload
        fs.unlinkSync(req.file.path);
      } catch (cloudinaryError) {
        console.warn('Cloudinary upload failed, using local storage:', cloudinaryError.message);
        imageUrl = `/uploads/${req.file.filename}`;
      }
    } else {
      imageUrl = `/uploads/${req.file.filename}`;
    }
    
    res.json({
      message: 'Image uploaded successfully',
      imageUrl
    });
  } catch (error) {
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Image upload failed' });
  }
};

// Upload multiple images
const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    
    const imageUrls = [];
    
    for (const file of req.files) {
      let imageUrl;
      
      // Try Cloudinary first, fallback to local
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
        try {
          imageUrl = await uploadToCloudinary(file.path);
          // Delete local file after successful Cloudinary upload
          fs.unlinkSync(file.path);
        } catch (cloudinaryError) {
          console.warn('Cloudinary upload failed, using local storage:', cloudinaryError.message);
          imageUrl = `/uploads/${file.filename}`;
        }
      } else {
        imageUrl = `/uploads/${file.filename}`;
      }
      
      imageUrls.push(imageUrl);
    }
    
    res.json({
      message: 'Images uploaded successfully',
      imageUrls
    });
  } catch (error) {
    // Clean up files if they exist
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    res.status(500).json({ error: 'Image upload failed' });
  }
};

module.exports = {
  upload,
  uploadToCloudinary,
  uploadBufferToCloudinary,
  uploadSingleImage,
  uploadMultipleImages
};