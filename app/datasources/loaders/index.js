const _ = require('lodash');
const DataLoader = require('dataloader');
const { UserModel } = require('../models');

const userLoader = new DataLoader(async userIds => {
  const users = await UserModel.find({ _id: { $in: userIds } }, '-password').lean();
  const mapUser = _.reduce(users, (result, user) => {
    result[user._id] = user;
    return result;
  }, {});
  return userIds.map(userId => (mapUser[userId] || null));
});

module.exports = {
  userLoader,
};
