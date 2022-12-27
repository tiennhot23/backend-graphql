const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const { UserModel, FollowModel } = require('../../models');
const { LoginResponse, GeneralResponse } = require('../../utils/responses');
const {
  cacheUser,
  saveAccessToken,
  removeAccessToken,
  removeAllAccessToken,
  getCachedUserById,
} = require('../../utils/controllers');
const { hash: hashConfig } = require('../../../config');

async function login({ username, password }, { res }) {
  const user = await UserModel.findOne({ username }, 'password status').lean();
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error('Username or password not match');
  }

  if (user.status !== 'Active') {
    throw new Error(' User disabled');
  }

  const deviceId = uuidv4();
  const accessToken = uuidv4();
  res.cookie('uid', user._id.toHexString());
  res.cookie('deviceId', deviceId);

  await saveAccessToken(user._id, deviceId, accessToken);

  return new LoginResponse(true, 'Logged in', accessToken);
}

async function createUser({ email, username, password }) {
  if (await UserModel.exists({ $or: [{ email }, { username }] })) {
    throw new Error('Email or username is already used');
  }
  const hashPassword = await bcrypt.hash(password, hashConfig.saltRound);
  const user = await UserModel.create({ email, username, password: hashPassword });

  await cacheUser(user);

  return user;
}

async function logout(args, { req, res }) {
  const { uid, deviceId } = req.cookie;
  await removeAccessToken(uid, deviceId);

  res.clearCookie('uid');
  res.clearCookie('deviceId');

  return new GeneralResponse(true, 'Logged out');
}

async function disableUser({ _id }) {
  const user = await UserModel.findOneAndUpdate(
    { _id },
    { status: 'Deactivated' },
    { new: true, projection: '_id status role' },
  ).lean();

  if (!user) throw new Error('Invalid user');

  await cacheUser(user);
  await removeAllAccessToken(_id);

  return new GeneralResponse(true, 'Disabled user');
}

async function followUser({ followee: followeeId }, { authUser }) {
  const followee = await getCachedUserById(followeeId);
  if (!followee) {
    throw new Error('Invalid user');
  }
  const result = await FollowModel.updateOne(
    { followee: followeeId, follower: authUser._id },
    { followee: followeeId, follower: authUser._id },
    { upsert: true },
  );

  if (result.matchedCount === 1) {
    return new GeneralResponse(false, 'User had been followed');
  }
  return new GeneralResponse(true, 'Follow user successful');
}

async function unfollowUser({ followee: followeeId }, { authUser }) {
  const result = await FollowModel.deleteOne(
    { followee: followeeId, follower: authUser._id },
  );

  if (result.deletedCount === 0) {
    return new GeneralResponse(false, 'User hadn\'t been followed');
  }
  return new GeneralResponse(true, 'Unfollow user successful');
}

module.exports = { login, createUser, logout, disableUser, followUser, unfollowUser };
