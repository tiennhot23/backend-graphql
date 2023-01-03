const { CommentModel } = require('../../models');
const { gqlSelectedField } = require('../../utils/helpers');
const {
  getCachedClapCount,
  cacheClapCount,
} = require('../../utils/controllers');

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

async function getUserOfComment(parent, args, context, info) {
  try {
    const { user: userId } = parent;
    const { loaders } = context;
    const { userLoader } = loaders;
    return userLoader.load(userId.toString());
  } catch (error) {
    logger.error('get comment\'s user error', { error: error.stack });
    throw error;
  }
}

async function getPostOfComment(parent, args, context, info) {
  try {
    const { post: postId } = parent;
    const { loaders } = context;
    const { postLoader } = loaders;
    return postLoader.load(postId.toString());
  } catch (error) {
    logger.error('get comment\'s post error', { error: error.stack });
    throw error;
  }
}

async function getCommentClapCount(parent, args, context, info) {
  try {
    const { _id: commentId } = parent;
    const { loaders } = context;

    // TODO nen biet khi nao reset cache (case: trong vong 1 phut clapcount tang len 1tr)
    const cachedClapCount = await getCachedClapCount('comment', commentId);
    if (!cachedClapCount) {
      const { commentClapCountLoader } = loaders;
      // use await
      return (commentClapCountLoader.load(commentId.toString())).then(async clapCount => {
        if (clapCount > 1000) {
          await cacheClapCount('comment', commentId, clapCount);
        }
        return clapCount;
      });
    }
    return cachedClapCount;
  } catch (error) {
    logger.error('get comment\'s clap count error', { error: error.stack });
    throw error;
  }
}

module.exports = {
  getPostComments,
  getCommentReplies,
  getUserOfComment,
  getPostOfComment,
  getCommentClapCount,
};
