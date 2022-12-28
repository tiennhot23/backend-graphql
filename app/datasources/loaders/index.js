const _ = require('lodash');
const DataLoader = require('dataloader');
const { UserModel, FollowModel } = require('../models');

const userLoader = new DataLoader(async keys => {
  const userIds = _.uniqWith(keys, _.isEqual);
  const users = await UserModel.find({ _id: { $in: userIds } }, '-password').lean();
  const mapUser = _.reduce(users, (result, user) => {
    result[user._id] = user;
    return result;
  }, {});
  return keys.map(userId => (mapUser[userId] || null));
});

module.exports = {
  userLoader,
};
