import mongoose from 'mongoose';

// Definisikan schema untuk Schedule
const scheduleSchema = new mongoose.Schema({
  place: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  day: {
    type: String,
    required: true,
  },
  wl: {
    type: String,
    required: true,
  },
  gamesLeader: {
    type: String,
    required: true,
  },
  preacher: { // field tambahan untuk pelayan firman
    type: String,
    required: true,
  },
});

// Membuat model berdasarkan schema
const Schedule = mongoose.model('Schedule', scheduleSchema);

export default Schedule;
