const { CommentModel, PostModel } = require('../../models');
const { gqlSelectedField } = require('../../utils/helpers');

async function createComment(args, context, info) {
  try {
    const { input } = args;
    const { signature } = context;
    const { postId, title, content } = input;
    const { _id: userId } = signature;

    const postDocCount = await PostModel.count({ _id: postId, status: 'Visible' });
    if (postDocCount === 0) throw new Error('Invalid post');
    const comment = await CommentModel.create({
      post: postId,
      user: userId,
      title,
      content,
    });

    return comment;
  } catch (error) {
    logger.error('create comment error', { error: error.stack });
    throw error;
  }
}

async function updateComment(args, context, info) {
  try {
    const { input } = args;
    const { signature } = context;
    const { _id: userId } = signature;
    const { commentId, title, content } = input;

    const projection = gqlSelectedField.selectTopFields(info);
    const comment = await CommentModel.findOneAndUpdate(
      { _id: commentId, user: userId },
      { title, content },
      { new: true },
    ).select(projection).lean();

    return comment;
  } catch (error) {
    logger.error('update comment error', { error: error.stack });
    throw error;
  }
}

async function deleteComment(args, context, info) {
  try {
    const { _id: commentId } = args;
    const { signature } = context;
    const { _id: userId } = signature;

    // NOTE - not delete replies of replies
    const result = await CommentModel.deleteMany({
      $or: [
        { _id: commentId, user: userId },
        { parent: commentId },
      ],
    });

    if (result.deletedCount === 0) {
      return {
        isSuccess: false,
        message: 'Invalid comment',
      };
    }
    return {
      isSuccess: true,
      message: 'Delete comment successfully',
    };
  } catch (error) {
    logger.error('delete comment error', { error: error.stack });
    throw error;
  }
}

async function replyComment(args, context, info) {
  try {
    const { input } = args;
    const { signature } = context;
    const { _id: userId } = signature;
    const { commentId: parentCommentId, title, content } = input;

    const parentComment = await CommentModel.findById(parentCommentId, 'post').lean();
    if (!parentComment) {
      throw new Error('Invalid parent comment');
    }
    const comment = await CommentModel.create({
      post: parentComment.post,
      user: userId,
      parent: parentCommentId,
      title,
      content,
    });

    return comment;
  } catch (error) {
    logger.error('reply comment error', { error: error.stack });
    throw error;
  }
}

module.exports = { createComment, updateComment, deleteComment, replyComment };
