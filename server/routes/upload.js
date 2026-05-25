import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { authenticate } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const folder = req.query.folder || 'avatars';
    return {
      folder: `event-organizer/${folder}`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      public_id: `${req.user._id}-${Date.now()}`,
      resource_type: 'auto'
    };
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Generic upload endpoint
router.post('/', authenticate, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const folder = req.query.folder || 'avatars';
    
    console.log('✅ File uploaded to Cloudinary:', req.file.path);
    
    res.json({
      success: true,
      url: req.file.path, // Cloudinary URL
      filename: req.file.filename,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Avatar upload endpoint
router.post('/avatar', authenticate, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const avatarUrl = req.file.path; // Cloudinary URL
    
    // Update user in database
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Delete old avatar from Cloudinary if exists
    if (user.avatar && user.avatar.includes('cloudinary.com')) {
      try {
        const publicId = user.avatar.split('/').slice(-2).join('/').split('.')[0];
        await cloudinary.uploader.destroy(`event-organizer/avatars/${publicId}`);
      } catch (err) {
        console.log('Could not delete old avatar:', err.message);
      }
    }
    
    user.avatar = avatarUrl;
    await user.save();

    console.log('✅ Avatar uploaded to Cloudinary:', avatarUrl);

    res.json({
      success: true,
      avatar: avatarUrl,
      message: 'Avatar uploaded successfully'
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete avatar
router.delete('/avatar', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user && user.avatar && user.avatar.includes('cloudinary.com')) {
      try {
        const publicId = user.avatar.split('/').slice(-2).join('/').split('.')[0];
        await cloudinary.uploader.destroy(`event-organizer/avatars/${publicId}`);
      } catch (err) {
        console.log('Could not delete avatar:', err.message);
      }
      user.avatar = null;
      await user.save();
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Delete avatar error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
