const queryResolver = require('./query');
const mutationResolver = require('./mutation');
const scalarResolver = require('./scalar');
const postResolver = require('./post');
const userResolver = require('./user');
const commentResolver = require('./comment');

module.exports = {
  ...scalarResolver,
  Query: queryResolver,
  Mutation: mutationResolver,
  Post: postResolver,
  User: userResolver,
  Comment: commentResolver,
};
