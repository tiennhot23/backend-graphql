const _ = require('lodash');
const fs = require('fs');
const path = require('path');

const subDirs = [
  'directives', 'types', 'enums', 'inputs', 'mutations', 'queries', 'responses',
];

const typeDefs = _.map(subDirs, subDir => {
  const schemaPath = path.join(__dirname, subDir);
  return fs.readdirSync(schemaPath).map(file => {
    // ignore file start with "__" or extension is not .graphql
    if (_.startsWith(file, '__') || !_.endsWith(file, '.graphql')) {
      return '';
    }
    // only read graphql file
    const filePath = path.join(schemaPath, file);
    return `${fs.readFileSync(filePath, 'utf8').toString()}`;
  });
});

module.exports = typeDefs;
