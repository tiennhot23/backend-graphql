const queries = require('./commentQuery');
const commands = require('./commentCommand');

module.exports = {
  ...queries,
  ...commands,
};
