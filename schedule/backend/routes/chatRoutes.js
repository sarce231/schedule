import express from 'express';
import { getAllChat, sendMessage, deleteMessage } from '../controllers/chatController.js';

const router = express.Router();

// Rute untuk mengambil semua chat
router.get('/', getAllChat);

// Rute untuk mengirim pesan baru
router.post('/send', sendMessage);

// Rute untuk menghapus pesan berdasarkan ID
router.delete('/delete', deleteMessage);

export default router;
