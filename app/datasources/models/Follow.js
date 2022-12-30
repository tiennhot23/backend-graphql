const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;

const Follow = new mongoose.Schema({
  follower: { type: ObjectId, required: true },
  followee: { type: ObjectId, required: true, index: true },
}, { timestamps: true });

module.exports = mongoose.model('follows', Follow);
