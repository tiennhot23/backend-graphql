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
  cachingCommands.push(cachingStore.zAdd('newsFeed', Date.now(), `${post._id}`));
  if ((await cachingStore.zCard('newsFeed')) > 10000) {
    cachingCommands.push(cachingStore.zPopMinCount('newsFeed', 10));
  }
  // NOTE: maybe duplicate post when the follower's newfeed is too short,
  // and global newfeed must be added to generate follower's newfeed
  // NOTE: linked-list is not good for handle case: user update status from draft to visible
  // and vice versa continually
  // NOTE: hash cannot remove oldest post as good as sorted set

  // TODO handle when the user update post's status to draft/hidden/deleted

  const follows = await FollowModel.find({ followee: post.owner }, 'follower').lean();
  _.forEach(follows, async follow => {
    cachingCommands.push(cachingStore.zAdd(`user:${follow.follower}:newsFeed`, Date.now(), `${post._id}`));
    if ((await cachingStore.zCard(`user:${follow.follower}:newsFeed`)) > 10000) {
      cachingCommands.push(cachingStore.zPopMinCount(`user:${follow.follower}:newsFeed`, 10));
    }
  });

  await Promise.all(cachingCommands);
}

async function uncachePost(postId, ownerId) {
  const cachingCommands = [];

  cachingCommands.push(cachingStore.del(`post:${postId}`));
  cachingCommands.push(cachingStore.hDel('newsFeed', `${postId}`));
  const followers = await FollowModel.find({ followee: ownerId }, 'followers').lean();
  _.forEach(followers, async follower => {
    cachingCommands.push(cachingStore.hDel(`user:${follower}:newsFeed`, `${postId}`));
  });

  await Promise.all(cachingCommands);
}

async function getCommonNewsFeed() {
  const newsFeed = await cachingStore.zRange('newsFeed', 0, -1, { REV: true });
  return newsFeed;
}

module.exports = {
  getCachedPostById,
  cachePost,
  uncachePost,
  getCommonNewsFeed,
};
