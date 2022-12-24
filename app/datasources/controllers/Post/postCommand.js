const { PostModel, ClapModel } = require('../../models');
const { GeneralResponse } = require('../../utils/responses');
const { gqlSelectedField } = require('../../utils/helpers');
const { getCachedPostById, cachePost } = require('../../utils/controllers');

async function clapPost({ postId, count }, { user }, info) {
  const post = await getCachedPostById(postId);

  const projection = gqlSelectedField.selectTopFields(info);
  await ClapModel.findOneAndUpdate(
    { post: postId, user: user._id, postOwner: post.owner },
    { $inc: { count } },
    { new: true, projection, upsert: true },
  ).lean();

  return GeneralResponse();
}

async function createPost({ title, content, status }, { user }) {
  const post = await PostModel.create({ owner: user._id, title, content, status });

  if (post.status === 'Visible') {
    cachePost(post, user._id);
  }
  return post;
}

module.exports = { createPost, clapPost };
