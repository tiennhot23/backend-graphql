const queryResolver = require('./query');
const mutationResolver = require('./mutation');
const postResolver = require('./post');
const userResolver = require('./user');
const commentResolver = require('./comment');

const { dateTimeScalar } = require('./scalar');

module.exports = {
  Query: queryResolver,
  Mutation: mutationResolver,
  Post: postResolver,
  User: userResolver,
  Comment: commentResolver,

  DateTime: dateTimeScalar,
};
