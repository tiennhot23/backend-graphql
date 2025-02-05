const mongoose = require('mongoose');

const { Schema } = mongoose;

const UserSchema = new Schema({
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['User', 'Admin'], default: 'User' },

  photo: { type: String },
  bio: { type: String },
  status: { type: String, default: 'Active', enum: ['Active', 'Deactivated'] },
}, { timestamps: true });

module.exports = mongoose.model('users', UserSchema);
