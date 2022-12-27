const { PostModel, ClapModel } = require('../../models');
const { gqlSelectedField } = require('../../utils/helpers');
const { cachingStore } = require('../../utils/redis/stores');

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

async function getPostClapCount({ _id }, __, ___) {
  const cachedClapCount = await cachingStore.get(`post:${_id}:clapCount`);
  if (!cachedClapCount || cachedClapCount < 1000) {
    const { clapCount } = await ClapModel.aggregate([
      { $match: { post: _id } },
      { $group: { _id: null, clapCount: { $sum: '$count' } } },
      { $project: { _id: 0, clapCount: 1 } },
    ]);

    await cachingStore.set(`post:${_id}:clapCount`, clapCount, { EX: 3600 });
    if (clapCount > 1000) await cachingStore.zAdd('post:topClapCount', clapCount, _id);

    return clapCount;
  }
  return cachedClapCount;
}

async function getPostOwner({ owner: ownerId }, { loader }, ____) {
  const { userLoader } = loader;

  return userLoader.load(ownerId);
}

module.exports = { getPost, getPosts, getPostClapCount, getPostOwner };
