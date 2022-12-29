/* eslint-disable no-unused-vars */
const _ = require('lodash');
const { parse } = require('graphql');
const { AuthenticationError, ForbiddenError } = require('apollo-server-express');
const { getSession, removeSession, getCachedUserById } = require('./datasources/utils/controllers');
const { createLoader } = require('./loaders');
/* TODO -
  trycach trong conntroller
  map args trong controller
  han che throw error voi nhung error da handle dc
  name of batch function: batch cai gi cua cai gi
  trycactch trong loader
  dung toString khi truyen id vao batchingFn
*/
async function createContext({ req }) {
  const context = {};
  const token = req.headers.authorization;
  if (token) {
    const userId = token.split(':')[1];
    const role = await getSession(token);

    if (!role) {
      throw new AuthenticationError('Cannot authorized. Please login again');
    }

    const { query } = req.body;
    const ast = parse(`${query}`);
    const topFields = ast.definitions[0]
      .selectionSet
      .selections
      .map(field => field.name.value);

    const adminOnlyFields = ['user', 'disableUser'];
    const authFields = ['me', 'user', 'disableUser', 'logout', 'follow', 'unfollow', 'createPost', 'updatePost', 'deletePost', 'hidePost', 'clapPost', 'unclapPost', 'comment', 'updateComment', 'reply', 'deleteComment'];

    if (_.difference(topFields, authFields).length === topFields.length) {
      // all fields in topFields is not in authFields
    } else if (_.difference(topFields, adminOnlyFields).length === topFields.length) {
      // all fields is not in adminOnlyFields
    } else if (role !== 'Admin') {
      throw new ForbiddenError('No permission');
    }

    context.signature = {
      _id: userId,
      role,
      token,
    };
  }

  context.loaders = createLoader();

  return context;
}

module.exports = createContext;
