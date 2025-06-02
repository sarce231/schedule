import { Server } from 'socket.io';
import Chat from '../models/Chat.js'; // Pastikan path-nya benar sesuai struktur proyekmu

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', async (socket) => {
    console.log('User connected:', socket.id);

    // Kirim pesan awal dari MongoDB
    try {
      const chat = await Chat.findOne({ name: 'default' });
      socket.emit('initialMessages', chat ? chat.messages : []);
    } catch (err) {
      console.error('Gagal mengambil chat awal:', err.message);
      socket.emit('initialMessages', []);
    }

    // Saat user/admin mengirim pesan
    socket.on('sendMessage', async (message) => {
      try {
        // Tambahkan _id untuk memudahkan penghapusan nanti
        // Hanya set _id jika belum ada
if (!message._id) {
  message._id = Date.now().toString();
}


        const chat = await Chat.findOneAndUpdate(
          { name: 'default' },
          { $push: { messages: message } },
          { new: true, upsert: true, runValidators: true }
        );

        io.emit('newMessage', message);
      } catch (error) {
        console.error('Gagal menyimpan pesan ke database:', error.message);
      }
    });

    // Saat pesan dihapus
    socket.on('deleteMessage', async ({ messageId }) => {
      try {
        await Chat.findOneAndUpdate(
          { name: 'default' },
          { $pull: { messages: { _id: messageId } } },
          { new: true }
        );

        io.emit('deletedMessage', messageId);
      } catch (err) {
        console.error('Gagal menghapus pesan:', err.message);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};
