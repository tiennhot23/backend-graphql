/* eslint-disable no-unused-vars */
const _ = require('lodash');
const { parse } = require('graphql');
const { AuthenticationError, ForbiddenError } = require('apollo-server-express');
const { getAccessToken, removeAccessToken, getCachedUserById } = require('./datasources/utils/controllers');

async function createContext({ req, res }) {
  const context = {
    req,
    res,
  };
  const { uid, deviceId } = req.cookie;
  const authHeader = req.headers.authorization;
  const authToken = authHeader && authHeader.split(' ')[1];
  if (uid && deviceId && authToken) {
    const token = await getAccessToken(uid, deviceId);

    if (!token || token !== authToken) {
      await removeAccessToken(uid, deviceId);
      res.clearCookie('uid');
      res.clearCookie('deviceId');
      throw new AuthenticationError('[UNUSUAL REQUEST] Cannot authorized. Please login again');
    }

    const authUser = await getCachedUserById(uid);
    if (!authUser || authUser.status !== 'Active') {
      throw new AuthenticationError('Cannot authorized');
    }
    context.authUser = authUser;
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
  } else if (!context.authUser) { // no auth
    throw new AuthenticationError('No auth');
  } else if (_.difference(topFields, adminOnlyFields).length === topFields.length) {
    // all fields is not in adminOnlyFields
  } else if (context.authUser.role !== 'Admin') {
    throw new ForbiddenError('Have no permission');
  }

  return context;
}

module.exports = createContext;
