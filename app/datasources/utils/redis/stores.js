const redis = require('redis');
const config = require('../../../config');

const authenticateStore = redis.createClient(config.redisDbs.authDb);
const cachingStore = redis.createClient(config.redisDbs.cacheDb);

authenticateStore.connect();
cachingStore.connect();

module.exports = {
  authenticateStore,
  cachingStore,
};
