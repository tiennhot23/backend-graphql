const _ = require('lodash');
const graphqlFields = require('graphql-fields');
const { ParagraphModel, PostModel, UserModel } = require('../../models');
const { caching: cacheConfig } = require('../../configs/redis');

async function clapPost(parent, { postId, clapCount }, { user }, info) {
  if (!user) throw new AppError(403, 'Please login to continue');
  const projection = Object.keys(graphqlFields(info));
  const post = await PostModel.findOneAndUpdate(
    { _id: postId },
    { $inc: { clapCount }, $addToSet: { claps: user._id } },
    { new: true, projection },
  ).lean();

  return post;
}

// NOTE: draft post no need to cache, choose an redis data structure to cache post with publistTime
async function createPost(parent, { paragraphs }, { user, caching }) {
  if (!user) throw new AppError(403, 'Please login to continue');

  const content = await ParagraphModel.insertMany(paragraphs, {
    lean: true, // skip hydrating and validating
  });
  const title = _.get(content[0], 'text');
  const previewImage = _.get(_.filter(content, para => para.type === 'img')[0], 'text');
  const post = await PostModel.create({ creator: user._id, title, previewImage });

  const cachingCommands = [];
  if (post.visibility === 'public') {
    cachingCommands.push(caching.callType('post', 'set', `post:${post._id}`, post, 'ex', cacheConfig.ttl.post));
    cachingCommands.push(caching.call('lset', 'newfeeds', post._id));
    if ((await caching.call('llen', 'newfeeds')) > 10000) {
      cachingCommands.push(caching.call('rpop', 'newfeeds'));
    }
    // NOTE: maybe duplicate post when the follower's newfeed is too short,
    // so global newfeed must be added to generate follower's newfeed
    const { followers } = await UserModel.findById(user._id, 'followers').lean();
    _.forEach(followers, async follower => {
      cachingCommands.push(caching.call('lset', `user:${follower}:newfeeds`, post._id));
      if ((await caching.call('llen', `user:${follower}:newfeeds`)) > 10000) {
        cachingCommands.push(caching.call('rpop', `user:${follower}:newfeeds`));
      }
    });

    // NOTE: does it need to use await ???
    await Promise.all(cachingCommands);
  }
  return post;
}

module.exports = { createPost, clapPost };
