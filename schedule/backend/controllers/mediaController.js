import Media from '../models/Media.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Setup __dirname untuk ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Upload media (file atau link) dengan kategori
export const uploadMedia = async (req, res) => {
  try {
    const { name, type, link, category } = req.body;

    if (!name || !type || !category) {
      return res.status(400).json({ message: 'Nama, tipe, dan kategori media wajib diisi.' });
    }

    // Validasi kategori sesuai enum di model
    const validCategories = ['ibadah', 'dokumentasi'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Kategori tidak valid.' });
    }

    let fileUrl = null;

    if (req.file) {
      const file = req.file;
      const allowedTypes = [
        'image/png', 'image/jpeg', 'image/jpg', 'application/pdf',
        'video/mp4', 'video/mpeg', 'video/quicktime',
        'audio/mpeg', 'audio/wav', 'audio/ogg'
      ];

      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({ message: 'Tipe file tidak valid.' });
      }

      // Buat URL untuk diakses dari frontend (http://host/uploads/filename)
      fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
    }

    if (!fileUrl && !link) {
      return res.status(400).json({ message: 'Harus menyertakan file atau link.' });
    }

    const newMedia = new Media({
      name,
      type,
      category,
      url: fileUrl || null,
      link: link || null,
      isRead: false,
    });

    const savedMedia = await newMedia.save();
    res.status(201).json(savedMedia);
  } catch (err) {
    console.error('Gagal mengunggah media:', err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server saat mengunggah media.' });
  }
};

// Hapus media
export const deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const media = await Media.findById(id);

    if (!media) {
      return res.status(404).json({ message: 'Media tidak ditemukan.' });
    }

    if (media.url) {
      // Hapus file fisik dari folder uploads jika ada
      const filePath = path.join(__dirname, '..', 'uploads', path.basename(media.url));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Media.findByIdAndDelete(id);
    res.status(200).json({ message: 'Media berhasil dihapus.' });
  } catch (err) {
    console.error('Gagal menghapus media:', err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server saat menghapus media.' });
  }
};

// Ambil semua media (tambahkan jika belum ada)
export const getAllMedia = async (req, res) => {
  try {
    const mediaList = await Media.find().sort({ createdAt: -1 });
    res.status(200).json(mediaList);
  } catch (err) {
    console.error('Gagal mengambil media:', err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server saat mengambil media.' });
  }
};
