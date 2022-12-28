const userUtils = require('./user');
const postUtils = require('./post');
const clapUtils = require('./clap');

module.exports = {
  ...userUtils,
  ...postUtils,
  ...clapUtils,
};
