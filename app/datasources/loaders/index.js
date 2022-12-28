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

const followCountLoader = new DataLoader(async keys => {
  const userIds = _.uniqWith(keys, _.isEqual);
  const result = await FollowModel.aggregate([
    { $match: { followee: { $in: userIds } } },
    { $group: { _id: { followee: '$followee' }, followerCount: { $count: 'followerCount' } } },
    { $project: { _id: 0, followerCount: 1 } },
  ]);
  const followerCount = result[0] ? result[0].followerCount : 0;
});

module.exports = {
  userLoader,
};
