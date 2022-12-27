const { CommentModel } = require('../../models');
const { GeneralResponse } = require('../../utils/responses');
const { gqlSelectedField } = require('../../utils/helpers');
const { getCachedPostById } = require('../../utils/controllers');

async function createComment({ input }, { authUser }) {
  const { postId, title, content } = input;

  const post = await getCachedPostById(postId);
  if (!post) throw new Error('Invalid post');

  const comment = await CommentModel.create({
    post: postId,
    user: authUser._id,
    title,
    content,
  });

  return comment;
}

async function updateComment({ input }, { authUser }, info) {
  const { commentId, title, content } = input;

  const projection = gqlSelectedField.selectTopFields(info);
  const comment = await CommentModel.findOneAndUpdate(
    { _id: commentId, user: authUser._id },
    { title, content },
    { new: true, projection },
  ).lean();

  return comment;
}

async function deleteComment({ _id }, { authUser }) {
  await CommentModel.deleteMany({
    $or: [
      { _id, user: authUser._id },
      { parent: _id },
    ],
  });

  // NOTE - not delete replies of replies

  return new GeneralResponse(true, 'Deleted comment');
}

async function replyComment({ input }, { authUser }) {
  const { commentId: parentCommentId, title, content } = input;

  const parentComment = await CommentModel.findById(parentCommentId, 'post').lean();
  if (!parentComment) {
    throw new Error('Invalid parent comment');
  }

  const comment = await CommentModel.create({
    post: parentComment.post,
    user: authUser._id,
    parent: parentCommentId,
    title,
    content,
  });

  return comment;
}

module.exports = { createComment, updateComment, deleteComment, replyComment };
