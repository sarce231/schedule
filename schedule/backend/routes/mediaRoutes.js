import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  uploadMedia,
  getAllMedia,
  deleteMedia
} from '../controllers/mediaController.js';
import Media from '../models/Media.js';

const router = express.Router();

// Handle __dirname di ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Konfigurasi multer untuk upload file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // Maks 100MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/png', 'image/jpeg', 'image/jpg', 'application/pdf',
      'video/mp4', 'video/mpeg', 'video/quicktime',
      'audio/mpeg', 'audio/wav', 'audio/ogg'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// 1) Hitung media yang belum dibaca
router.get('/unread-count', async (req, res) => {
  try {
    const count = await Media.countDocuments({ isRead: false });
    res.json({ count });
  } catch (err) {
    console.error('Error counting unread media:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 2) Tandai semua media sebagai sudah dibaca
router.patch('/mark-read-all', async (req, res) => {
  try {
    await Media.updateMany({ isRead: false }, { isRead: true });
    res.sendStatus(204);
  } catch (err) {
    console.error('Error marking all media as read:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 3) Rute utama: upload, ambil, dan hapus media
router.post('/', upload.single('media'), uploadMedia);
router.get('/', getAllMedia);
router.delete('/:id', deleteMedia);

export default router;
