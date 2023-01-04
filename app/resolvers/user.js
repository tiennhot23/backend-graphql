async function followerCount(user, args, context, info) {
  try {
    const { _id: userId } = user;
    const { loaders } = context;
    const { followCountLoader } = loaders;

    return followCountLoader.load(userId.toString());
  } catch (error) {
    logger.error('get follower count error', { error: error.stack });
    throw error;
  }
}

async function followers(user, args, context, info) {
  try {
    const { _id: userId } = user;
    const { loaders } = context;
    const { followerLoader, userLoader } = loaders;

    const userFollowers = followerLoader.load(userId.toString());
    return userLoader.loadMany(userFollowers.map(follower => follower.toString()));
  } catch (error) {
    logger.error('get follower count error', { error: error.stack });
    throw error;
  }
}

module.exports = {
  followerCount,
  followers,
};
