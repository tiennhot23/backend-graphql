const userController = require('./User');
const postController = require('./Post');

module.exports = {
  ...userController,
  ...postController,
};
