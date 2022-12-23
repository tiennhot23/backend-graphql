const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { UserModel } = require('../../models');

const { encrypt: encryptConfig } = require('../../configs');
const { validate, validateAuth, validateUser, validatePassword } = require('../../validations');
const { MutationResponse } = require('../../graphql/types/MutationResponse');

async function login(parent, { email, password }, { req, res, caching }) {
  const { error } = validateAuth({ email, password });
  if (error) throw new AppError(400, error.message);

  const user = await UserModel.findOne({ email }, 'password').lean();
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError(404, 'Username or password not match');
  }

  req.session.userId = user._id;
  const deviceid = uuidv4();
  res.cookie('uid', user._id.toHexString());
  res.cookie('deviceid', deviceid);
  await caching.call('hset', `user:${user._id}:sessions`, `${deviceid}`, `sess:${req.sessionID}`);

  return new MutationResponse('Logged in');
}

async function createUser(parent, { name, email, password, repeatPassword }) {
  const { error } = validate(
    validateUser({ name, email }),
    validatePassword({ password, repeatPassword }),
  );
  if (error) throw new AppError(400, error.message);

  if (await UserModel.exists({ email })) {
    throw new AppError(400, 'Email is already used');
  }
  const hashPassword = await bcrypt.hash(password, encryptConfig.saltRound);
  await UserModel.create({ email, name, password: hashPassword });

  return new MutationResponse('User created');
}

async function logout(parent, args, { req, res, caching, user }) {
  if (!user) throw new AppError(403, 'Please login to continue');
  const { uid, deviceid } = req.cookie;
  await caching.call('hdel', `user:${uid}:sessions`, `${deviceid}`);
  req.session.destroy();
  res.clearCookie('uid');
  res.clearCookie('deviceid');
  res.clearCookie('sid');

  return new MutationResponse('Logged out');
}

module.exports = { login, createUser, logout };
