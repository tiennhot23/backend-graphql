const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;

const Comment = new mongoose.Schema({
  title: { type: String },
  content: { type: String, required: true },

  user: { type: ObjectId, required: true },
  post: { type: ObjectId, required: true },
  parent: { type: ObjectId },
}, { timestamps: true });

module.exports = mongoose.model('comments', Comment);
