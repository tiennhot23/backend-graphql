const grapqlFields = require('graphql-fields');

function selectTopFields(info) {
  return Object.keys(grapqlFields(info));
}

module.exports = {
  selectTopFields,
};
