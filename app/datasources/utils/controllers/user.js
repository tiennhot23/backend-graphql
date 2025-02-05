/* eslint-disable no-await-in-loop */
const _ = require('lodash');
const { UserModel } = require('../../models');
const { authenticateStore, cachingStore } = require('../redis/stores');
const { redisHelper } = require('../helpers');

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

async function saveSession(token, role) {
  await authenticateStore.set(token, role, { EX: 86400 });
}

async function removeSession(token) {
  await authenticateStore.del(token);
}

async function getSession(token) {
  const role = await authenticateStore.get(token);
  return role;
}

async function removeAllSession(userId) {
  const keys = await redisHelper.keyScan(authenticateStore, `*:${userId}`);
  await authenticateStore.del(keys);
}

module.exports = {
  getCachedUserById,
  cacheUser,
  saveSession,
  removeSession,
  getSession,
  removeAllSession,
};
