const _ = require('lodash');
const { UserModel, FollowModel } = require('../models');

const batchUsers = async userIds => {
  const users = await UserModel.find({ _id: { $in: userIds } }, '-password').lean();
  const mapUser = _.reduce(users, (result, user) => {
    result[user._id] = user;
    return result;
  }, {});
  return userIds.map(userId => (mapUser[userId] || null));
};

const batchFollowCountOfUser = async userIds => {
  const followees = await FollowModel.aggregate([
    { $match: { followee: { $in: userIds } } },
    { $group: { _id: '$followee', followerCount: { $count: {} } } },
    { $project: { _id: 1, followerCount: 1 } },
  ]);

  const mapUser = _.reduce(followees, (result, followee) => {
    result[followee._id] = followee.followerCount;
    return result;
  }, {});
  return userIds.map(userId => (mapUser[userId] || null));
};

module.exports = {
  batchUsers,
  batchFollowCountOfUser,
};
