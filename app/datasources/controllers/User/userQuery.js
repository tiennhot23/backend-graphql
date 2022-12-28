const { UserModel, FollowModel } = require('../../models');
const { gqlSelectedField } = require('../../utils/helpers');

async function getMe(args, { authUser }) {
  const user = await UserModel.findById(authUser._id).lean();
  return user;
}

async function getUser({ input }, __, info) {
  const { _id, username, email, name: lastName } = input;
  const projection = gqlSelectedField.selectTopFields(info);
  const user = await UserModel.findOne({ _id, username, email, lastName }, projection).lean();

  return user;
}

async function getUsers({ name = '' }, context, info) {
  const projection = gqlSelectedField.selectTopFields(info);
  const users = await UserModel.find({
    $or: [
      { firstName: new RegExp(name, 'i') },
      { lastName: new RegExp(name, 'i') },
    ],
  }, projection).lean();

  return users;
}

async function getFollowerCount({ _id }) {
  const result = await FollowModel.aggregate([
    { $match: { followee: _id } },
    { $count: 'followerCount' },
    { $project: { _id: 0, followerCount: 1 } },
  ]);
  const followerCount = result[0] ? result[0].followerCount : 0;

  return followerCount;
}

module.exports = { getMe, getUser, getUsers, getFollowerCount };
