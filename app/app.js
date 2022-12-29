const express = require('express');
const { ApolloServer, makeExecutableSchema, gql } = require('apollo-server-express');

const typeDefs = require('./schemas');
const resolvers = require('./resolvers');
const datasources = require('./datasources');
const createContext = require('./context');
const directives = require('./directives');

const app = express();

const server = new ApolloServer({
  schema: makeExecutableSchema({
    typeDefs: gql`${typeDefs}`,
    resolvers,
    schemaDirectives: directives,
  }),
  dataSources: datasources,
  context: createContext,
});

server.applyMiddleware({ app, path: '/' });
module.exports = app;
