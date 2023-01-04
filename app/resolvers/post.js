const { cacheClapCount, getCachedClapCount } = require('../datasources/utils/controllers');

async function owner(post, args, context, info) {
  try {
    const { owner: ownerId } = post;
    const { loaders } = context;
    const { userLoader } = loaders;
    return userLoader.load(ownerId.toString());
  } catch (error) {
    logger.error('get post\'s owner error', { error: error.stack });
    throw error;
  }
}

async function clapCount(post, args, context, info) {
  try {
    const { _id: postId } = post;
    const { loaders } = context;

    const cachedClapCount = await getCachedClapCount('post', postId);
    if (!cachedClapCount) {
      const { postClapCountLoader } = loaders;
      const postClapCount = await postClapCountLoader.load(postId.toString());
      if (postClapCount > 1000) {
        await cacheClapCount('post', postId, clapCount);
      }
      return postClapCount;
    }
    return cachedClapCount;
  } catch (error) {
    logger.error('get post\'s clap count error', { error: error.stack });
    throw error;
  }
}

module.exports = {
  owner,
  clapCount,
};
