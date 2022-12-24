const _ = require('lodash');
const { PostModel, FollowModel } = require('../../models');
const { cachingStore } = require('../redis/stores');

async function getCachedPostById(postId) {
  const cachedPost = await cachingStore.get(`post:${postId}`);
  if (!cachedPost) {
    const post = await PostModel.findById(postId, '_id title owner').lean();
    if (!post) {
      return null;
    }
    await cachingStore.set(`post:${postId}`, JSON.stringify(post));
    return post;
  }
  return cachedPost;
}

async function cachePost(post, ownerId) {
  const cachingCommands = [];
  await cachingStore.set(post._id, JSON.stringify(_.pick(post, '_id title owner')));

  cachingCommands.push(cachingStore.set(`post:${post._id}`, JSON.stringify(_.pick(post, '_id title owner'))));
  cachingCommands.push(cachingStore.lSet('newfeeds', post._id));
  if ((await cachingStore.lLen('newfeeds')) > 10000) {
    cachingCommands.push(cachingStore.rPop('newfeeds'));
  }
  // TODO - can followers be fetched from cached ?
  // NOTE: maybe duplicate post when the follower's newfeed is too short,
  // so global newfeed must be added to generate follower's newfeed
  const followers = await FollowModel.find({ followee: ownerId }, 'followers').lean();
  _.forEach(followers, async follower => {
    cachingCommands.push(cachingStore.lSet(`user:${follower}:newfeeds`, post._id));
    if ((await cachingStore.lLen(`user:${follower}:newfeeds`)) > 10000) {
      cachingCommands.push(cachingStore.rPop(`user:${follower}:newfeeds`));
    }
  });

  await Promise.all(cachingCommands);
}

module.exports = {
  getCachedPostById,
  cachePost,
};
