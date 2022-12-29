const DataLoader = require('dataloader');
const { batchUsers, batchPosts } = require('./datasources/loaders');

function createLoader() {
  return {
    userLoader: new DataLoader(keys => batchUsers(keys)),
    postLoader: new DataLoader(keys => batchPosts(keys)),
  };
}

module.exports = { createLoader };
