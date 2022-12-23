const { UserModel } = require('../../models');
const { cachingStore } = require('../redis/stores');

async function getUserById(userId) {
  const cachedUser = await cachingStore.get(userId);
  if (!cachedUser) {
    const user = await UserModel.findById(userId, '-password').lean();
    if (!user) {
      return null;
    }
    await cachingStore.set(userId, JSON.stringify(user));
    return user;
  }
  return cachedUser;
}

module.exports = {
  getUserById,
};
