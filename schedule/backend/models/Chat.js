import mongoose from 'mongoose';

// Definisikan schema pesan
const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['user', 'admin'],
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  userName: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  _id: {
    type: String,
    required: true
  }
}, { _id: false });

// Definisikan schema chat
const chatSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  messages: [messageSchema] // Array of chat messages
}, { timestamps: true });

// Memastikan model tidak ter-overwrite
const Chat = mongoose.models.Chat || mongoose.model('Chat', chatSchema);

export default Chat;
