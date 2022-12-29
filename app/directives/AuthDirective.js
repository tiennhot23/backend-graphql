const _ = require('lodash');
const { SchemaDirectiveVisitor, AuthenticationError, ForbiddenError } = require('apollo-server-express');
const { defaultFieldResolver } = require('graphql');

class AuthDirective extends SchemaDirectiveVisitor {
  visitObject(type) {
    this.wrapFields(type);
    type._requiredAuthRole = this.args.requires;
  }

  /**
   * details.objectType is the parent type
   */
  visitFieldDefinition(field, details) {
    this.wrapFields(details.objectType);
    field._requiredAuthRole = this.args.requires;
  }

  wrapFields(objectType) {
    // Mark the GraphQLObjectType object to avoid re-wrapping:
    if (objectType._authFieldsWrapped) return;
    objectType._authFieldsWrapped = true;

    const fields = objectType.getFields();

    Object.keys(fields).forEach(fieldName => {
      const field = fields[fieldName];
      const { resolve = defaultFieldResolver } = field;
      field.resolve = async (...args) => {
        // Get the required Role from the field, if null, get required role from the parent type
        const requiredRoles = field._requiredAuthRole
          || objectType._requiredAuthRole;

        if (!requiredRoles) {
          return resolve.apply(this, args);
        }

        const { signature } = args[2];
        if (!signature) {
          throw new AuthenticationError('Cannot authorized');
        }

        if (!_.includes(requiredRoles, signature.role)) {
          throw new ForbiddenError('Have no permission');
        }

        return resolve.apply(this, args);
      };
    });
  }
}

module.exports = AuthDirective;
