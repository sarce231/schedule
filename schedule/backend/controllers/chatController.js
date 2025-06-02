import Chat from '../models/Chat.js';

// Dapatkan dokumen chat default (hanya 1 dokumen)
export const getAllChat = async (req, res) => {
  try {
    let chat = await Chat.findOne({ name: 'default' });
    if (!chat) {
      // Jika belum ada, buat dokumen kosong
      chat = await Chat.create({ name: 'default', messages: [] });
    }
    res.status(200).json(chat);
  } catch (err) {
    console.error("Error fetching chats:", err);
    res.status(500).json({ message: "Gagal mengambil chat: " + err.message });
  }
};

// Kirim pesan baru, simpan ke database
export const sendMessage = async (req, res) => {
  try {
    const { sender, userName, text, _id } = req.body;

    const message = { sender, userName, text, timestamp: new Date().toISOString(), _id };

    const chat = await Chat.findOneAndUpdate(
      { name: 'default' },
      { $push: { messages: message } },
      { new: true, upsert: true }
    );

    res.status(200).json(message); // balas pesan yang baru disimpan
  } catch (err) {
    console.error("Error saving message:", err);
    res.status(500).json({ message: "Error sending message" });
  }
};

// Hapus pesan berdasarkan _id
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.body;

    const chat = await Chat.findOneAndUpdate(
      { name: 'default' },
      { $pull: { messages: { _id: messageId } } },
      { new: true }
    );

    if (!chat) return res.status(404).json({ message: "Chat tidak ditemukan" });

    res.status(200).json(chat.messages);
  } catch (err) {
    console.error("Error deleting message:", err);
    res.status(500).json({ message: "Error deleting message" });
  }
};
