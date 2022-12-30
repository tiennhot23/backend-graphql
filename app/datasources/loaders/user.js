const _ = require('lodash');
const { default: mongoose } = require('mongoose');
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
    { $match: { followee: { $in: userIds.map(userId => mongoose.Types.ObjectId(userId)) } } },
    { $group: {
      _id: '$followee',
      followerCount: { $count: {} },
    } },
  ]);

  const mapUser = _.reduce(followees, (result, followee) => {
    result[followee._id] = followee.followerCount;
    return result;
  }, {});
  return userIds.map(userId => (mapUser[userId] || 0));
};

const batchFollowersOfUser = async userIds => {
  const followees = await FollowModel.aggregate([
    { $match: { followee: { $in: userIds.map(userId => mongoose.Types.ObjectId(userId)) } } },
    { $group: {
      _id: '$followee',
      // followerCount: { $count: {} },
      followers: { $push: '$follower' },
    } },
  ]);

  const mapUser = _.reduce(followees, (result, followee) => {
    result[followee._id] = followee.followers;
    return result;
  }, {});
  return userIds.map(userId => (mapUser[userId] || []));
};

module.exports = {
  batchUsers,
  batchFollowCountOfUser,
  batchFollowersOfUser,
};
