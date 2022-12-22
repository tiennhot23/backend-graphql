const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  owner: { type: ObjectId, required: true },

  status: { type: String, enum: ['Draft', 'Visible', 'Hidden', 'Deleted'] },
}, { timestamps: true });

module.exports = mongoose.model('Posts', postSchema);
