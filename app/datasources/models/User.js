const mongoose = require('mongoose');

const { Schema } = mongoose;

const UserSchema = new Schema({
  firstName: String,
  lastName: String,
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  role: { type: String, enum: ['User', 'Admin'], default: 'User' },

  photo: { type: String },
  bio: { type: String },
  status: { type: String, enum: ['Active', 'Deactivated'] },
}, { timestamps: true });

module.exports = mongoose.model('user', UserSchema);
