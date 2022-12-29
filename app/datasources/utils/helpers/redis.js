/* eslint-disable no-await-in-loop */
async function keyScan(store, pattern, count = 20) {
  const result = [];
  let cursor = 0;
  do {
    const [curs, keys] = await store.scan(cursor, 'MATCH', pattern, 'COUNT', count);
    cursor = curs;
    result.push(...keys);
  } while (cursor !== '0');
  return result;
}

module.exports = {
  keyScan,
};
