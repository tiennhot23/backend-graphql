const queries = require('./userQuery');
const commands = require('./userCommand');

module.exports = {
  ...queries,
  ...commands,
};
