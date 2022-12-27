const _ = require('lodash');
const { UserModel } = require('../../models');
const { authenticateStore, cachingStore } = require('../redis/stores');

async function getCachedUserById(userId) {
  const cachedUser = await cachingStore.get(`user:${userId}`);
  if (!cachedUser) {
    const user = await UserModel.findById(userId, '_id status role').lean();
    if (!user) {
      return null;
    }
    await cachingStore.set(`user:${userId}`, JSON.stringify(user));
    return user;
  }
  return JSON.parse(cachedUser);
}

async function cacheUser(user) {
  await cachingStore.set(`user:${user._id}`, JSON.stringify(_.pick(user, ['_id', 'status', 'role'])));
}

async function saveAccessToken(userId, deviceId, accessToken) {
  await authenticateStore.hSet(`user:${userId}:tokens`, deviceId, accessToken);
}

async function removeAccessToken(userId, deviceId) {
  await authenticateStore.hDel(`user:${userId}:tokens`, deviceId);
}

async function getAccessToken(userId, deviceId) {
  const accessToken = await authenticateStore.hGet(`user:${userId}:tokens`, deviceId);
  return accessToken;
}

async function removeAllAccessToken(userId) {
  await authenticateStore.del(`user:${userId}:tokens`);
}

module.exports = {
  getCachedUserById,
  cacheUser,
  saveAccessToken,
  removeAccessToken,
  getAccessToken,
  removeAllAccessToken,
};
