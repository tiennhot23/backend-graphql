const queryResolver = require('./query');
const mutationResolver = require('./mutation');
const scalarResolver = require('./scalar');
const postResolver = require('./post');

module.exports = {
  ...scalarResolver,
  Query: queryResolver,
  Mutation: mutationResolver,
  Post: postResolver,
};
