const userUtils = require('./user');
const postUtils = require('./post');

module.exports = {
  ...userUtils,
  ...postUtils,
};
