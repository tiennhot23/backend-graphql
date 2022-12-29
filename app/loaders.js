const DataLoader = require('dataloader');
const {
  batchUsers,
  batchPosts,
  batchFollowCountOfUser,
  batchClapCountOfPost,
  batchClapCountOfComment,
} = require('./datasources/loaders');

function createLoader() {
  return {
    userLoader: new DataLoader(batchUsers),
    followCountLoader: new DataLoader(batchFollowCountOfUser),
    postLoader: new DataLoader(batchPosts),
    postClapCountLoader: new DataLoader(batchClapCountOfPost),
    commentClapCountLoader: new DataLoader(batchClapCountOfComment),
  };
}

module.exports = { createLoader };
