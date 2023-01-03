const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const { UserModel, FollowModel } = require('../../models');
const {
  saveSession,
  removeSession,
  removeAllSession,
} = require('../../utils/controllers');
const { hash: hashConfig } = require('../../../config');

async function login(args, context, info) {
  try {
    const { username, password } = args;
    const user = await UserModel.findOne({ username }, 'password role status').lean();
    if (!user
        || !(await bcrypt.compare(password, user.password))
        || user.status !== 'Active') {
      return {
        isSuccess: false,
        message: 'Invalid credentals',
      };
    }

    const token = `${uuidv4()}:${user._id}`;
    await saveSession(token, user.role);

    return {
      isSuccess: true,
      message: 'Login success',
      token,
    };
  } catch (error) {
    logger.error('login error', { error: error.stack });
    throw error;
  }
}

async function createUser(args, context, info) {
  try {
    const { email, username, password } = args;
    if (await UserModel.exists({ $or: [{ email }, { username }] })) {
      throw new Error('Email or username is already used');
    }
    const hashPassword = await bcrypt.hash(password, hashConfig.saltRound);
    const user = await UserModel.create({ email, username, password: hashPassword });

    return user;
  } catch (error) {
    logger.error('create user error', { error: error.stack });
    throw error;
  }
}

async function logout(args, context, info) {
  try {
    const { signature } = context;
    const { token } = signature;
    await removeSession(token);

    return {
      isSuccess: true,
      message: 'Logout success',
    };
  } catch (error) {
    logger.error('logout error', { error: error.stack });
    throw error;
  }
}

async function disableUser(args, context, info) {
  try {
    const { _id } = args;
    const result = await UserModel.updateOne(
      { _id },
      { status: 'Deactivated' },
    );
    if (result.modifiedCount === 0) throw new Error('Invalid user');

    await removeAllSession(_id);

    return {
      isSuccess: true,
      message: 'User has been disabled',
    };
  } catch (error) {
    logger.error('disable user error', { error: error.stack });
    throw error;
  }
}

async function followUser(args, context, info) {
  try {
    const { followee: followeeId } = args;
    const { signature } = context;
    const { _id } = signature;

    const followeeDoc = await UserModel.countDocuments({ _id: followeeId });
    if (followeeDoc === 0) {
      return {
        isSuccess: false,
        message: 'Invalid user',
      };
    }
    const result = await FollowModel.updateOne(
      { followee: followeeId, follower: _id },
      { followee: followeeId, follower: _id },
      { upsert: true },
    );

    if (result.matchedCount === 1) {
      return {
        isSuccess: false,
        message: 'User had been followed',
      };
    }
    return {
      isSuccess: true,
      message: 'Follow user successful',
    };
  } catch (error) {
    logger.error('follow user error', { error: error.stack });
    throw error;
  }
}

async function unfollowUser(args, context, info) {
  try {
    const { followee: followeeId } = args;
    const { signature } = context;
    const { _id } = signature;
    const result = await FollowModel.deleteOne(
      { followee: followeeId, follower: _id },
    );

    if (result.deletedCount === 0) {
      return {
        isSuccess: false,
        message: 'User hadn\'t been followed',
      };
    }
    return {
      isSuccess: true,
      message: 'Unfollow user successful',
    };
  } catch (error) {
    logger.error('unfollow user error', { error: error.stack });
    throw error;
  }
}

module.exports = { login, createUser, logout, disableUser, followUser, unfollowUser };
