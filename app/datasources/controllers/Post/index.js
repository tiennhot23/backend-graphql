const queries = require('./postQuery');
const commands = require('./postCommand');

module.exports = {
  ...queries,
  ...commands,
};
