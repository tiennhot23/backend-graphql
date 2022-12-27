const userController = require('./User');
const postController = require('./Post');
const clapController = require('./Clap');

module.exports = {
  ...userController,
  ...postController,
  ...clapController,
};
