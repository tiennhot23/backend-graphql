const queries = require('./clapQuery');
const commands = require('./clapCommand');

module.exports = {
  ...queries,
  ...commands,
};
