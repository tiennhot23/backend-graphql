const { default: mongoose } = require('mongoose');
const { ClapModel } = require('../../models');
const { GeneralResponse } = require('../../utils/responses');
const { getCachedPostById } = require('../../utils/controllers');

async function clapPost({ postId, count = 1 }, { authUser }) {
  const post = await getCachedPostById(postId);

  const clap = await ClapModel.findOneAndUpdate(
    { post: mongoose.Types.ObjectId(postId), user: authUser._id, postOwner: post.owner },
    { $inc: { count: (count < 0 ? Math.min('$count' || 0, count) : count) } },
    { new: true, projection: 'count', upsert: true },
  ).lean();

  if (!clap) {
    return new GeneralResponse(false, 'Cannot clap');
  }
  return new GeneralResponse(true, 'Clapped');
}

async function unclapPost({ postId }, { authUser }) {
  const post = await getCachedPostById(postId);

  const clap = await ClapModel.findOneAndDelete(
    { post: mongoose.Types.ObjectId(postId), user: authUser._id, postOwner: post.owner },
  ).lean();

  if (!clap) {
    return new GeneralResponse(false, 'Cannot unclap');
  }
  return new GeneralResponse(true, 'Unclapped');
}

async function clapComment({ commentId, count = 1 }, { authUser }) {
  const clap = await ClapModel.findOneAndUpdate(
    { comment: mongoose.Types.ObjectId(commentId), user: authUser._id },
    { $inc: { count: (count < 0 ? Math.min('$count' || 0, count) : count) } },
    { new: true, projection: 'count', upsert: true },
  ).lean();

  if (!clap) {
    return new GeneralResponse(false, 'Cannot clap');
  }
  return new GeneralResponse(true, 'Clapped');
}

async function unclapComment({ commentId }, { authUser }) {
  const clap = await ClapModel.findOneAndDelete(
    { comment: mongoose.Types.ObjectId(commentId), user: authUser._id },
  ).lean();

  if (!clap) {
    return new GeneralResponse(false, 'Cannot unclap');
  }
  return new GeneralResponse(true, 'Unclapped');
}

module.exports = { clapPost, unclapPost, clapComment, unclapComment };
