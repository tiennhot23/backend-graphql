const { CommentModel } = require('../../models');
const { gqlSelectedField } = require('../../utils/helpers');

async function getPostComments({ input }, __, info) {
  const { postId, limit = 10, offset = 0 } = input;
  const projection = gqlSelectedField.selectTopFields(info);
  const comments = await CommentModel.find(
    { post: postId },
    projection,
  ).skip(offset).limit(limit).lean();

  return comments;
}

async function getCommentReplies({ input }, __, info) {
  const { commentId, limit = 10, offset = 0 } = input;
  const projection = gqlSelectedField.selectTopFields(info);
  const comments = await CommentModel.find(
    { parent: commentId },
    projection,
  ).skip(offset).limit(limit).lean();

  return comments;
}

async function getCommentUser({ user: userId }, __, { dataSources }, ____) {
  const { userLoader } = dataSources.loaders;
  return userLoader.load(userId);
}

module.exports = {
  getPostComments,
  getCommentReplies,
  getCommentUser,
};
