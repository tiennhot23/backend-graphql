const _ = require('lodash');
const { UserModel } = require('../../models');
const { authenticateStore, cachingStore } = require('../redis/stores');

async function getCachedUserById(userId) {
  const cachedUser = await cachingStore.get(`user:${userId}`);
  if (!cachedUser) {
    const user = await UserModel.findById(userId, '_id firstName lastName username photo').lean();
    if (!user) {
      return null;
    }
    await cachingStore.set(`user:${userId}`, JSON.stringify(user));
    return user;
  }
  return cachedUser;
}

async function cacheUser(user) {
  await cachingStore.set(`user:${user._id}`, JSON.stringify(_.pick(user, '_id firstName lastName username photo')));
}

async function saveAccessToken(userId, deviceId, accessToken) {
  await authenticateStore.hSet('hset', `user:${userId}:tokens`, deviceId, accessToken);
}

async function removeAccessToken(userId, deviceId) {
  await authenticateStore.hDel(`user:${userId}:tokens`, deviceId);
}

module.exports = {
  getCachedUserById,
  cacheUser,
  saveAccessToken,
  removeAccessToken,
};
