const { getCachedClapCount, cacheClapCount } = require('../datasources/utils/controllers');

async function user(comment, args, context, info) {
  try {
    const { user: userId } = comment;
    const { loaders } = context;
    const { userLoader } = loaders;
    return userLoader.load(userId.toString());
  } catch (error) {
    logger.error('get comment\'s user error', { error: error.stack });
    throw error;
  }
}

async function post(comment, args, context, info) {
  try {
    const { post: postId } = comment;
    const { loaders } = context;
    const { postLoader } = loaders;
    return postLoader.load(postId.toString());
  } catch (error) {
    logger.error('get comment\'s post error', { error: error.stack });
    throw error;
  }
}

async function clapCount(comment, args, context, info) {
  try {
    const { _id: commentId } = comment;
    const { loaders } = context;

    // TODO nen biet khi nao reset cache (case: trong vong 1 phut clapcount tang len 1tr)
    const cachedClapCount = await getCachedClapCount('comment', commentId);
    if (!cachedClapCount) {
      const { commentClapCountLoader } = loaders;
      const commentClapCount = await commentClapCountLoader.load(commentId.toString());
      if (clapCount > 1000) {
        await cacheClapCount('comment', commentId, clapCount);
      }
      return commentClapCount;
    }
    return cachedClapCount;
  } catch (error) {
    logger.error('get comment\'s clap count error', { error: error.stack });
    throw error;
  }
}

module.exports = {
  user,
  post,
  clapCount,
};
