const server = require('./server');
const mongodb = require('./mongodb');
const redis = require('./redis');
const auth = require('./auth');

module.exports = {
  ...server,
  ...mongodb,
  ...redis,
  ...auth,
};
