const server = require('./server');
const mongo = require('./mongo');
const redis = require('./redis');

module.exports = {
  ...server,
  ...mongo,
  ...redis,
};
