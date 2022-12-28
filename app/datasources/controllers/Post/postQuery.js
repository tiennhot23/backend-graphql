const { PostModel } = require('../../models');
const {
  filterOwnerPosts,
  filterPosts,
  getCachedClapCount,
  cacheClapCount,
  calculateClapCount,
} = require('../../utils/controllers');
const { gqlSelectedField } = require('../../utils/helpers');

async function getPost({ _id }, context, info) {
  const projection = gqlSelectedField.selectTopFields(info);
  const post = await PostModel.findById(_id, projection).lean();

  return post;
}

async function getPosts({ input }, context, info) {
  const { owner, title, limit, offset } = input;
  const projection = gqlSelectedField.selectTopFields(info);
  const posts = owner ? await filterOwnerPosts(owner, { title, limit, offset }, projection)
    : await filterPosts({ title, limit, offset }, projection);
  return posts;
}

async function getPostClapCount({ _id }) {
  const cachedClapCount = await getCachedClapCount('post', _id);
  if (!cachedClapCount || cachedClapCount < 1000) {
    const clapCount = await calculateClapCount('post', _id);

    await cacheClapCount('post', _id, clapCount);

    return clapCount;
  }
  return cachedClapCount;
}

async function getPostOwner({ owner: ownerId }, __, { dataSources }, ____) {
  const { userLoader } = dataSources.loaders;

  return userLoader.load(ownerId);
}

module.exports = { getPost, getPosts, getPostClapCount, getPostOwner };
