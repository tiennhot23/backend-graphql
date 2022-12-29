const userBatch = require('./user');
const postBatch = require('./post');

module.exports = {
  ...userBatch,
  ...postBatch,
};
