const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');

const datasources = require('./datasources');
const createContext = require('./context');

const app = express();

const server = new ApolloServer({
  schema: {},
  dataSources: datasources,
  context: createContext,
});

server.applyMiddleware({ app, path: '/' });
module.exports = app;
