const userBatch = require('./user');
const postBatch = require('./post');
const clapBatch = require('./clap');

module.exports = {
  ...userBatch,
  ...postBatch,
  ...clapBatch,
};
