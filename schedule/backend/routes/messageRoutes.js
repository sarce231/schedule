import express from "express";
import Message from "../models/Message.js";

const router = express.Router();

// POST simpan pesan dari form Home (bisa dari user belum terdaftar)
router.post("/messages", async (req, res) => {
  try {
    const { nama, email, pesan } = req.body;

    // Validasi sederhana di backend (optional tapi direkomendasikan)
    if (!nama || !email || !pesan) {
      return res.status(400).json({ message: "Nama, email, dan pesan wajib diisi" });
    }

    const newMessage = new Message({ nama, email, pesan });
    await newMessage.save();

    res.status(201).json({ message: "Pesan berhasil dikirim" });
  } catch (error) {
    console.error('Error saving message:', error);  // Penting untuk debugging
    res.status(500).json({ message: "Gagal menyimpan pesan" });
  }
});

// GET ambil semua pesan untuk admin
router.get("/messages", async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ message: "Gagal mengambil data pesan" });
  }
});

export default router;
