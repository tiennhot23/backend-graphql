const _ = require('lodash');
const { PostModel } = require('../models');

const batchPosts = async postIds => {
  const posts = await PostModel.find({ _id: { $in: postIds } }).lean();
  const mapPost = _.reduce(posts, (result, user) => {
    result[user._id] = user;
    return result;
  }, {});
  return postIds.map(postId => (mapPost[postId] || null));
};

module.exports = {
  batchPosts,
};
