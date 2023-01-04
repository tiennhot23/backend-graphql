const { PostModel } = require('../../models');
const { getCommonNewsFeed } = require('../../utils/controllers');
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
    const post = await PostModel.findOne(filter).select(projection).lean();

    return post;
  } catch (error) {
    logger.error('get post error', { error: error.stack });
    throw error;
  }
}

async function getPosts(args, context, info) {
  try {
    const { input } = args;
    const { owner, title, limit = 10, offset = 0 } = input;

    const projection = gqlSelectedField.selectTopFields(info);
    const filter = {
      title: new RegExp(title, 'i'),
      status: 'Visible',
    };
    if (owner) filter.owner = owner;
    // TODO use last id to pagination
    const posts = await PostModel.find(filter).select(projection)
      .skip(offset).limit(limit)
      .lean();
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
    ).select(projection).lean();
    return posts;
  } catch (error) {
    logger.error('get posts error', { error: error.stack });
    throw error;
  }
}

module.exports = { getPost, getPosts, getNewsFeed };
