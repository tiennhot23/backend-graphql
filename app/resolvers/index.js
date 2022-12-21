const queryResolver = require('./query');
const mutationResolver = require('./mutation');

module.exports = {
  Query: queryResolver,
  Mutation: mutationResolver,
};
