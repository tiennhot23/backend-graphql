const redis = require('redis');
const bluebird = require('bluebird');
const _ = require('lodash');

const config = require('../../../config');

bluebird.promisifyAll(redis.RedisClient.prototype);

const authenticateStore = redis.createClient(config.redisDbs.authDb);
const cachingStore = redis.createClient(config.redisDbs.cacheDb);

// const userCacheFields = ['_id', 'email', 'name', 'avatar', 'locked', 'role'];
// const postCacheFields = ['_id', 'title', 'previewImage', 'creator', 'publishTime', 'clapCount'];
// const typeCache = {
//   user: userCacheFields,
//   post: postCacheFields,
// };
// async function runJSON(type, command, ...params) {
//   const result = await redis.call(command, ...params.map(val => (
//     _.isObject(val) && typeCache[type]
//       ? JSON.stringify(_.pick(val, typeCache[type]))
//       : val || ''
//   )));
//   return JSON.parse(result);
// }

// async function run(command, ...params) {
//   const result = await redis.call(command, ...params);
//   return result;
// }

// cachingStore.run = run;
// cachingStore.runJSON = runJSON;

// authenticateStore.run = run;
// authenticateStore.runJSON = runJSON;

module.exports = {
  authenticateStore,
  cachingStore,
};
