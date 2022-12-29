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

async function cachePost(post) {
  const cachingCommands = [];

  cachingCommands.push(cachingStore.set(`post:${post._id}`, JSON.stringify(_.pick(post, ['_id', 'title', 'owner']))));
  cachingCommands.push(cachingStore.hSet('newfeeds', `${post._id}`, Date.now()));
  if ((await cachingStore.hLen('newfeeds')) > 10000) {
    cachingCommands.push(cachingStore.hDel('newfeeds', `${post._id}`));
  }
  // TODO - can followers be fetched from cached ?
  // NOTE: maybe duplicate post when the follower's newfeed is too short,
  // so global newfeed must be added to generate follower's newfeed
  const follows = await FollowModel.find({ followee: post.owner }, 'follower').lean();
  _.forEach(follows, async follow => {
    cachingCommands.push(cachingStore.hSet(`user:${follow.follower}:newfeeds`, `${post._id}`, Date.now()));
    if ((await cachingStore.hLen(`user:${follow.follower}:newfeeds`)) > 10000) {
      cachingCommands.push(cachingStore.hDel(`user:${follow.follower}:newfeeds`, `${post._id}`));
    }
  });

  await Promise.all(cachingCommands);
}

async function uncachePost(postId, ownerId) {
  const cachingCommands = [];

  cachingCommands.push(cachingStore.del(`post:${postId}`));
  cachingCommands.push(cachingStore.hDel('newfeeds', `${postId}`));
  const followers = await FollowModel.find({ followee: ownerId }, 'followers').lean();
  _.forEach(followers, async follower => {
    cachingCommands.push(cachingStore.hDel(`user:${follower}:newfeeds`, `${postId}`));
  });

  await Promise.all(cachingCommands);
}

module.exports = {
  getCachedPostById,
  cachePost,
  uncachePost,
};
