const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    default: 'unread',  // Status bisa 'unread' atau 'read'
  }
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
