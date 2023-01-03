const { PostModel } = require('../../models');
const { gqlSelectedField } = require('../../utils/helpers');
const { cachePost, uncachePost } = require('../../utils/controllers');

async function createPost(args, context, info) {
  try {
    const { title, content, status } = args;
    const { signature } = context;
    const { _id: ownerId } = signature;
    const post = await PostModel.create({
      owner: ownerId,
      title,
      content,
      status,
    });

    if (post.status === 'Visible') {
      await cachePost(post, ownerId);
    }
    return post;
  } catch (error) {
    logger.error('create post error', { error: error.stack });
    throw error;
  }
}

async function updatePost(args, context, info) {
  try {
    const { input } = args;
    const { signature } = context;
    const { _id: postId, title, content, status } = input;
    const { _id: ownerId } = signature;
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
      { _id: postId, owner: ownerId, status: { $ne: 'Deleted' } },
      { title, content, status },
      { new: true },
    ).select(projection).lean();

    if (post && status === 'Visible') {
      await cachePost({
        _id: postId,
        owner: ownerId,
        title,
      });
    }

    return post;
  } catch (error) {
    logger.error('update post error', { error: error.stack });
    throw error;
  }
}

async function deletePost(args, context, info) {
  try {
    const { _id: postId } = args;
    const { signature } = context;
    const { _id: ownerId } = signature;
    const result = await PostModel.updateOne(
      { _id: postId, owner: ownerId },
      { status: 'Deleted' },
    ).lean();

    if (result.modifiedCount === 0) {
      return {
        isSuccess: false,
        message: 'Invalid post',
      };
    }

    await uncachePost(postId, ownerId);
    return {
      isSuccess: true,
      message: 'Delete post successfully',
    };
  } catch (error) {
    logger.error('delete post error', { error: error.stack });
    throw error;
  }
}

async function hidePost(args, context, info) {
  try {
    const { _id: postId } = args;
    const { signature } = context;
    const { _id: ownerId } = signature;
    const result = await PostModel.updateOne(
      { _id: postId, owner: ownerId, status: { $ne: 'Deleted' } },
      { status: 'Hidden' },
    ).lean();

    if (result.modifiedCount === 0) {
      return {
        isSuccess: false,
        message: 'Invalid post',
      };
    }

    await uncachePost(postId, ownerId);
    return {
      isSuccess: true,
      message: 'Hide post successfully',
    };
  } catch (error) {
    logger.error('hide post error', { error: error.stack });
    throw error;
  }
}

module.exports = { createPost, updatePost, deletePost, hidePost };
