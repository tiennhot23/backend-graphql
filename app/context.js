/* eslint-disable no-unused-vars */
const _ = require('lodash');
const { parse } = require('graphql');
const { AuthenticationError, ForbiddenError } = require('apollo-server-express');
const { getSession, removeSession, getCachedUserById } = require('./datasources/utils/controllers');
const { createLoader } = require('./loaders');

async function createContext({ req }) {
  const context = {};
  const token = req.headers.authorization;
  if (token) {
    const userId = token.split(':')[1];
    const role = await getSession(token);

    if (!role) {
      throw new AuthenticationError('Cannot authorized. Please login again');
    }

    context.signature = {
      _id: userId,
      role,
      token,
    };
  }

  const { query } = req.body;
  const ast = parse(`${query}`);
  const topFields = ast.definitions[0]
    .selectionSet
    .selections
    .map(field => field.name.value);

  const adminOnlyFields = ['user', 'disableUser'];
  const authFields = ['me', 'user', 'disableUser', 'logout', 'follow', 'unfollow', 'createPost', 'updatePost', 'deletePost', 'hidePost', 'clapPost', 'unclapPost', 'comment', 'updateComment', 'reply', 'deleteComment'];

  if (_.difference(topFields, authFields).length !== topFields.length) { // some fields in topFields is in authFields
    if (!context.signature) {
      throw new AuthenticationError('No auth');
    }
    if (_.difference(topFields, adminOnlyFields).length !== topFields.length) { // some fields is in adminOnlyFields
      if (context.signature.role !== 'Admin') {
        throw new ForbiddenError('No permission');
      }
    }
  }

  context.loaders = createLoader();

  return context;
}

module.exports = createContext;
