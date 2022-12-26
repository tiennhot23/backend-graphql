const resolvers = {
  register: (parent, args, context, info) => context.dataSources.createUser(args, context, info),
  login: (parent, args, context, info) => context.dataSources.login(args, context, info),
  logout: (parent, args, context, info) => context.dataSources.logout(args, context, info),

};

module.exports = resolvers;
