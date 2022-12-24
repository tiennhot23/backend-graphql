const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const { UserModel } = require('../../models');
const { LoginResponse, GeneralResponse } = require('../../utils/responses');
const {
  cacheUser,
  saveAccessToken,
  removeAccessToken,
} = require('../../utils/controllers');
const { hash: hashConfig } = require('../../../config');

async function login({ username, password }, { res }) {
  const user = await UserModel.findOne({ username }, 'password').lean();
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error('Username or password not match');
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

module.exports = { login, createUser, logout };
