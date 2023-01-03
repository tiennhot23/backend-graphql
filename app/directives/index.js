const AuthDirective = require('./AuthDirective');
const StrictFieldsDirective = require('./StrictFieldsDirective');

module.exports = {
  auth: AuthDirective,
  authorized: AuthDirective,
  authenticated: AuthDirective,
  strictFields: StrictFieldsDirective,
};
