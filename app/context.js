/* eslint-disable no-unused-vars */
const _ = require('lodash');
const { parse } = require('graphql');
const { AuthenticationError, ForbiddenError } = require('apollo-server-express');
const { getSession, removeSession, getCachedUserById } = require('./datasources/utils/controllers');

async function createContext({ req, res }) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(':')[0];
    const userId = authHeader.split(':')[0];
    const role = await getSession(userId, token);

    if (!role) {
      throw new AuthenticationError('Cannot authorized. Please login again');
    }

    req.auth = {
      role,
      token,
      userId,
    };

    // const authUser = await getCachedUserById(userId);
    // if (!authUser || authUser.status !== 'Active') {
    //   throw new AuthenticationError('Cannot authorized');
    // }
    // context.authUser = authUser;

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
    // } else if (!context.authUser) { // no auth
    //   throw new AuthenticationError('No auth');
    } else if (_.difference(topFields, adminOnlyFields).length === topFields.length) {
      // all fields is not in adminOnlyFields
    } else if (role !== 'Admin') {
      throw new ForbiddenError('Have no permission');
    }
  }

  return {
    req,
    res,
  };
}

module.exports = createContext;
