const { PostModel } = require('../../models');
const {
  getCachedClapCount,
  cacheClapCount,
  getCommonNewsFeed,
} = require('../../utils/controllers');
const { gqlSelectedField } = require('../../utils/helpers');

async function getPost(args, context, info) {
  try {
    const { _id: postId } = args;
    const { signature } = context;

    const projection = gqlSelectedField.selectTopFields(info);
    const filter = {
      _id: postId,
    };

    if (!signature) filter.status = 'Visible';
    const post = await PostModel.findOne(filter, projection).lean();

    return post;
  } catch (error) {
    logger.error('get post error', { error: error.stack });
    throw error;
  }
}

async function getPosts(args, context, info) {
  try {
    const { input } = args;
    const { owner, title, limit, offset } = input;

    const projection = gqlSelectedField.selectTopFields(info);
    const filter = {
      title: new RegExp(title, 'i'),
      status: 'Visible',
    };
    if (owner) filter.owner = owner;
    const posts = await PostModel.find(filter, projection).skip(offset).limit(limit).lean();
    return posts;
  } catch (error) {
    logger.error('get posts error', { error: error.stack });
    throw error;
  }
}

async function getNewsFeed(args, context, info) {
  try {
    const projection = gqlSelectedField.selectTopFields(info);
    const newsFeed = await getCommonNewsFeed();
    const posts = await PostModel.find(
      { _id: { $in: newsFeed } },
      projection,
    ).lean();
    return posts;
  } catch (error) {
    logger.error('get posts error', { error: error.stack });
    throw error;
  }
}

async function getPostClapCount(parent, args, context, info) {
  try {
    const { _id: postId } = parent;
    const { loaders } = context;

    const cachedClapCount = await getCachedClapCount('post', postId);
    if (!cachedClapCount) {
      const { postClapCountLoader } = loaders;
      return (postClapCountLoader.load(postId.toString())).then(async clapCount => {
        if (clapCount > 1000) {
          await cacheClapCount('post', postId, clapCount);
        }
        return clapCount;
      });
    }
    return cachedClapCount;
  } catch (error) {
    logger.error('get post\'s clap count error', { error: error.stack });
    throw error;
  }
}

async function getPostOwner(parent, args, context, info) {
  try {
    const { owner: ownerId } = parent;
    const { loaders } = context;
    const { userLoader } = loaders;
    return userLoader.load(ownerId.toString());
  } catch (error) {
    logger.error('get post\'s owner error', { error: error.stack });
    throw error;
  }
}

module.exports = { getPost, getPosts, getPostClapCount, getPostOwner };
