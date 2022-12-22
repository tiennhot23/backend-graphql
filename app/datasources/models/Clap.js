const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;

const Clap = new mongoose.Schema({
  user: { type: ObjectId, required: true },
  post: { type: ObjectId, required: true },
  postOwner: { type: ObjectId, required: true },
  comment: { type: ObjectId },

  count: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model('claps', Clap);
