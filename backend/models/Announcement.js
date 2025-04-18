const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true,
    },
    header: {
      type: String,
      required: true,
    },
    content: {
        type: String,
        required: true,
    },
    color: {
        type: String,
        required: true,
    },
    visible: {
        type: Boolean,
        required: true,
        default: false,
    },
  });
  
  const Announcement = mongoose.model('Announcement', announcementSchema);
  module.exports = Announcement;