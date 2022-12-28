/* eslint-disable no-await-in-loop */
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

async function saveSession(userId, token, role) {
  await authenticateStore.set(`${token}:${userId}`, role, { EX: 86400 });
}

async function removeSession(userId, token) {
  await authenticateStore.del(`${token}:${userId}`);
}

async function getSession(userId, token) {
  const role = await authenticateStore.get(`${token}:${userId}`);
  return role;
}

async function removeAllSession(userId) {
  const keys = await keyScan(`*:${userId}`);
  await authenticateStore.del(keys);
}

async function keyScan(pattern, count = 20) {
  const result = [];
  let cursor = 0;
  do {
    const [curs, keys] = await authenticateStore.scan(cursor, 'MATCH', pattern, 'COUNT', count);
    cursor = curs;
    result.push(...keys);
  } while (cursor !== '0');
  return result;
}

module.exports = {
  getCachedUserById,
  cacheUser,
  saveSession,
  removeSession,
  getSession,
  removeAllSession,
};
