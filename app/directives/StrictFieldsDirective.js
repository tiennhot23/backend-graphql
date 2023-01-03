const _ = require('lodash');
const { SchemaDirectiveVisitor } = require('apollo-server-express');
const { defaultFieldResolver } = require('graphql');

class StrictFieldsDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field, details) {
    this.wrapFields(details.objectType);
    field.strictFields = this.args.strictFields;
  }

  wrapFields(objectType) {
    if (objectType._wrapped) return;
    objectType._wrapped = true;

    const fields = objectType.getFields();

    Object.keys(fields).forEach(fieldName => {
      const field = fields[fieldName];
      const { resolve = defaultFieldResolver } = field;
      field.resolve = async (...args) => {
        const { strictFields } = field;

        if (!strictFields || strictFields.length === 0) {
          return resolve.apply(this, args);
        }

        const parent = args[0];
        if (!_.has(parent, strictFields)) {
          throw new Error(`Require some strict fields: ${strictFields}`);
        }

        return resolve.apply(this, args);
      };
    });
  }
}

module.exports = StrictFieldsDirective;
