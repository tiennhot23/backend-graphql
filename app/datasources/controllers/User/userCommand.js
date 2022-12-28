const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const { UserModel, FollowModel } = require('../../models');
const { LoginResponse, GeneralResponse } = require('../../utils/responses');
const {
  saveSession,
  removeSessionsaveSession,
  removeAllSessionsaveSession,
  getCachedUserById,
} = require('../../utils/controllers');
const { hash: hashConfig } = require('../../../config');

async function login({ username, password }) {
  const user = await UserModel.findOne({ username }, 'password role status').lean();
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error('Username or password not match');
  }

  if (user.status !== 'Active') {
    throw new Error(' User disabled');
  }

  const accessToken = `${uuidv4()}:${user._id}`;

  await saveSession(user._id, accessToken, user.role);

  return new LoginResponse(true, 'Logged in', accessToken);
}

async function createUser({ email, username, password }) {
  if (await UserModel.exists({ $or: [{ email }, { username }] })) {
    throw new Error('Email or username is already used');
  }
  const hashPassword = await bcrypt.hash(password, hashConfig.saltRound);
  const user = await UserModel.create({ email, username, password: hashPassword });

  return user;
}

async function logout(args, { req }) {
  const { userId, token } = req.auth;
  await removeSessionsaveSession(userId, token);

  return new GeneralResponse(true, 'Logged out');
}

async function disableUser({ _id }) {
  const user = await UserModel.findOneAndUpdate(
    { _id },
    { status: 'Deactivated' },
    { new: true, projection: '_id status role' },
  ).lean();

  if (!user) throw new Error('Invalid user');

  await removeAllSessionsaveSession(_id);

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
