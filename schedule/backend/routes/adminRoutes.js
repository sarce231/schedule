import express from 'express';
import bcrypt from 'bcryptjs';
import path from 'path';
import multer from 'multer';
import User from '../models/userModel.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { updateUserByAdmin, deleteUser } from '../controllers/adminController.js';

const router = express.Router();

// 📌 Multer Setup (untuk upload file jika diperlukan)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// ✅ Tambah Admin Baru (Superadmin)
router.post('/add-admin', protect, authorize('superadmin'), async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: 'Email sudah terdaftar' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: 'admin',
        });

        await newUser.save();
        res.status(201).json({ message: 'Admin berhasil ditambahkan' });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
});

// ✅ Ambil Semua User Biasa
router.get('/users', protect, authorize('admin', 'superadmin'), async (req, res) => {
    try {
        const users = await User.find({ role: 'user' }).select('name email role');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data user' });
    }
});

// ✅ Ambil Semua Pengguna (semua role)
router.get('/', async (req, res) => {
    try {
        const users = await User.find().select('name email role');
        res.status(200).json(users);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// ✅ Hapus User Berdasarkan ID
router.delete('/users/:id', protect, authorize('admin', 'superadmin'), deleteUser);

// ✅ Update User (Admin bisa edit user)
router.put('/users/:id', protect, authorize('admin', 'superadmin'), updateUserByAdmin);

// ✅ Promosikan User menjadi Admin
router.put('/promote/:id', protect, authorize('admin', 'superadmin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || user.role !== 'user') {
            return res.status(404).json({ message: 'User tidak ditemukan atau bukan user biasa' });
        }

        user.role = 'admin';
        await user.save();
        res.status(200).json({ message: 'User berhasil dipromosikan menjadi admin' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal mempromosikan user' });
    }
});

// ✅ Ambil Semua User + Role
router.get('/all-users', protect, authorize('admin', 'superadmin'), async (req, res) => {
    try {
        const users = await User.find().select('_id name email role');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data semua user' });
    }
});

// ✅ Nonaktifkan User (soft delete)
router.put('/deactivate/:id', protect, authorize('admin', 'superadmin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

        user.isActive = false; // Pastikan field ini ada di model
        await user.save();
        res.status(200).json({ message: 'User dinonaktifkan' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menonaktifkan user' });
    }
});

export default router;
