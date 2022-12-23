const { PostModel } = require('../../models');
const { gqlSelectedField } = require('../../utils/helpers');

async function getPost({ _id }, context, info) {
  const projection = gqlSelectedField.selectTopFields(info);
  const post = await PostModel.findById(_id, projection).lean();

  return post;
}

async function getPosts({ input }, context, info) {
  const { title, limit, offset } = input;
  const projection = gqlSelectedField.selectTopFields(info);
  const posts = await PostModel.find({ title: new RegExp(title, 'i') }, projection)
    .skip(offset).limit(limit).lean();

  return posts;
}

// async function getPostClaps({ _id }, args, { loaders }) {
//   const { userLoader } = loaders;
//   return userLoader.loadMany(claps);
// }

// async function getCreator({ creator }, args, { loaders }) {
//   const { userLoader } = loaders;
//   return userLoader.load(creator);
// }

module.exports = { getPost, getPosts };
