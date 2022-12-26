const queryResolver = require('./query');
const mutationResolver = require('./mutation');
const scalarResolver = require('./scalar');

module.exports = {
  Query: queryResolver,
  Mutation: mutationResolver,
  ...scalarResolver,
};
