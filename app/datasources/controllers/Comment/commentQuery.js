const { CommentModel } = require('../../models');
const { gqlSelectedField } = require('../../utils/helpers');

async function getPostComments(args, context, info) {
  try {
    const { input } = args;
    const { postId, limit = 10, offset = 0 } = input;
    const projection = gqlSelectedField.selectTopFields(info);
    const comments = await CommentModel.find(
      { post: postId, parent: null },
    ).select(projection).skip(offset).limit(limit)
      .lean();

    return comments;
  } catch (error) {
    logger.error('get post\'s comment error', { error: error.stack });
    throw error;
  }
}

async function getCommentReplies(args, context, info) {
  try {
    const { input } = args;
    const { commentId, limit = 10, offset = 0 } = input;
    const projection = gqlSelectedField.selectTopFields(info);
    const comments = await CommentModel.find(
      { parent: commentId },
    ).select(projection).skip(offset).limit(limit)
      .lean();

    return comments;
  } catch (error) {
    logger.error('get comment\'s replies error', { error: error.stack });
    throw error;
  }
}

module.exports = {
  getPostComments,
  getCommentReplies,
};
