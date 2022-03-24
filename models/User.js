const mongoose = require('mongoose');

const UserScehma = new mongoose.Schema({
   name: {
      type: String,
      required: true,
   },
   email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: true,
   },
   password: {
      type: String,
      required: true,
   },
   avatar: {
      type: String,
   },
   date: {
      type: Date,
      default: Date.now
   }
});

module.exports = User = mongoose.model('user', UserScehma);