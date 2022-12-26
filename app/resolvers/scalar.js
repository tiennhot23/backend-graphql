const _ = require('lodash');
const { GraphQLScalarType, Kind } = require('graphql');

const dateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'Date custom scalar type',
  serialize(value) { // convert outcoming result (date to int)
    if (_.isString(value)) {
      return (new Date(value)).getTime();
    }
    return value.getTime();
  },
  parseValue(value) { // parse incoming input (int to date)
    return new Date(value);
  },
  parseLiteral(ast) { // parse in ast building (string to int then to date)
    if (ast.kind === Kind.INT) {
      return new Date(parseInt(ast.value, 10));
    }
    return null; // Invalid hard-coded value (not an integer)
  },
});

const resolvers = {
  DateTime: dateTimeScalar,
};

module.exports = resolvers;
