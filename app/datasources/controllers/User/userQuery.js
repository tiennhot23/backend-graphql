const { UserModel, FollowModel } = require('../../models');
const { gqlSelectedField } = require('../../utils/helpers');

async function getMe(args, context, info) {
  try {
    const { signature } = context;
    const { _id } = signature;
    const user = await UserModel.findById(_id).lean();
    return user;
  } catch (error) {
    logger.error('get me error', { error: error.stack });
    throw error;
  }
}

async function getUser(args, context, info) {
  try {
    const { input } = args;
    const { _id: userId, username, email, name: lastName } = input;
    const projection = gqlSelectedField.selectTopFields(info);
    const user = await UserModel.findOne({
      _id: userId,
      username,
      email,
      lastName,
    }, projection).lean();

    return user;
  } catch (error) {
    logger.error('get user error', { error: error.stack });
    throw error;
  }
}

async function getUsers(args, context, info) {
  try {
    const { name = '' } = args;
    const projection = gqlSelectedField.selectTopFields(info);
    const users = await UserModel.find({
      $or: [
        { firstName: new RegExp(name, 'i') },
        { lastName: new RegExp(name, 'i') },
      ],
    }, projection).lean();

    return users;
  } catch (error) {
    logger.error('get users error', { error: error.stack });
    throw error;
  }
}

async function getFollowerCount(args) {
  try {
    const { _id: userId } = args;

    const result = await FollowModel.aggregate([
      { $match: { followee: userId } },
      { $count: 'followerCount' },
      { $project: { _id: 0, followerCount: 1 } },
    ]);
    const followerCount = result[0] ? result[0].followerCount : 0;

    return followerCount;
  } catch (error) {
    logger.error('get follower count error', { error: error.stack });
    throw error;
  }
}

module.exports = { getMe, getUser, getUsers, getFollowerCount };
