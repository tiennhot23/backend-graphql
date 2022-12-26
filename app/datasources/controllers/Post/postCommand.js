const { PostModel, ClapModel } = require('../../models');
const { GeneralResponse } = require('../../utils/responses');
const { gqlSelectedField } = require('../../utils/helpers');
const { getCachedPostById, cachePost, uncachePost } = require('../../utils/controllers');

async function clapPost({ postId, count }, { authUser }, info) {
  const post = await getCachedPostById(postId);

  const projection = gqlSelectedField.selectTopFields(info);
  await ClapModel.findOneAndUpdate(
    { post: postId, user: authUser._id, postOwner: post.owner },
    { $inc: { count } },
    { new: true, projection, upsert: true },
  ).lean();

  return GeneralResponse();
}

async function createPost({ title, content, status }, { authUser }) {
  const post = await PostModel.create({ owner: authUser._id, title, content, status });

  if (post.status === 'Visible') {
    await cachePost(post, authUser._id);
  }
  return post;
}

async function updatePost({ input }, { authUser }, info) {
  const { _id, title, content, status } = input;
  /**
   * const cachedPost = await getCachedPostById(_id);
   * if (!cachePost) throw new Error('Invalid post');
   * if (cachedPost.owner !== _id) throw new Error('Not owner');
   *
   * NOTE: cause we only cache public post, so update, delete actions
   * cannot use cached post
   */

  const projection = gqlSelectedField.selectTopFields(info);
  const post = await PostModel.findOneAndUpdate(
    { _id, owner: authUser._id, status: { $ne: 'Deleted' } },
    { title, content, status },
    { new: true, projection },
  ).lean();

  if (post && status === 'Visible') {
    await cachePost({
      _id,
      owner: authUser._id,
      title,
    }, authUser._id);
  }

  return post;
}

async function deletePost({ _id }, { authUser }) {
  /**
   * NOTE: cause we only cache public post, so update, delete actions
   * cannot use cached post
   */

  const post = await PostModel.findOneAndUpdate(
    { _id, owner: authUser._id },
    { status: 'Deleted' },
    { projection: 'status' },
  ).lean();

  if (post) {
    await uncachePost(_id, authUser._id);
    return new GeneralResponse(true, 'Post deleted');
  }
  return new GeneralResponse(false, 'Invalid post');
}

async function hidePost({ _id }, { authUser }) {
  const post = await PostModel.findOneAndUpdate(
    { _id, owner: authUser._id, status: { $ne: 'Deleted' } },
    { status: 'Hidden' },
    { projection: 'status' },
  ).lean();

  if (post) {
    await uncachePost(_id, authUser._id);
    return new GeneralResponse(true, 'Post deleted');
  }
  return new GeneralResponse(false, 'Invalid post');
}

module.exports = { createPost, clapPost, updatePost, deletePost, hidePost };
