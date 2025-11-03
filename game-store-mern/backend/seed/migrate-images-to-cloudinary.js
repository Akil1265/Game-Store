require('dotenv').config();

const axios = require('axios');
const fs = require('fs/promises');
const path = require('path');
const mongoose = require('mongoose');

const Game = require('../src/models/Game');
const { uploadBufferToCloudinary } = require('../src/utils/imageUpload');

const uploadsDir = path.join(__dirname, '../uploads');

const isCloudinaryUrl = url => typeof url === 'string' && url.includes('res.cloudinary.com');
const isLocalUrl = url => typeof url === 'string' && url.startsWith('/uploads/');

const fetchRemoteBuffer = async url => {
  const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 });
  return Buffer.from(response.data);
};

const readLocalBuffer = async url => {
  const filePath = path.join(uploadsDir, url.replace('/uploads/', ''));
  return fs.readFile(filePath);
};

const uploadSourceToCloudinary = async (sourceUrl, meta) => {
  if (!sourceUrl) {
    return null;
  }

  if (isCloudinaryUrl(sourceUrl)) {
    return sourceUrl;
  }

  let buffer;
  try {
    buffer = isLocalUrl(sourceUrl)
      ? await readLocalBuffer(sourceUrl)
      : await fetchRemoteBuffer(sourceUrl);
  } catch (error) {
    console.warn(`Failed to fetch ${meta.field} image for ${meta.slug}: ${error.message}`);
    return sourceUrl;
  }

  try {
    const publicId = `${meta.slug}/${meta.field}-${meta.index}-${Date.now()}`;
    return await uploadBufferToCloudinary(buffer, { public_id: publicId });
  } catch (error) {
    console.warn(`Cloudinary upload failed for ${meta.slug} (${meta.field}): ${error.message}`);
    return sourceUrl;
  }
};

const migrateField = async (game, fieldName) => {
  const currentValue = game[fieldName];

  if (!currentValue) {
    return false;
  }

  if (Array.isArray(currentValue)) {
    let updated = false;
    const nextValues = [];

    for (let index = 0; index < currentValue.length; index += 1) {
      const originalUrl = currentValue[index];
      const migratedUrl = await uploadSourceToCloudinary(originalUrl, {
        slug: game.slug,
        field: fieldName,
        index
      });
      if (migratedUrl !== originalUrl) {
        updated = true;
      }
      nextValues.push(migratedUrl);
    }

    if (updated) {
      game[fieldName] = nextValues;
      return true;
    }

    return false;
  }

  const migratedUrl = await uploadSourceToCloudinary(currentValue, {
    slug: game.slug,
    field: fieldName,
    index: 0
  });

  if (migratedUrl !== currentValue) {
    game[fieldName] = migratedUrl;
    return true;
  }

  return false;
};

(async () => {
  try {
    const { MONGO_URI, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

    if (!MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment');
    }

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary environment variables are missing');
    }

    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

  const games = await Game.find({});
    console.log(`Found ${games.length} games to inspect`);

    let updatedCount = 0;

    for (const game of games) {
      const fields = ['coverImage', 'images', 'screenshots'];
      let gameChanged = false;

      for (const field of fields) {
        const changed = await migrateField(game, field);
        if (changed) {
          gameChanged = true;
        }
      }

      if (gameChanged) {
        await game.save();
        updatedCount += 1;
        console.log(`Updated ${game.title}`);
      }
    }

    console.log(`Migration complete. Updated ${updatedCount} of ${games.length} games.`);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
})();
