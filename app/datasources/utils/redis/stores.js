const redis = require('redis');
const bluebird = require('bluebird');

const config = require('../../../config');

bluebird.promisifyAll(redis.RedisClient.prototype);

const authenticateStore = redis.createClient(config.redisDbs.authDb);

module.exports = {
  authenticateStore,
};
