const server = require('./server');
const mongodb = require('./mongodb');
const redis = require('./redis');

module.exports = {
  ...server,
  ...mongodb,
  ...redis,
};
