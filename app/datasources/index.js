const mongoose = require('mongoose');
const config = require('../config');

require('./models');
const controllers = require('./controllers');
const loaders = require('./loaders');

if (config.nodeEnv !== 'test') {
  mongoose.set('strictQuery', false);
  mongoose.set('debug', (collection, method, query, doc) => {
    logger.info(`MONGODB::${collection}.${method} - query:${JSON.stringify(query)} - doc:${JSON.stringify(doc)}`);
  });
  mongoose.connect(config.mongo.database, config.mongo.options)
    .then(() => { logger.info('MongoDb connected.'); })
    .catch(error => { logger.error(`MongoDb connection failed. ${error}`); });
}

module.exports = () => ({ ...controllers, loaders });
