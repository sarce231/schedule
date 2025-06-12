import { Server } from 'socket.io';
import Chat from '../models/Chat.js'; // Pastikan path-nya benar sesuai struktur proyekmu

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: ['http://localhost:5173', 'http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
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
      socket.emit('error', { message: 'Gagal memuat pesan awal' });
    }

    // Saat user/admin mengirim pesan
    socket.on('sendMessage', async (message, callback) => {
      try {
        // Validasi data
        if (!message.text || !message.userName) {
          throw new Error('Data pesan tidak lengkap');
        }

        if (!message._id) {
          message._id = Date.now().toString();
        }

        const chat = await Chat.findOneAndUpdate(
          { name: 'default' },
          { $push: { messages: message } },
          { new: true, upsert: true, runValidators: true }
        );

        io.emit('newMessage', message);
        callback({ success: true, message: 'Pesan berhasil dikirim' });
      } catch (error) {
        console.error('Gagal menyimpan pesan ke database:', error.message);
        callback({ success: false, error: error.message });
        socket.emit('error', { message: 'Gagal mengirim pesan' });
      }
    });

    // Saat pesan dihapus
    socket.on('deleteMessage', async ({ messageId }, callback) => {
      try {
        const chat = await Chat.findOneAndUpdate(
          { name: 'default' },
          { $pull: { messages: { _id: messageId } } },
          { new: true }
        );

        if (!chat) {
          throw new Error('Chat tidak ditemukan');
        }

        io.emit('deletedMessage', messageId);
        callback({ success: true });
      } catch (err) {
        console.error('Gagal menghapus pesan:', err.message);
        callback({ success: false, error: err.message });
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });

    // Handle error
    socket.on('error', (error) => {
      console.error('Socket error:', error);
      socket.emit('error', { message: 'Terjadi kesalahan pada koneksi' });
    });
  });
};
