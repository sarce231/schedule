import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: false,
  },
  link: { 
    type: String, 
    required: false,
  },
  // Tambahkan category:
  category: {
    type: String,
    enum: ['ibadah', 'dokumentasi'],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Media = mongoose.model('Media', mediaSchema);

export default Media;
