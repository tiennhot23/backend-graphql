const { UserModel } = require('../../models');
const { gqlSelectedField } = require('../../utils/helpers');

async function getMe(args, { authUser }) {
  return authUser;
}

async function getUser({ input }, { authUser }, info) {
  if (authUser.role !== 'Admin') {
    throw new Error('Forbidden');
  }

  // TODO - validate empty input

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

module.exports = { getMe, getUser, getUsers };
