const { ClapModel } = require('../../models');
const { cachingStore } = require('../redis/stores');

async function getCachedClapCount(type, _id) {
  let cachedClapCount = 0;
  switch (type) {
    case 'post':
      cachedClapCount = await cachingStore.get(`post:${_id}:clapCount`);
      break;
    case 'comment':
      cachedClapCount = await cachingStore.get(`comment:${_id}:clapCount`);
      break;
    default:
      break;
  }
  return cachedClapCount;
}

async function cacheClapCount(type, _id, count) {
  switch (type) {
    case 'post':
      await cachingStore.set(`post:${_id}:clapCount`, count, { EX: 3600 });
      if (count > 1000) await cachingStore.zAdd('post:topClapCount', count, _id);
      break;
    case 'comment':
      await cachingStore.set(`comment:${_id}:clapCount`, count, { EX: 3600 });
      break;
    default:
      break;
  }
}

async function calculateClapCount(type, _id) {
  let clapCount = 0;
  switch (type) {
    case 'post': {
      const result = await ClapModel.aggregate([
        { $match: { post: _id } },
        { $group: { _id: null, clapCount: { $sum: '$count' } } },
        { $project: { _id: 0, clapCount: 1 } },
      ]);
      clapCount = result[0].clapCount;
      break;
    }
    case 'comment': {
      const result = await ClapModel.aggregate([
        { $match: { comment: _id } },
        { $group: { _id: null, clapCount: { $sum: '$count' } } },
        { $project: { _id: 0, clapCount: 1 } },
      ]);
      clapCount = result[0].clapCount;
      break;
    }
    default:
      break;
  }

  return clapCount;
}

module.exports = {
  getCachedClapCount,
  cacheClapCount,
  calculateClapCount,
};
