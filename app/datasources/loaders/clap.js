const _ = require('lodash');
const { default: mongoose } = require('mongoose');
const { ClapModel } = require('../models');

const batchClapCountOfPost = async postIds => {
  const posts = await ClapModel.aggregate([
    { $match: { post: { $in: postIds.map(postId => mongoose.Types.ObjectId(postId)) } } },
    { $group: { _id: '$post', clapCount: { $sum: '$count' } } },
    { $project: { _id: 1, clapCount: 1 } },
  ]);
  const mapPost = _.reduce(posts, (result, post) => {
    result[post._id] = post.clapCount;
    return result;
  }, {});
  return postIds.map(postId => (mapPost[postId] || 0));
};

const batchClapCountOfComment = async commentIds => {
  const comments = await ClapModel.aggregate([
    { $match: { comment: { $in: commentIds.map(commentId => mongoose.Types.ObjectId(commentId)) } } },
    { $group: { _id: '$comment', clapCount: { $sum: '$count' } } },
    { $project: { _id: 1, clapCount: 1 } },
  ]);
  const mapComment = _.reduce(comments, (result, comment) => {
    result[comment._id] = comment.clapCount;
    return result;
  }, {});
  return commentIds.map(commentId => (mapComment[commentId] || 0));
};

module.exports = {
  batchClapCountOfPost,
  batchClapCountOfComment,
};
