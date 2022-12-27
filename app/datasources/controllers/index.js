const userController = require('./User');
const postController = require('./Post');
const clapController = require('./Clap');
const commentController = require('./Comment');

module.exports = {
  ...userController,
  ...postController,
  ...clapController,
  ...commentController,
};
